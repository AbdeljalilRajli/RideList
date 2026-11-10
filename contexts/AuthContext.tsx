"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  role: "admin" | "user";
}

export interface ProfileUpdates {
  fullName?: string;
  phoneNumber?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userData: UserData | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<{ needsConfirmation: boolean }>;
  updateProfile: (updates: string | ProfileUpdates) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: (showLoading?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Safe sessionStorage helpers to cache role and eliminate flicker across navigation
const ROLE_CACHE_PREFIX = "ridelist_role_";

function getCachedRole(userId: string): "admin" | "user" | null {
  if (typeof window === "undefined") return null;
  try {
    const val = sessionStorage.getItem(ROLE_CACHE_PREFIX + userId);
    return val === "admin" || val === "user" ? val : null;
  } catch {
    return null;
  }
}

function setCachedRole(userId: string, role: "admin" | "user") {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ROLE_CACHE_PREFIX + userId, role);
  } catch {}
}

function clearCachedRole() {
  if (typeof window === "undefined") return;
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(ROLE_CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    }
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to resolve admin role and user data from Supabase
  const resolveUserData = async (supabaseUser: User | null): Promise<{
    admin: boolean;
    data: UserData | null;
  }> => {
    if (!supabaseUser) {
      return { admin: false, data: null };
    }

    // 1. Check synchronous cache first
    const cached = getCachedRole(supabaseUser.id);
    let admin = cached === "admin";

    // 2. Query 'admins' table from Supabase for definitive source of truth
    try {
      const { data: adminRow } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", supabaseUser.id)
        .maybeSingle();

      admin = Boolean(adminRow);
      setCachedRole(supabaseUser.id, admin ? "admin" : "user");
    } catch {
      // If network fails, retain cached or fallback to false
      if (cached === null) {
        admin = false;
      }
    }

    // 3. Attempt to link past guest bookings if user email is confirmed
    try {
      if (supabaseUser.email_confirmed_at) {
        await supabase.rpc("link_guest_bookings");
      }
    } catch {
      // Non-fatal
    }

    const displayName =
      (supabaseUser.user_metadata?.full_name as string) ||
      (supabaseUser.user_metadata?.name as string) ||
      supabaseUser.email?.split("@")[0] ||
      "User";

    const phoneNumber =
      (supabaseUser.user_metadata?.phone_number as string) ||
      (supabaseUser.user_metadata?.phone as string) ||
      supabaseUser.phone ||
      "";

    const data: UserData = {
      uid: supabaseUser.id,
      email: supabaseUser.email || "",
      displayName,
      phoneNumber,
      role: admin ? "admin" : "user",
    };

    return { admin, data };
  };

  const refreshSession = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (currentUser) {
        // Fast-path: immediately apply cached role to avoid any render flash
        const cachedRole = getCachedRole(currentUser.id);
        if (cachedRole) {
          setIsAdmin(cachedRole === "admin");
        }
      }

      const { admin, data } = await resolveUserData(currentUser);
      setIsAdmin(admin);
      setUserData(data);
    } catch (err) {
      console.error("Error refreshing session:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        const newUser = newSession?.user || null;
        setUser(newUser);

        if (event === "SIGNED_OUT" || !newUser) {
          clearCachedRole();
          setIsAdmin(false);
          setUserData(null);
          setLoading(false);
          return;
        }

        // Apply cached role immediately if available
        const cachedRole = getCachedRole(newUser.id);
        if (cachedRole) {
          setIsAdmin(cachedRole === "admin");
        }

        const { admin, data } = await resolveUserData(newUser);
        setIsAdmin(admin);
        setUserData(data);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setLoading(false);
      throw new Error(error?.message || "Invalid email or password.");
    }

    setUser(data.user);
    setSession(data.session);

    const { admin, data: uData } = await resolveUserData(data.user);
    setIsAdmin(admin);
    setUserData(uData);
    setLoading(false);

    return { isAdmin: admin };
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: displayName.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      throw new Error(error.message || "Failed to create account.");
    }

    // If email confirmation is enabled, session might be null until confirmed
    const needsConfirmation = !data.session;
    return { needsConfirmation };
  };

  const updateProfile = async (updates: string | ProfileUpdates) => {
    const rawUpdates = typeof updates === "string" ? { fullName: updates } : updates;
    const metaUpdates: Record<string, any> = {};

    if (typeof rawUpdates.fullName === "string") {
      const trimmed = rawUpdates.fullName.trim();
      if (!trimmed) throw new Error("Full name cannot be empty.");
      metaUpdates.full_name = trimmed;
    }

    if (typeof rawUpdates.phoneNumber === "string") {
      metaUpdates.phone_number = rawUpdates.phoneNumber.trim();
    }

    const { data, error } = await supabase.auth.updateUser({
      data: metaUpdates,
    });

    if (error) {
      throw new Error(error.message || "Failed to update profile.");
    }

    if (data.user) {
      setUser(data.user);
      setUserData((prev) => {
        const newDisplayName = metaUpdates.full_name || prev?.displayName || "User";
        const newPhone = metaUpdates.phone_number !== undefined ? metaUpdates.phone_number : (prev?.phoneNumber || "");
        return prev
          ? { ...prev, displayName: newDisplayName, phoneNumber: newPhone }
          : {
              uid: data.user.id,
              email: data.user.email || "",
              displayName: newDisplayName,
              phoneNumber: newPhone,
              role: isAdmin ? "admin" : "user",
            };
      });
    }
  };

  const changePassword = async (newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message || "Failed to change password.");
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      clearCachedRole();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setSession(null);
      setUserData(null);
      setIsAdmin(false);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        userData,
        isAdmin,
        loading,
        signIn,
        signUp,
        updateProfile,
        changePassword,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

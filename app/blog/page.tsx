import { notFound } from "next/navigation";

const HIDE_BLOG = true;

export default function BlogIndexPage() {
  // Blog is temporarily hidden from visitors (returns 404); set HIDE_BLOG = false to restore
  if (HIDE_BLOG) {
    notFound();
  }

  return null;
}

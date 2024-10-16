import Link from "next/link";
import Image from "next/image";
import { CustomButton } from "./CustomButton";

const Navbar = () => {
  return (
    <header className="w-full absolute z-10">
      <nav className="max-w-[1440px] mx-auto flex justify-between items-center sm:px-16 px-6 py-4">
        <Link href="/" className="hidden sm:flex justify-center items-center">
          <Image src="/logo.svg" alt="RideList Logo" width={118} height={18} className="object-contain" />
        </Link>

        <div className="flex space-x-6">
          <Link href="#discover" className="text-gray-700 hover:text-indigo-800">About</Link>
          <Link href="#fleet" className="text-gray-700 hover:text-indigo-800">Fleet</Link>
          <Link href="#deals" className="text-gray-700 hover:text-indigo-800">Deals</Link>
          <Link href="#contact" className="text-gray-700 hover:text-indigo-800">Contact</Link>
        </div>

        <CustomButton 
          title="Sign In"
          btnType="button"
          containerStyles="text-white sm:text-indigo-800 rounded-full bg-blue-900 [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))] sm:bg-white min-w-[100px]"
        />
      </nav>
    </header>
  );
}

export default Navbar;

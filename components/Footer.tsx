import Image from "next/image";
import Link from "next/link";
import { footerLinks } from "@/constants";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#f3f4f6' }} className="text-black-100 border-t border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-start gap-10 max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col justify-start items-start gap-6">
          <Image
            src="/logo.svg"
            alt="logo"
            width={118}
            height={18}
            className="object-contain"
          />
          <div className="flex space-x-4">
            <Link href="https://facebook.com" target="_blank" className="text-gray-500 hover:text-indigo-800 transition duration-200">
              <FontAwesomeIcon icon={faFacebookF} />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="text-gray-500 hover:text-indigo-800 transition duration-200">
              <FontAwesomeIcon icon={faTwitter} />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="text-gray-500 hover:text-indigo-800 transition duration-200">
              <FontAwesomeIcon icon={faInstagram} />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="text-gray-500 hover:text-indigo-800 transition duration-200">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-10">
          {footerLinks.map((item) => (
            <div key={item.title} className="footer__link">
              <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
              <div className="flex flex-col gap-2 mt-2">
                {item.links.map((link) => (
                  <Link
                    key={link.title}
                    href={link.url}
                    className="text-gray-500 hover:text-indigo-800 transition duration-200"
                  >
                    {link.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 py-6 px-6 max-w-6xl mx-auto bg-indigo-800 rounded-t-3xl [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))]">
        <p className="text-sm text-white">@2024 RideList. All rights reserved</p>
        <div className="flex gap-6">
          <Link href="/" className="text-white hover:text-indigo-800 transition duration-200">
            Privacy & Policy
          </Link>
          <Link href="/" className="text-white hover:text-indigo-800 transition duration-200">
            Terms & Condition
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

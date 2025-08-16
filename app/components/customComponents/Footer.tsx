"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import Logo from "@/public/images/logospec.png"; // Adjust the path as necessary
import Image from "next/image";


export const Footer: React.FC = () => {
  // Dynamic Year
  const [currentYear, setCurrentYear] = useState<number>(
    new Date().getFullYear()
  );

  useEffect(() => {
    const year = new Date().getFullYear();
    setCurrentYear(year);
  }, []);

  return (
    // Footer with white background and black/grey text
    <div className="w-full py-10 border-t border-gray-200 lg:py-20 bg-white text-black">
      <div className="mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Brand and Description */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                  <Image
                    src={Logo}
                    alt="SPECULATION Logo"
                    width={30}
                    className="w-30 md:w-30"
                    priority
                  />  
                <h2 className="font-bold text-xl md:text-3xl tracking-tighter">Speculation</h2>
              </div>
              <p className="text-base md:text-lg leading-relaxed tracking-tight text-gray-700">
                The future of music
              </p>
            </div>
            {/* Address and Quick Links */}
            <div className="flex flex-col md:flex-row gap-8"></div>
          </div>
          {/* Navigation Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"></div>
        </div>

        {/* Divider Line */}
        <div className="mt-10 border-t border-gray-200"></div>

        {/* Bottom Section */}
        <div className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-700">
          <span className="flex items-center gap-2">
            © {currentYear} Speculation
          </span>
          <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
            <Link href="/about" className="hover:underline">
              About
            </Link>
            <span>|</span>
            <Link href="/" className="hover:underline">
              Waitlist
            </Link>
            <span>|</span>
            <a
              href="https://sonotrade.gitbook.io/sonotrade-docs/#overview"
              className="hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

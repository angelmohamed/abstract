"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

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
    // Footer with black background and white text
    <div className="w-full py-10 lg:py-20 bg-black text-white">
      <div className="mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Brand and Description */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl md:text-4xl tracking-tighter font-regular">
                Sonotrade
              </h2>
              <p className="text-base md:text-lg leading-relaxed tracking-tight text-white/75">
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
        <div className="mt-10 border-t border-gray-800"></div>

        {/* Bottom Section */}
        <div className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-white/75">
          <span>© {currentYear} Sonotrade</span>
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

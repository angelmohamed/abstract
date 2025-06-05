"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import "../globals.css"; // Ensure global styles are correctly imported

// Ensure correct paths based on jsconfig.json
import { MacbookScroll } from "@/app/components/ui/macbook-scroll";

// Ensure correct handling of static assets
import SONOTRADE from "@/app/sonotrade.png"; // Next.js requires import for local static assets

// If these images are in the `public` folder under `/public/images`, reference them as strings.
const Frame4 = "/images/Frame4.png";
const Social = "/images/Social.png";
const Frame8 = "/images/Frame8.png";



// Hero texts and timing constants
const HERO_TEXTS = [
  "Predict the future of music",
  "Invest in your favorite artists",
  "Discuss and share hot takes with others",
  "The worlds first music prediction market",
];
const TEXT_CHANGE_INTERVAL = 4000; // 4 seconds
const TEXT_FADE_DURATION = 500; // 0.5 seconds

// Feature section constants
const FEATURES = [
  {
    title: "Reshaping The Music Industry",
    description:
      "Using the power of prediction markets to win with the artists you love. Earn real rewards from your insights while shaping the future of music on Sonotrade.",
    image: Frame4,
  },
  {
    title: "Shop Merch and Tickets, Support Your Favorites",
    description:
      "Celebrate your passion for music with exclusive merchandise and event tickets on Sonotrade. Support your favorite artists and enjoy unique fan experiences.",
    image: Frame8,
  },
  {
    title: "Share Your Hot Takes",
    description:
      "Connect with a vibrant community of music enthusiasts, share your insights and predictions to help drive innovation and shape the future of the music industry.",
    image: Social,
  },
];

function FeatureItem({ feature, reverse }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );

    const currentElement = ref.current;
    if (currentElement) observer.observe(currentElement);
    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, []);

  const isSocialOrFrame8 =
    feature.image === Social || feature.image === Frame8;

  const imageClassName = isSocialOrFrame8
    ? "w-[80%] h-auto sm:w-[50%] lg:w-[70%]"
    : "rounded-lg";

  return (
    <div
      ref={ref}
      className={`flex flex-col md:flex-row ${
        reverse ? "md:flex-row-reverse" : ""
      } items-center my-20 transform transition-opacity duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Feature Text */}
      <div className="md:w-1/2 p-8">
        <h2 className="text-3xl font-semibold mb-4">{feature.title}</h2>
        <p className="text-gray-300">{feature.description}</p>
      </div>

      {/* Feature Image */}
      <div className="md:w-1/2 p-8 flex justify-center">
        <Image
          src={feature.image}
          alt={feature.title}
          width={700}
          height={420}
          className={imageClassName}
          unoptimized
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [currentText, setCurrentText] = useState(HERO_TEXTS[0]);
  const [isTextVisible, setIsTextVisible] = useState(true);
  // console.log("About page");
  useEffect(() => {
    let index = 1;
    let timeoutId;

    const intervalId = setInterval(() => {
      setIsTextVisible(false);
      timeoutId = setTimeout(() => {
        setCurrentText(HERO_TEXTS[index]);
        setIsTextVisible(true);
        index = (index + 1) % HERO_TEXTS.length;
      }, TEXT_FADE_DURATION);
    }, TEXT_CHANGE_INTERVAL);

    // Cleanup both interval and any pending timeout
    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="text-white min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="mbp-header pl-4 pt-4 pb-8">
        <Image src={SONOTRADE} alt="SONOTRADE Logo" width={220} priority />
      </header>


      {/* Hero Section */}
      <main className="flex-grow flex flex-col items-center justify-center px-4">
        <div className="text-center pb-6">
          <h1 className="mbp-subtitle pt-14">
            <span
              className={`transition-opacity duration-700 ${
                isTextVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              {currentText}
            </span>
          </h1>
        </div>

        {/* MacBook 3D Scroll Effect */}
        <MacbookScroll showGradient src="https://i.ibb.co/PFPP7xq/mock.jpg" />
      </main>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4">
          {FEATURES.map((feature, index) => (
            <FeatureItem
              key={index}
              feature={feature}
              reverse={index % 2 !== 0}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

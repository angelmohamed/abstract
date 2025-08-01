"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import "../globals.css"; // Ensure global styles are correctly imported

// Ensure correct paths based on jsconfig.json
import { MacbookScroll } from "@/app/components/ui/macbook-scroll";

// Ensure correct handling of static assets
import SONOTRADE from "@/app/sonotrade.png"; // Next.js requires import for local static assets
import { Footer } from "../components/customComponents/Footer";
import Header from "../Header";
import { NavigationBar } from "@/app/components/ui/navigation-menu";
import { getCategories } from "@/services/market";
import HeaderFixed from "@/app/HeaderFixed";

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

  const isSocialOrFrame8 = feature.image === Social || feature.image === Frame8;

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
  const [navigationItems, setNavigationItems] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("all");
  const [subcategoryList, setSubcategoryList] = useState([]);
  const [selectCategory, setSelectedCategory] = useState("all");
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

  const fetchCategories = async () => {
    try {
      const { success, result } = await getCategories();
      if (success) {
        setCategoryList(result);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { success, result } = await getCategories();
      if (success) {
        setNavigationItems(result);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchTags = async () => {
    try {
      const { success, result } = await getTagsByCategory(selectCategory);
      if (success) {
        setSubcategoryList(result);
        setSelectedSubcategory("all");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [selectCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white h-auto items-center justify-items-center p-0 m-0">
      {/* Header */}
      <div  className="sticky top-0 z-50 w-[100%] backdrop-blur-md border-b border-[#222] lg:mb-4 mb-0 pb-2" style={{ borderBottomWidth: '1px' }}>
        <Header />
        <NavigationBar
          menuItems={navigationItems}
          showLiveTag={true}
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectCategory}
        />
      </div>
      {/* <Header /> */}

      {/* Features Section */}
      <section className="py-10 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold">Terms & Conditions</h2>
          <h3 className="text-2xl font-semibold my-4">
            Lorem Ipsum is simply dummy
          </h3>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </p>
          <h3 className="text-2xl font-semibold my-4">
            Lorem Ipsum is simply dummy
          </h3>
          <ul className="pl-8 list-disc leading-10">
            <li>
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry.
            </li>
            <li>
              Lorem Ipsum has been the industry&apos;s standard dummy text ever since
              the 1500s, when an unknown printer took.
            </li>
            <li>
              Lorem Ipsum has been the industry&apos;s standard dummy text ever since
              the 1500s, when an unknown printer took a galley of type and
              scrambled.
            </li>
            <li>
              It has survived not only five centuries, but also the leap into
              electronic typesetting, remaining essentially unchanged.
            </li>
            <li>
              It was popularised in the 1960s with the release of Letraset
              sheets containing Lorem Ipsum passages.
            </li>
            <li>
              More recently with desktop publishing software like Aldus
              PageMaker including versions of Lorem Ipsum.
            </li>
          </ul>
          <h3 className="text-2xl font-semibold my-4">
            Lorem Ipsum is simply dummy
          </h3>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </p>
          <h3 className="text-2xl font-semibold my-4">
            Lorem Ipsum is simply dummy
          </h3>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry&apos;s standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book. It has survived not
            only five centuries, but also the leap into electronic typesetting,
            remaining essentially unchanged. It was popularised in the 1960s
            with the release of Letraset sheets containing Lorem Ipsum passages,
            and more recently with desktop publishing software like Aldus
            PageMaker including versions of Lorem Ipsum.
          </p>
        </div>
      </section>
      <Footer />
      <HeaderFixed />
    </div>
  );
}

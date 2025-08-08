export const runtime = 'edge'

import { getInfoCards } from "@/services/user";
import Home from "./Home";
import { getCategories, getTagsByCategory } from "@/services/market";

export default async function Page() {
  const [infoCardCms, categories, tags] = await Promise.all([fetchCmsContent(), fetchCategories(), fetchTags()]);
  return <Home infoCardCms={infoCardCms} categories={categories} tags={tags} />;
    // Assuming the Home component contains the div we want to modify
    // The following line is a placeholder for the actual div in the Home component
    // <div className="flex flex-col items-center justify-center gap-9 w-full mt-1 sm:mt-3">
}

const fetchCmsContent = async () => {
  try {
    const { success, result } = await getInfoCards();
    if (success) {
      return result;
    }
    return [];
  } catch (error) {
    return [];
  }
};

const fetchCategories = async () => {
  try {
    const { success, result } = await getCategories();
    if (success) {
      return result;
    }
    return [];
  } catch (error) {
    return [];
  }
};

const fetchTags = async () => {
  try {
    const { success, result } = await getTagsByCategory("all");
    if (success) {
      return result;
    }
    return [];
  } catch (error) {
    return [];
  }
}
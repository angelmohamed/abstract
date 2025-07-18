export const runtime = 'edge'

import { getInfoCards } from "@/services/user";
import Home from "./Home";
import { getCategories } from "@/services/market";

export default async function Page() {
  const infoCardCms = await fetchCmsContent();
  const categories = await fetchCategories();
  return <Home infoCardCms={infoCardCms} categories={categories} />;
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
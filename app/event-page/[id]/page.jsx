export const runtime = 'edge';

import EventPage from "./_components/EventPage.jsx";
import { getCategories } from "@/services/market";

export default async function Page() {
  const categories = await fetchCategories();
  return <EventPage categories={categories} />
}

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
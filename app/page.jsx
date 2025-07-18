import { getInfoCards } from "@/services/user";
import Home from "./Home";

export default async function Page() {
  const response = await getCmsContent();
  console.log(response);
  return <Home infoCardCms={response}/>;
}

const getCmsContent = async () => {
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
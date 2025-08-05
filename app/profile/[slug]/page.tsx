export const runtime = 'edge';

import { getUserById } from "@/services/user";
import ProfilePage from "./Profile";
import { getCategories } from "@/services/market";

export default async function Page(props: { params: Promise<{ slug: string; }> }) {
	const params = await props.params;
  let slug = decodeURIComponent(params.slug);

  const [userResult, categories] = await Promise.all([
    fetchUser(slug),
    fetchCategories()
  ]);

  return (
    <ProfilePage user={userResult.user} categories={categories} />
  );
}

const fetchUser = async (username: string) => {
  try {
    const { status, result, wallet } = await getUserById(username);
    return {
      user: status ? result : null,
      wallet: status ? wallet : null
    };
  } catch {
    return { user: null, wallet: null };
  }
};

const fetchCategories = async () => {
  try {
    const { success, result } = await getCategories();
    return success ? result : [];
  } catch {
    return [];
  }
};

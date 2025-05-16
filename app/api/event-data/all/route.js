export const runtime = 'edge';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") || "10"; // Default to 10
  const offset = searchParams.get("offset") || "0"; // Default to 0
  const closed = searchParams.get("closed") || "0"; // Default to 0
  const tag_slug = searchParams.get("tag_slug") || "0"; // Default to 0

  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/events/pagination?limit=${limit}&active=true&archived=false&closed=${closed}&order=startDate&ascending=false&offset=${offset}&tag_slug=${tag_slug}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error! Status: ${response.status}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error fetching data" }), {
      status: 500,
    });
  }
}

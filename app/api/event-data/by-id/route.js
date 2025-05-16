export const runtime = 'edge';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/events/${id}`,
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

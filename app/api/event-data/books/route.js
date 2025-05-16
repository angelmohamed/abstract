export const runtime = 'edge';

export async function POST(req) {
  const body = await req.json();
  const token_ids = body;

  try {
    const response = await fetch(`https://clob.polymarket.com/books`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(token_ids),
    });

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

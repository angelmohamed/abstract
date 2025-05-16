export const runtime = 'edge';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const fidelity = searchParams.get("fidelity") || "10"; // Default to 10
  const market = searchParams.get("market") || ""; // Default to 0
  const interval = searchParams.get("interval") || "all"; // Default to 0

  try {
    const response = await fetch(
      `https://clob.polymarket.com/prices-history?interval=${interval}&market=${market}&fidelity=${fidelity}`,
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

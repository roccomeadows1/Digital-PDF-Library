export async function onRequest(context) {
  const { request, env } = context;
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return new Response(
      JSON.stringify({ error: "Missing ISBN" }),
      { status: 400 }
    );
  }

  const grUrl =
    `https://www.goodreads.com/book/isbn?key=${env.GOODREADS_KEY}&isbn=${isbn}`;

  const res = await fetch(grUrl);
  const xml = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  const get = (selector) =>
    doc.querySelector(selector)?.textContent || "";

  const data = {
    title: get("title"),
    author: get("authors author name"),
    rating: get("average_rating"),
    cover: get("image_url"),
    description: get("description")
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400"
    }
  });
}

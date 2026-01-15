export async function onRequest({ request, env }) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return new Response(
      JSON.stringify({ error: "Missing ISBN" }),
      { status: 400 }
    );
  }

  if (!env.GOODREADS_KEY) {
    return new Response(
      JSON.stringify({ error: "GOODREADS_KEY not set" }),
      { status: 500 }
    );
  }

  const url =
    `https://www.goodreads.com/book/isbn?key=${env.GOODREADS_KEY}&isbn=${isbn}`;

  const res = await fetch(url);

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "Goodreads request failed" }),
      { status: 502 }
    );
  }

  const xml = await res.text();

  // SIMPLE SAFE XML PARSER
  const extract = (tag) => {
    const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
    return match ? match[1].replace(/<!\\[CDATA\\[|\\]\\]>/g, '').trim() : "";
  };

  const data = {
    title: extract("title"),
    author: extract("name"),
    rating: extract("average_rating"),
    cover: extract("image_url"),
    description: extract("description")
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400"
    }
  });
}

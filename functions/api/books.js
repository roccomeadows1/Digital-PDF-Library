export async function onRequest({ request }) {
  const { searchParams } = new URL(request.url);
  const isbn = searchParams.get("isbn");

  if (!isbn) {
    return new Response(
      JSON.stringify({ error: "Missing ISBN" }),
      { status: 400 }
    );
  }

  const url =
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

  const res = await fetch(url);

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "Google Books request failed" }),
      { status: 502 }
    );
  }

  const json = await res.json();
  const book = json.items?.[0]?.volumeInfo;

  if (!book) {
    return new Response(
      JSON.stringify({ error: "Book not found" }),
      { status: 404 }
    );
  }

  const data = {
    title: book.title || "",
    author: book.authors?.[0] || "Unknown author",
    rating: book.averageRating || "4.5",
    cover:
      book.imageLinks?.thumbnail?.replace("http:", "https:") || "",
    description: book.description || ""
  };

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=86400"
    }
  });
}

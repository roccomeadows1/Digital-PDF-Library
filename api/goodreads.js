import axios from "axios";
import { parseStringPromise } from "xml2js";

export default async function handler(req, res) {
  try {
    const { isbn } = req.query;

    const response = await axios.get(
      "https://www.goodreads.com/book/isbn",
      {
        params: {
          key: process.env.GOODREADS_KEY,
          isbn
        }
      }
    );

    const json = await parseStringPromise(response.data);
    const book = json.GoodreadsResponse.book[0];

    res.setHeader("Cache-Control", "public, max-age=86400");

    res.json({
      title: book.title[0],
      author: book.authors[0].author[0].name[0],
      rating: book.average_rating[0],
      cover: book.image_url[0],
      description: book.description[0]
    });

  } catch (err) {
    res.status(500).json({ error: "Goodreads fetch failed" });
  }
}


const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

const app = express();

app.use(express.json());

const databasePath = path.join(__dirname, "library.db");

let db;

// Initialize database and start server
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    console.log("Database connected successfully");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.log(`Database Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// GET: Retrieve books with search, sorting, pagination and price filters
app.get("/books/", async (request, response) => {
  try {
    const {
      search_q = "",
      order_by = "id",
      order = "ASC",
      limit = "10",
      offset = "0",
      min_price,
      max_price,
    } = request.query;

    const allowedColumns = ["id", "title", "author", "price", "pages"];

    if (!allowedColumns.includes(order_by)) {
      return response.status(400).send({
        message: "Invalid order_by parameter",
      });
    }

    const sortOrder = order.toUpperCase();

    if (!["ASC", "DESC"].includes(sortOrder)) {
      return response.status(400).send({
        message: "Order must be ASC or DESC",
      });
    }

    if (
      !/^\d+$/.test(String(limit)) ||
      !/^\d+$/.test(String(offset)) ||
      Number(limit) < 1 ||
      Number(offset) < 0
    ) {
      return response.status(400).send({
        message: "Limit must be positive and offset must be non-negative",
      });
    }

    if (
      (min_price !== undefined &&
        (min_price.trim() === "" || !Number.isFinite(Number(min_price)))) ||
      (max_price !== undefined &&
        (max_price.trim() === "" || !Number.isFinite(Number(max_price))))
    ) {
      return response.status(400).send({
        message: "Price filters must be numeric",
      });
    }

    if (
      min_price !== undefined &&
      max_price !== undefined &&
      Number(min_price) > Number(max_price)
    ) {
      return response.status(400).send({
        message: "min_price cannot be greater than max_price",
      });
    }

    const conditions = [];
    const values = [];

    if (search_q.trim() !== "") {
      conditions.push("title LIKE ?");
      values.push(`%${search_q.trim()}%`);
    }

    if (min_price !== undefined) {
      conditions.push("price >= ?");
      values.push(Number(min_price));
    }

    if (max_price !== undefined) {
      conditions.push("price <= ?");
      values.push(Number(max_price));
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

    const query = `
      SELECT * FROM book
      ${whereClause}
      ORDER BY ${order_by} ${sortOrder}
      LIMIT ? OFFSET ?
    `;

    values.push(Number(limit), Number(offset));

    const books = await db.all(query, values);

    response.status(200).send(books);
  } catch (error) {
    response.status(500).send({
      message: error.message,
    });
  }
});

// GET: Retrieve a book by ID
app.get("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).send({
        message: "Invalid book ID",
      });
    }

    const book = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (!book) {
      return response.status(404).send({
        message: "Book not found",
      });
    }

    response.status(200).send(book);
  } catch (error) {
    response.status(500).send({
      message: error.message,
    });
  }
});

// POST: Add a new book
app.post("/books/", async (request, response) => {
  try {
    const { title, author, price, pages } = request.body;

    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof author !== "string" ||
      author.trim() === "" ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      pages === undefined ||
      pages === null ||
      pages === "" ||
      !Number.isInteger(Number(pages)) ||
      Number(pages) < 1
    ) {
      return response.status(400).send({
        message: "Valid title, author, numeric price and pages are required",
      });
    }

    const query = `
      INSERT INTO book (title, author, price, pages)
      VALUES (?, ?, ?, ?)
    `;

    const result = await db.run(query, [
      title.trim(),
      author.trim(),
      Number(price),
      Number(pages),
    ]);

    response.status(201).send({
      message: "Book added successfully",
      bookId: result.lastID,
    });
  } catch (error) {
    response.status(500).send({
      message: error.message,
    });
  }
});

// PUT: Update an existing book
app.put("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;
    const { title, author, price, pages } = request.body;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).send({
        message: "Invalid book ID",
      });
    }

    const existingBook = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (!existingBook) {
      return response.status(404).send({
        message: "Book not found",
      });
    }

    if (
      typeof title !== "string" ||
      title.trim() === "" ||
      typeof author !== "string" ||
      author.trim() === "" ||
      price === undefined ||
      price === null ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      pages === undefined ||
      pages === null ||
      pages === "" ||
      !Number.isInteger(Number(pages)) ||
      Number(pages) < 1
    ) {
      return response.status(400).send({
        message: "Valid title, author, numeric price and pages are required",
      });
    }

    await db.run(
      `UPDATE book
       SET title = ?, author = ?, price = ?, pages = ?
       WHERE id = ?`,
      [title.trim(), author.trim(), Number(price), Number(pages), bookId]
    );

    response.status(200).send({
      message: "Book updated successfully",
    });
  } catch (error) {
    response.status(500).send({
      message: error.message,
    });
  }
});

// DELETE: Delete a book
app.delete("/books/:bookId/", async (request, response) => {
  try {
    const { bookId } = request.params;

    if (!/^[1-9]\d*$/.test(bookId)) {
      return response.status(400).send({
        message: "Invalid book ID",
      });
    }

    const existingBook = await db.get(
      "SELECT * FROM book WHERE id = ?",
      [bookId]
    );

    if (!existingBook) {
      return response.status(404).send({
        message: "Book not found",
      });
    }

    await db.run(
      "DELETE FROM book WHERE id = ?",
      [bookId]
    );

    response.status(200).send({
      message: "Book deleted successfully",
    });
  } catch (error) {
    response.status(500).send({
      message: error.message,
    });
  }
});

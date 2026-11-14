# BDF Lab 03 - Book Management REST API

**Student Name:** Boddu Deekshith Reddy  
**Registration Number:** 252U1R5024  
**Section:** CSE/AIDE-2A 
**Subject:** Backend Development Fundamentals (BDF)  
**Lab Number:** 03  
**Lab Title:** REST API, Query Parameters, Validation and Debugging  

---

## 🚀 Live Deployment & Links
- **Render Live API:** `https://boddudeekshithreddy-lab-3.onrender.com/books/`
- **GitHub Repository:** `https://github.com/boddudeekshithreddy/boddudeekshithreddy_lab-3.git`

---

## 📌 API Endpoints

| Method | Endpoint | Description | HTTP Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/books/` | Retrieve all books (with search, sort, pagination & price filtering) | `200 OK`, `400 Bad Request` |
| `GET` | `/books/:bookId/` | Retrieve a single book by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/books/` | Add a new book record | `201 Created`, `400 Bad Request` |
| `PUT` | `/books/:bookId/` | Update an existing book record | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `DELETE` | `/books/:bookId/` | Delete a book record by ID | `200 OK`, `404 Not Found` |

---

## 🔍 Query Parameters (`GET /books/`)

- `search_q`: Partial title search using SQL `LIKE` operator (default: `""`).
- `order_by`: Sorting column — restricted to `id`, `title`, `author`, `price`, `pages` (default: `"id"`).
- `order`: Sorting direction — `ASC` or `DESC` (default: `"ASC"`).
- `limit`: Number of records to return for pagination (default: `10`).
- `offset`: Record index offset for pagination (default: `0`).
- `min_price`: Minimum book price filter (e.g., `min_price=400`).
- `max_price`: Maximum book price filter (e.g., `max_price=300`).

---

## 🛠️ Project Structure

```text
lab-03/
├── node_modules/
├── screenshots/
│   ├── 01_GET_all_books.png
│   ├── 02_GET_search.png
│   ├── 03_GET_sorting.png
│   ├── 04_GET_price_filter.png
│   ├── 05_POST_add_book.png
│   ├── 06_PUT_update_book.png
│   ├── 07_DELETE_book.png
│   └── 08_GET_404_not_found.png
├── library.db
├── app.js
├── package.json
├── package-lock.json
├── BDF_Lab_03_Collection.json
├── .gitignore
└── README.md

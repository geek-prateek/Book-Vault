# 📚 Readaly

> A Next.js app for tracking your reading with focus mode, stats, and one active book at a time.

---

## 🚀 Overview

**Readaly** is a personal reading tracker designed for deep focus.  
It enforces a **single active book at a time**, helping you eliminate context switching and build a consistent reading habit.

---

## ✨ Features

### 🔍 Discover & Add Books
- Search books using **Google Books API**
- Auto-fetch metadata, covers, and descriptions

### 🎯 Focus Mode
- Only **one active book** at a time
- Track reading progress (pages, completion)

### 📚 Library Management
- **To-Read (Waiting List)**
- **Currently Reading**
- **Completed Books**

### 📊 Analytics & Insights
- Total books completed
- Total pages read
- Yearly reading goal
- Average reading pace
- Top categories

### 🔁 Re-Reads
- Track multiple reads of the same book
- Maintain reading history per title

### 🎲 Randomizer
- Pick a random book from your waiting list

### 📝 Notes
- Add personal notes per book while reading

### 🏷 Categories
- Organize books by category:
  - Tech
  - Self-Help
  - Fiction
  - Business
  - Health
  - and more...

### 📎 Optional PDF Links
- Attach links to your own book copies

---

## 🏗 Tech Stack

| Layer       | Technology |
|------------|-----------|
| Frontend   | Next.js 16, React 19, TypeScript |
| Styling    | Tailwind CSS 4 |
| Backend    | Supabase (PostgreSQL) |
| Auth       | Supabase Auth (Google OAuth + Magic Links) |
| API        | Google Books API |

---

## 🔐 Authentication

- Google OAuth
- Email Magic Links (passwordless login)

---

## 🧠 Core Philosophy

> Focus beats volume.

Readaly is built around the idea that **reading one book at a time leads to higher retention, deeper understanding, and better consistency**.

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/readaly.git

# Navigate into the project
cd readaly

# Install dependencies
npm install

# Run development server
npm run dev
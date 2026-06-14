# 🌟 SocialSpark — Basic Social Media App

> A full-stack social media web application built with **Node.js**, **Express**, **MongoDB**, and **EJS** — featuring a modern, dark glassmorphism UI powered by **Tailwind CSS**.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Routes](#-api-routes)
- [Middleware](#-middleware)
- [Configuration](#-configuration)
- [Getting Started](#-getting-started)
- [Environment & Security Notes](#-environment--security-notes)
- [UI Pages](#-ui-pages)
- [Screenshots Overview](#-screenshots-overview)

---

## 🔍 Overview

**SocialSpark** is a basic but functional social media platform that allows users to register, log in, create posts, like/unlike posts, edit their own posts, delete posts, and upload a custom profile picture. The app is server-rendered using **EJS** templating and communicates with a **MongoDB** database via **Mongoose**.

Authentication is handled using **JWT tokens** stored in HTTP cookies. Passwords are securely hashed with **bcrypt**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **User Registration** | Sign up with name, email, password, and age |
| 🔑 **User Login** | Authenticate using email and password |
| 🏠 **Public Feed** | View all posts even without logging in |
| 👤 **User Profile** | See your own profile info and all your posts |
| 📝 **Create Posts** | Write and publish posts visible to everyone |
| ✏️ **Edit Posts** | Update the content of your existing posts |
| 🗑️ **Delete Posts** | Remove your own posts (with ownership check) |
| ❤️ **Like / Unlike** | Toggle likes on any post (requires login) |
| 🖼️ **Profile Picture Upload** | Upload a custom profile photo with drag-and-drop |
| 🔓 **Logout** | Clears the JWT cookie and redirects to home |

---

## 🛠️ Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | Web framework & routing |
| `mongoose` | ^9.7.0 | MongoDB ODM (Object Data Modeling) |
| `bcrypt` | ^6.0.0 | Password hashing |
| `jsonwebtoken` | ^9.0.3 | JWT-based authentication |
| `cookie-parser` | ^1.4.7 | Parsing cookies for JWT |
| `multer` | ^2.1.1 | File upload handling (profile pictures) |
| `ejs` | ^6.0.1 | Server-side HTML templating |
| `nodemon` | ^3.1.14 | Auto-restart server during development |
| `debug` | ^4.4.3 | Debug logging for MongoDB |

### Frontend
| Technology | Purpose |
|---|---|
| **Tailwind CSS** (CDN) | Utility-first CSS framework for styling |
| **Google Fonts – Inter** | Modern, clean typography |
| **Vanilla JS** | Image preview & drag-and-drop on upload page |
| **EJS** | Dynamic HTML templating on the server |

### Database
- **MongoDB** (local instance at `mongodb://127.0.0.1:27017/socialDB`)

---

## 📁 Project Structure

```
basic_social_media_app/
│
├── app.js                     # Main Express application & all route definitions
│
├── config/
│   ├── mongoose.js            # MongoDB connection setup
│   └── multer.js              # Multer disk storage configuration
│
├── middlewares/
│   └── isLoggedIn.js          # JWT auth middleware — protects private routes
│
├── models/
│   ├── user.js                # Mongoose User schema & model
│   └── post.js                # Mongoose Post schema & model
│
├── views/                     # EJS templates (server-rendered HTML)
│   ├── root.ejs               # Home / Feed page
│   ├── index.ejs              # Sign Up page
│   ├── login.ejs              # Login page
│   ├── profile.ejs            # User profile & post management
│   ├── editpost.ejs           # Edit a specific post
│   └── test.ejs               # Upload profile picture
│
├── public/
│   └── uploads/
│       └── images/            # Stored profile picture files
│           └── person.png     # Default profile picture
│
├── package.json
├── package-lock.json
└── README.md
```

---

## 🗄️ Database Schema

### User Model — `models/user.js`

```js
{
  name:       String,
  email:      String,
  password:   String,          // bcrypt hashed
  age:        Number,
  profilepic: String,          // path to uploaded image (default: person.png)
  post: [ObjectId]             // references to Post documents
}
```

### Post Model — `models/post.js`

```js
{
  content:  String,
  date:     Date,              // auto-set to Date.now on creation
  user:     ObjectId,          // reference to User who created the post
  likes:    [ObjectId]         // array of User IDs who liked the post
}
```

> **Relationships:**
> - A **User** has many **Posts** (one-to-many via `user.post[]`)
> - A **Post** belongs to one **User** (via `post.user`)
> - A **Post** can be liked by many **Users** (many-to-many via `post.likes[]`)

---

## 🛣️ API Routes

### Public Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Home feed — shows all posts; detects login state from cookie |
| `GET` | `/create` | Render Sign Up page |
| `POST` | `/create` | Register a new user (hashes password, sets JWT cookie) |
| `GET` | `/login` | Render Login page |
| `POST` | `/login` | Authenticate user (compares bcrypt hash, sets JWT cookie) |

### Protected Routes *(require valid JWT cookie)*

| Method | Route | Description |
|---|---|---|
| `GET` | `/profile` | View logged-in user's profile and posts |
| `POST` | `/createpost` | Create a new post (empty posts are rejected) |
| `GET` | `/like/:postId` | Toggle like/unlike on a post |
| `GET` | `/editpost/:postId` | Render the edit form for a specific post |
| `POST` | `/updatepost/:postId` | Save updated post content to the database |
| `POST` | `/deletepost/:postId` | Delete a post (ownership verified before deletion) |
| `GET` | `/test` | Render profile picture upload page |
| `POST` | `/uploadpic` | Upload and save a new profile picture (old one deleted) |

### Utility Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/logout` | Clears JWT cookie and redirects to `/` |

---

## 🔒 Middleware

### `isLoggedIn` — `middlewares/isLoggedIn.js`

Protects private routes by verifying the JWT token stored in the `token` cookie.

```js
function isLoggedIn(req, res, next) {
    if (req.cookies.token == null) return res.redirect('/login');
    const data = jwt.verify(req.cookies.token, 'secret');
    req.user = data;   // attaches decoded user data to req
    next();
}
```

- If **no token** is present → redirects to `/login`
- If **token is valid** → decodes it and attaches `{ email }` to `req.user`, then calls `next()`

---

## ⚙️ Configuration

### MongoDB — `config/mongoose.js`

Connects to a local MongoDB instance and exports the connection:

```js
mongoose.connect('mongodb://127.0.0.1:27017/socialDB');
```

The database name is **`socialDB`**.

---

### Multer — `config/multer.js`

Handles profile picture uploads. Files are saved to `public/uploads/images/` with a **cryptographically random filename** to prevent collisions:

```js
filename: function (req, file, cb) {
    const randomString = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null, randomString + extension);
}
```

When a user uploads a new photo, the **old photo is automatically deleted** from disk (unless it's the default `person.png`).

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port `27017`)
- npm (comes with Node.js)

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd basic_social_media_app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
# Windows (if installed as a service)
net start MongoDB

# Or start manually
mongod
```

### 4. Add Default Profile Picture

Place a default profile image at:

```
public/uploads/images/person.png
```

### 5. Run the Application

**Development mode** (with auto-restart via nodemon):

```bash
npx nodemon app.js
```

Or if nodemon is in your PATH:

```bash
nodemon app.js
```

### 6. Open in Browser

```
http://localhost:8000
```

---

## 🔐 Environment & Security Notes

> ⚠️ **Important**: The following are hardcoded in the current version and should be moved to environment variables before deploying to production.

| Issue | Location | Fix |
|---|---|---|
| JWT secret `'secret'` | `app.js`, `middlewares/isLoggedIn.js` | Use `process.env.JWT_SECRET` |
| MongoDB URI hardcoded | `config/mongoose.js` | Use `process.env.MONGO_URI` |

**Recommended `.env` setup:**

```env
JWT_SECRET=your_super_secret_key_here
MONGO_URI=mongodb://127.0.0.1:27017/socialDB
PORT=8000
```

Then install `dotenv`:

```bash
npm install dotenv
```

And add to `app.js`:

```js
require('dotenv').config();
```

---

## 🖥️ UI Pages

| Page | Route | Description |
|---|---|---|
| **Feed / Home** | `/` | Displays all posts; shows Login/Signup buttons for guests, Profile/Logout for logged-in users |
| **Sign Up** | `/create` | Registration form with name, email, password, age |
| **Login** | `/login` | Email & password login form |
| **Profile** | `/profile` | Avatar, user info (name, email, age, post count), post composer, list of own posts with like/edit/delete actions |
| **Edit Post** | `/editpost/:id` | Pre-filled textarea for updating a post |
| **Upload Photo** | `/test` | Drag-and-drop image uploader with live preview |

---

## 🎨 Screenshots Overview

All pages share a unified **dark glassmorphism** design language:

- 🌑 **Dark base**: `#0d0d14` background
- 💜 **Purple gradient accent**: `#8b5cf6` → `#6d28d9`
- 🔲 **Frosted glass cards**: `rgba(255,255,255,0.04)` with `backdrop-filter: blur(20px)`
- ✨ **Smooth animations**: fade-up entrances, hover lifts, floating logo
- 🔤 **Typography**: [Inter](https://fonts.google.com/specimen/Inter) via Google Fonts

---

## 👨‍💻 Author

Built as a learning project to practice full-stack web development with **Node.js**, **Express**, **MongoDB**, and modern frontend styling.

---

## 📄 License

This project is open-source and available under the [ISC License](https://opensource.org/licenses/ISC).

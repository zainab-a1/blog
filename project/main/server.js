// Import required packages
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { Post } = require('./models'); // Import the Post model
const Sequelize = require("sequelize");
const sequelize = require("./config/connection");
const routes = require("./routes");

// Initialize Express application
const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3001;

// has the --rebuild parameter been passed as a command line param?
const rebuild = process.argv[2] === "--rebuild";

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Handle GET request at the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.htm" ));
});

// Handle GET request for login.html
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.htm"));
});

// Backend route that handles login

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Replace with real authentication logic (database check)
  if (email === "test@example.com" && password === "password123") {
      res.json({ message: "Login successful" });
  } else {
      res.status(401).json({ message: "Invalid email or password" });
  }
});
// 🔹 CRUD Routes for Posts 🔹

// Fetch all posts (READ)
app.get("/data", async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new post (CREATE)
app.post("/data", async (req, res) => {
  try {
    const { title, content, category } = req.body;
    if (!title || !content || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newPost = await Post.create({ title, content, category });
    res.json(newPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/categories', async (req, res) => {
    try {
      // Fetch distinct categories from the posts table
      const categories = await Post.findAll({
        attributes: [
          [Sequelize.fn('DISTINCT', Sequelize.col('category_name')), 'categoryName']
        ],
        raw: true
      });

      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Error fetching categories' });
    }
});

// Update a post (UPDATE)
app.put("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    await post.update({ text });
    res.json({ message: "Post updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a post (DELETE)
app.delete("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    await post.destroy();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Add routes
app.use(routes);

// Sync database
sequelize.sync({ force: rebuild }).then(() => {
  app.listen(PORT, () => console.log(`Now listening on port ${PORT}`));
});

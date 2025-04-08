let token = localStorage.getItem("authToken");

function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  fetch("http://localhost:3001/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.errors) {
        alert(data.errors[0].message);
      } else {
        alert("User registered successfully");
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  fetch("http://localhost:3001/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((res) => res.json())
    .then((data) => {
      // Save the token in the local storage
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        token = data.token;

        alert("User Logged In successfully");

        // Fetch the posts list
        fetchPosts();

        // Hide the auth container and show the app container as we're now logged in
        document.getElementById("auth-container").classList.add("hidden");
        document.getElementById("app-container").classList.remove("hidden");
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.log(error);
    });
}

function logout() {
  fetch("http://localhost:3001/api/users/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).then(() => {
    // Clear the token from the local storage as we're now logged out
    localStorage.removeItem("authToken");
    token = null;
    document.getElementById("auth-container").classList.remove("hidden");
    document.getElementById("app-container").classList.add("hidden");
  });
}

function fetchPosts() {
    const category = document.getElementById("category-filter").value;
    let url = "http://localhost:3001/api/posts";

    fetchCategories();
    if (category) {
      url += `?category=${category}`;
    }

    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((posts) => {
        const postsContainer = document.getElementById("posts");
        postsContainer.innerHTML = "";

        posts.forEach((post) => {
          const div = document.createElement("div");
          div.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <small>By: ${post.postedBy} on ${new Date(post.createdOn).toLocaleString()}</small>
            <button class="post-btn-update" onclick="updatePost(${post.id})">Update</button>
            <button class="post-btn-delete" onclick="deletePost(${post.id})">Delete</button>
          `;
          postsContainer.appendChild(div);
        });
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
      });
}

function updatePost(postId) {
  // Prompt user for new post details
  const newTitle = prompt("Enter the new title:");
  const newContent = prompt("Enter the new content:");

  if (newTitle && newContent) {
    fetch(`http://localhost:3001/api/posts/${postId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title: newTitle, content: newContent }),
    })
      .then((res) => res.json())
      .then((data) => {
          fetchPosts();
      })
      .catch((error) => {
        console.log(error);
        alert("An error occurred while updating the post");
      });
  }
}

function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    fetch(`http://localhost:3001/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
          fetchPosts();
      })
      .catch((error) => {
        console.log(error);
        alert("An error occurred while deleting the post");
      });
  }
}

function fetchCategories() {
    fetch("http://localhost:3001/categories", {
        method: "GET",
    }).then(res => res.json()).then(data => {

        const categorySelect = document.getElementById('category-filter');
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.categoryName;
            option.textContent = category.categoryName;
            categorySelect.appendChild(option);
        });
    })
}

function createPost() {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;
  const categoryName= document.getElementById("post-category").value;

  fetch("http://localhost:3001/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, content, categoryName, postedBy: "User" }),
  })
    .then((res) => res.json())
    .then(() => {
      alert("Post created successfully");
      fetchPosts();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const dataList = document.getElementById("data-list");
  const dataForm = document.getElementById("data-form");
  const dataInput = document.getElementById("data-input");

  // Function to fetch data from the backend
  const fetchData = async () => {
    try {
      const response = await fetch("/data");
      const data = await response.json();
      dataList.innerHTML = ""; // Clear the list before rendering
      data.forEach((item) => {
        const li = document.createElement("li");
        // Display item data
        li.textContent = item.id + ": " + JSON.stringify(item);
        
        // Create Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editData(item.id, item.text);

        // Create Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => editData(item.id);

        // Append button to list item 
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        // Append list item to the list
        dataList.appendChild(li);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

//   Function to edit data
const editData = async (id, oldText) => {
    const newText = prompt("Enter new text:", oldText);
    if (!newText) return;

    try {
        const response = await fetch(`/data/${id}`, {
            method: "PUT",
            headers: {"Content - type": "application/json"},
            body: JSON.stringify({ text: newText}),
        });

        if (response.ok) {
            fetchData(); //Refresh the list
        }
        } catch (error) {
            console.error("Error updating data:", error);
        }
    };

    // Function to delete post 
    const deleteButton = async (id) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        try {
            const response = await fetch (`/data/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                fetchData(); // refresh the list
            }
        } catch (error) {
            console.error("Error deleting data:", error);
        }
    };


  // Handle form submission to add new data (Create button functionality)
  dataForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const newData = { text: dataInput.value };

    try {
      const response = await fetch("/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        dataInput.value = ""; // Clear input field
        fetchData(); // Refresh the list
      }
    } catch (error) {
      console.error("Error adding data:", error);
    }
  });

  // Fetch data on page load
  fetchData();
});



// Initial Data
const users = [
	{ username: "admin", password: "admin123", role: "admin" },
	{ username: "user", password: "user123", role: "user" },
];
const products = [];

// Store Data in localStorage (initialize only if not already present)
if (!localStorage.getItem("users")) {
	localStorage.setItem("users", JSON.stringify(users));
}
if (!localStorage.getItem("products")) {
	localStorage.setItem("products", JSON.stringify(products));
}

// Elements
const loginSection = document.getElementById("loginSection");
const contentSection = document.getElementById("contentSection");
const productList = document.getElementById("productList");
const adminActions = document.getElementById("adminActions");
const dashboardTitle = document.getElementById("dashboardTitle");

// Login Form Logic
document.getElementById("loginForm").addEventListener("submit", (e) => {
	e.preventDefault();
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	const users = JSON.parse(localStorage.getItem("users"));
	const user = users.find((u) => u.username === username && u.password === password);

	if (!user) {
					document.getElementById("errorMessage").textContent = "Invalid credentials!";
					return;
	}

	localStorage.setItem("loggedInUser", JSON.stringify(user));
	loadDashboard(user.role);
});

// Load Dashboard
function loadDashboard(role) {
	loginSection.style.display = "none";
	contentSection.style.display = "block";
	dashboardTitle.textContent = role === "admin" ? "Admin Dashboard" : "User Dashboard";

	if (role === "admin") {
					adminActions.style.display = "block";
					renderProducts(true);
					document.getElementById("form").addEventListener("submit", addProduct);
	} else {
					adminActions.style.display = "none";
					renderProducts(false);
	}
}

// Add Product
function addProduct(e) {
	e.preventDefault();

	const name = document.getElementById("name").value.trim();
	const price = parseFloat(document.getElementById("price").value);
	const qty = parseInt(document.getElementById("qty").value, 10);
	const file = document.getElementById("file").files[0];

	if (!name || isNaN(price) || isNaN(qty) || !file) {
					alert("Please fill all fields correctly and upload a product image.");
					return;
	}

	const reader = new FileReader();
	reader.onload = function (event) {
					const newProduct = {
									id: Date.now(),
									name,
									price,
									qty,
									image: event.target.result, // Base64 string for the image
					};

					// Update the product list in localStorage
					const products = JSON.parse(localStorage.getItem("products"));
					products.push(newProduct);
					localStorage.setItem("products", JSON.stringify(products));

					// Re-render products
					renderProducts(true);

					// Clear the form fields
					document.getElementById("form").reset();
					alert("Product added successfully!");
	};
	reader.readAsDataURL(file); // Read file as Base64
}

// Render Products
function renderProducts(isAdmin) {
	const products = JSON.parse(localStorage.getItem("products"));
	productList.innerHTML = "";

	products.forEach((product) => {
					const productCard = `
									<div class="col-md-4 mb-3">
													<div class="card">
																	<img src="${product.image}" class="card-img-top" alt="${product.name}" height="150">
																	<div class="card-body">
																					<h5>${product.name}</h5>
																					<p>Price: $${product.price.toFixed(2)}</p>
																					<p>Quantity: ${product.qty}</p>
																					${
																									isAdmin
																													? `<button class="btn btn-danger" onclick="deleteProduct(${product.id})">Delete</button>`
																													: product.qty > 0
																													? `<button class="btn btn-success" onclick="buyProduct(${product.id})">Buy</button>`
																													: `<button class="btn btn-secondary" disabled>Out of Stock</button>`
																					}
																	</div>
													</div>
									</div>
					`;
					productList.innerHTML += productCard;
	});
}

// Delete Product
function deleteProduct(id) {
	let products = JSON.parse(localStorage.getItem("products"));
	products = products.filter((product) => product.id !== id);
	localStorage.setItem("products", JSON.stringify(products));
	renderProducts(true);
	alert("Product deleted successfully!");
}

// Buy Product
function buyProduct(id) {
	const products = JSON.parse(localStorage.getItem("products"));
	const product = products.find((p) => p.id === id);

	if (product.qty <= 0) {
					alert("Product is out of stock!");
					return;
	}

	product.qty -= 1; // Decrease quantity
	localStorage.setItem("products", JSON.stringify(products));
	alert("Product purchased successfully!");
	renderProducts(false); // Re-render for user
}

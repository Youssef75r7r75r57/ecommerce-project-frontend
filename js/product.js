document.addEventListener("DOMContentLoaded", () => {
    const PRODUCTS_STORAGE_KEY = "productsData";
    const productImg = document.getElementById("product-img");
    const productName = document.getElementById("product-name");
    const productPrice = document.getElementById("product-price");
    const productDesc = document.getElementById("product-desc");
    const addBtn = document.getElementById("add-to-cart-btn");
    const wishlistBtn = document.getElementById("add-to-Wishlist-btn");
    const cartCount = document.getElementById("cart-count");

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const params = new URLSearchParams(window.location.search);
    const productId = Number(params.get("id"));

    function updateCartCount() {
        if (!cartCount) return;
        if (!currentUser || !currentUser.cart) {
            cartCount.textContent = 0;
        } else {
            cartCount.textContent = currentUser.cart.reduce((sum, item) => sum + item.quantity, 0);
        }
    }

    function updateCurrentUser(user) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex((u) => u.email === user.email);
        if (index !== -1) users[index] = user;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(user));
        currentUser = user;
    }

    async function loadProducts() {
        const stored = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (error) {
                console.error("Invalid productsData in localStorage:", error);
            }
        }

        const res = await fetch("data/products.json");
        const products = await res.json();
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        return products;
    }

    function ensureLoggedIn() {
        if (!currentUser) {
            alert("Please login first!");
            window.location.href = "login.html";
            return false;
        }
        return true;
    }

    updateCartCount();

    loadProducts()
        .then((products) => {
            const product = products.find((p) => Number(p.id) === productId);
            if (!product) {
                productName.textContent = "Product Not Found";
                return;
            }

            productImg.src = product.image;
            productName.textContent = product.name;
            productPrice.textContent = `$${product.price}`;
            productDesc.textContent = product.description || translations[currentLang].defaultProductDesc;

            addBtn.addEventListener("click", () => {
                if (!ensureLoggedIn()) return;

                currentUser.cart = currentUser.cart || [];
                const existing = currentUser.cart.find((item) => item.id === product.id);
                if (existing) {
                    existing.quantity += 1;
                } else {
                    currentUser.cart.push({ ...product, quantity: 1 });
                }

                updateCurrentUser(currentUser);
                updateCartCount();
                alert(`${product.name} added to cart!`);
            });

            if (wishlistBtn) {
                wishlistBtn.addEventListener("click", () => {
                    if (!ensureLoggedIn()) return;

                    currentUser.wishlist = currentUser.wishlist || [];
                    const exists = currentUser.wishlist.find((item) => item.id === product.id);
                    if (exists) {
                        alert(`${product.name} is already in your Wishlist!`);
                        return;
                    }

                    const wishlistItem = {
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image
                    };

                    currentUser.wishlist.push(wishlistItem);
                    updateCurrentUser(currentUser);
                    alert(`${product.name} added to Wishlist!`);
                });
            }
        })
        .catch((err) => console.error("Error loading product:", err));
});

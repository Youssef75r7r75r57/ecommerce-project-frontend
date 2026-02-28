document.addEventListener("DOMContentLoaded", () => {
    const productList = document.getElementById("product-list");
    const cartCount = document.getElementById("cart-count");
    const searchInput = document.getElementById("search-input");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const userInfo = document.getElementById("user-info");
    const PRODUCTS_STORAGE_KEY = "productsData";

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (cartCount) {
        if (!currentUser) {
            cartCount.textContent = 0;
        } else {
            cartCount.textContent = currentUser.cart ? currentUser.cart.reduce((sum, item) => sum + item.quantity, 0) : 0;
        }
    }

    let allProducts = [];

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

    function renderProducts(products) {
        if (!productList) return;
        productList.innerHTML = "";

        products.forEach((product, index) => {
            const card = document.createElement("div");
            card.classList.add("product-card");
            card.style.animationDelay = `${index * 0.2}s`;

            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price}</p>
                    <a href="#" class="add-btn">${translations[currentLang].addToCart}</a>
                    <a href="#" class="wishlist-btn" title="Add to Wishlist" style="
                        display:inline-block;
                        width:30px;
                        height:30px;
                        line-height:27px;
                        text-align:center;
                        font-size:20px;
                        color:#fffb00;
                        background-color:#000;
                        border:1px solid #fffb00;
                        border-radius:50%;
                        text-decoration:none;
                        cursor:pointer;
                        transition: all 0.2s ease;
                    "
                    onmouseover="this.style.backgroundColor='#000'; this.style.color='#fff';"
                    onmouseout="this.style.backgroundColor='#000'; this.style.color='#fffb00';"
                    >♥</a>
                </div>
            `;

            card.querySelector(".add-btn").addEventListener("click", (e) => {
                e.preventDefault();
                addToCart(product);
            });

            card.querySelector(".wishlist-btn").addEventListener("click", (e) => {
                e.preventDefault();
                addToWishlist(product);
            });

            card.querySelector("img").addEventListener("click", () => {
                window.location.href = `product.html?id=${product.id}`;
            });

            productList.appendChild(card);
        });
    }

    function addToCart(product) {
        if (!currentUser) {
            alert("Please login first!");
            window.location.href = "login.html";
            return;
        }

        let cart = currentUser.cart || [];
        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        currentUser.cart = cart;
        updateCurrentUser(currentUser);

        if (cartCount) {
            cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        }
        alert(`${product.name} added to cart!`);
    }

    function addToWishlist(product) {
        if (!currentUser) {
            alert("Please login first!");
            window.location.href = "login.html";
            return;
        }

        currentUser.wishlist = currentUser.wishlist || [];
        const exists = currentUser.wishlist.find((item) => item.id === product.id);
        if (!exists) {
            currentUser.wishlist.push(product);
            updateCurrentUser(currentUser);
            alert(`${product.name} added to Wishlist!`);
        } else {
            alert(`${product.name} is already in your Wishlist!`);
        }
    }

    function updateCurrentUser(user) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex((u) => u.email === user.email);
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem("users", JSON.stringify(users));
        }
        localStorage.setItem("currentUser", JSON.stringify(user));
    }

    if (productList) {
        loadProducts()
            .then((products) => {
                allProducts = products;
                renderProducts(allProducts);
            })
            .catch((err) => console.error("Error loading products:", err));
    }

    if (filterBtns.length) {
        filterBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                filterBtns.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                const category = btn.dataset.category;
                const filtered = category === "All"
                    ? allProducts
                    : allProducts.filter((p) => p.category === category);
                renderProducts(filtered);
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allProducts.filter((p) => p.name.toLowerCase().includes(term));
            renderProducts(filtered);
        });
    }

    function renderUser() {
        if (!userInfo) return;

        if (currentUser) {
            userInfo.innerHTML = `
                <span style="color:#d4af37; font-weight:600;">${currentUser.name}</span>
                <i id="logout-btn" style="padding:5px 10px; font-size:0.8rem; margin-left:10px;" class="fa-solid fa-right-from-bracket">${translations[currentLang].logout}</i>
            `;

            const logoutBtn = document.getElementById("logout-btn");
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("currentUser");
                location.reload();
            });
        } else {
            userInfo.innerHTML = `<a href="login.html" style="margin:25px -10px; display:inline-block;">${translations[currentLang].login}</a>`;
        }
    }

    renderUser();
});

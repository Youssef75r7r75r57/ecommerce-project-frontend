document.addEventListener("DOMContentLoaded", async () => {
    const PRODUCTS_STORAGE_KEY = "productsData";
    const productImg = document.getElementById("product-img");
    const productName = document.getElementById("product-name");
    const productPrice = document.getElementById("product-price");
    const productDesc = document.getElementById("product-desc");
    const productCategory = document.getElementById("product-category");
    const productIdLabel = document.getElementById("product-id-label");
    const benefitsBox = document.querySelector(".luxury-benefits");
    const actionsBox = document.querySelector(".product-actions");
    const mediaNote = document.querySelector(".product-media-note");
    const addBtn = document.getElementById("add-to-cart-btn");
    const wishlistBtn = document.getElementById("add-to-Wishlist-btn");
    const cartCount = document.getElementById("cart-count");
    const relatedProductsList = document.getElementById("related-products-list");

    let currentUser = await usersStore.syncCurrentUserFromStore();
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

    async function updateCurrentUser(user) {
        await usersStore.upsertUser(user);
        currentUser = usersStore.getCurrentUser();
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

    async function addProductToCart(product) {
        if (!ensureLoggedIn()) return;

        currentUser.cart = currentUser.cart || [];
        const existing = currentUser.cart.find((item) => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            currentUser.cart.push({ ...product, quantity: 1 });
        }

        await updateCurrentUser(currentUser);
        updateCartCount();
        alert(`${product.name} added to cart!`);
    }

    function renderRelatedProducts(products, currentProduct) {
        if (!relatedProductsList) return;

        const others = products
            .filter((p) => Number(p.id) !== Number(currentProduct.id))
            .sort((a, b) => {
                const aSameCategory = a.category === currentProduct.category ? 0 : 1;
                const bSameCategory = b.category === currentProduct.category ? 0 : 1;
                return aSameCategory - bSameCategory;
            })
            .slice(0, 8);

        relatedProductsList.innerHTML = "";

        if (!others.length) {
            relatedProductsList.innerHTML = `<p class="muted-cell">No other products available right now.</p>`;
            return;
        }

        others.forEach((item) => {
            const card = document.createElement("article");
            card.className = "product-card";

            card.innerHTML = `
                <div class="product-card-media">
                    <img src="${item.image}" alt="${item.name}" loading="lazy">
                </div>
                <div class="info">
                    <h3 class="product-title">${item.name}</h3>
                    <div class="product-meta">
                        <p class="price">$${Number(item.price).toFixed(2)}</p>
                        <span class="product-category-chip">${item.category || "Category"}</span>
                    </div>
                    <div class="product-actions">
                        <button class="add-btn related-add-btn" type="button">${translations[currentLang].addToCart}</button>
                        <a href="product.html?id=${item.id}" class="secondary-btn related-view-btn">View</a>
                    </div>
                </div>
            `;

            card.querySelector(".product-card-media").addEventListener("click", () => {
                window.location.href = `product.html?id=${item.id}`;
            });

            card.querySelector(".related-add-btn").addEventListener("click", async () => {
                await addProductToCart(item);
            });

            relatedProductsList.appendChild(card);
        });
    }

    updateCartCount();

    loadProducts()
        .then((products) => {
            const product = products.find((p) => Number(p.id) === productId);
            if (!product) {
                productName.textContent = "Product Not Found";
                productPrice.textContent = "";
                productDesc.textContent = "The requested product does not exist.";
                if (productCategory) productCategory.style.display = "none";
                if (productIdLabel) productIdLabel.style.display = "none";
                if (benefitsBox) benefitsBox.style.display = "none";
                if (actionsBox) actionsBox.style.display = "none";
                if (mediaNote) mediaNote.style.display = "none";
                if (addBtn) addBtn.style.display = "none";
                if (wishlistBtn) wishlistBtn.style.display = "none";
                if (relatedProductsList) relatedProductsList.innerHTML = "";
                return;
            }

            productImg.src = product.image;
            productImg.alt = product.name;
            productName.textContent = product.name;
            productPrice.textContent = `$${Number(product.price).toFixed(2)}`;
            productDesc.textContent = product.description || translations[currentLang].defaultProductDesc;
            if (productCategory) productCategory.textContent = product.category || "Uncategorized";
            if (productIdLabel) productIdLabel.textContent = `SKU: ${String(product.id).padStart(4, "0")}`;

            renderRelatedProducts(products, product);

            addBtn.addEventListener("click", async () => {
                await addProductToCart(product);
            });

            if (wishlistBtn) {
                wishlistBtn.addEventListener("click", async () => {
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
                    await updateCurrentUser(currentUser);
                    alert(`${product.name} added to Wishlist!`);
                });
            }
        })
        .catch((err) => console.error("Error loading product:", err));
});

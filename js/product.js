// product.js
document.addEventListener("DOMContentLoaded", () => {
    const productImg = document.getElementById("product-img");
    const productName = document.getElementById("product-name");
    const productPrice = document.getElementById("product-price");
    const productDesc = document.getElementById("product-desc");
    const addBtn = document.getElementById("add-to-cart-btn");
    const wishlistBtn = document.getElementById("add-to-wishlist-btn");
    const cartCount = document.getElementById("cart-count");

    // تحميل المستخدم الحالي
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    // تحديث عدد السلة
    function updateCartCount() {
        if (!currentUser || !currentUser.cart) {
            cartCount.textContent = 0;
        } else {
            const count = currentUser.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = count;
        }
    }
    updateCartCount();

    // الحصول على productId من الرابط
    const params = new URLSearchParams(window.location.search);
    const productId = parseInt(params.get("id"));

    // تحميل المنتج
    fetch("data/products.json")
        .then(res => res.json())
        .then(products => {
            const product = products.find(p => p.id === productId);
            if (!product) {
                productName.textContent = "Product Not Found";
                return;
            }

            // عرض بيانات المنتج
            productImg.src = product.image;
            productName.textContent = product.name;
            productPrice.textContent = `$${product.price}`;
            productDesc.textContent = product.description || translations[currentLang].defaultProductDesc;

            // زر إضافة للسلة
            addBtn.addEventListener("click", () => {
                if (!currentUser) {
                    alert("Please login first!");
                    window.location.href = "login.html";
                    return;
                }

                currentUser.cart = currentUser.cart || [];
                const existing = currentUser.cart.find(item => item.id === product.id);

                if (existing) {
                    existing.quantity += 1;
                } else {
                    currentUser.cart.push({ ...product, quantity: 1 });
                }

                updateCurrentUser(currentUser);
                updateCartCount();
                alert(`${product.name} added to cart!`);
            });

            // زر إضافة للمفضلة
            if (wishlistBtn) {
                wishlistBtn.addEventListener("click", () => {
                    if (!currentUser) {
                        alert("Please login first!");
                        window.location.href = "login.html";
                        return;
                    }

                    currentUser.wishlist = currentUser.wishlist || [];
                    const exists = currentUser.wishlist.find(item => item.id === product.id);

                    if (!exists) {
                        currentUser.wishlist.push(product);
                        updateCurrentUser(currentUser);
                        alert(`${product.name} added to Wishlist! ❤️`);
                    } else {
                        alert(`${product.name} is already in your Wishlist.`);
                    }
                });
            }
        })
        .catch(err => console.error("Error loading product:", err));

    // تحديث المستخدم في localStorage
    function updateCurrentUser(user) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex(u => u.email === user.email);
        if (index !== -1) users[index] = user;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(user));
    }
});

// product.js - fix wishlist button
document.addEventListener("DOMContentLoaded", () => {
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    function updateCurrentUser(user) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex(u => u.email === user.email);
        if (index !== -1) users[index] = user;
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(user));
        currentUser = user;
    }

    const wishlistBtn = document.getElementById("add-to-Wishlist-btn");
    if (wishlistBtn) {
        wishlistBtn.addEventListener("click", () => {
            if (!currentUser) {
                alert("Please login first!");
                window.location.href = "login.html";
                return;
            }

            currentUser.wishlist = currentUser.wishlist || [];

            // نتأكد إن المنتج مش موجود بالفعل
            const params = new URLSearchParams(window.location.search);
            const productId = parseInt(params.get("id"));

            fetch("data/products.json")
                .then(res => res.json())
                .then(products => {
                    const product = products.find(p => p.id === productId);
                    if (!product) return alert("Product not found!");

                    const exists = currentUser.wishlist.find(item => item.id === product.id);
                    if (!exists) {
                        // نخزن نسخة خفيفة من المنتج (id, name, price, image)
                        const wishlistItem = {
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image
                        };
                        currentUser.wishlist.push(wishlistItem);
                        updateCurrentUser(currentUser);
                        alert(`${product.name} added to Wishlist!`);
                    } else {
                        alert(`${product.name} is already in your Wishlist!`);
                    }
                });
        });
    }
});

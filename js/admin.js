document.addEventListener("DOMContentLoaded", async () => {
    const PRODUCTS_STORAGE_KEY = "productsData";
    const cartCountEl = document.getElementById("cart-count");
    const userInfoEl = document.getElementById("user-info");
    const guardMessageEl = document.getElementById("admin-guard-message");
    const adminContentEl = document.getElementById("admin-content");
    const ordersBody = document.querySelector("#admin-orders-table tbody");
    const productsBody = document.querySelector("#admin-products-table tbody");
    const productForm = document.getElementById("product-form");
    const resetProductFormBtn = document.getElementById("reset-product-form");
    const productIdInput = document.getElementById("product-id");
    const productNameInput = document.getElementById("product-name");
    const productCategoryInput = document.getElementById("product-category");
    const productPriceInput = document.getElementById("product-price");
    const productImageInput = document.getElementById("product-image");
    const tabButtons = document.querySelectorAll(".admin-tab-btn");
    const tabs = document.querySelectorAll(".admin-tab");
    const ADMIN_EMAIL = "youssefadmin@gmail.com";
    const ADMIN_PASSWORD = "adminY&M2005";

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const t = (key, fallback) => (translations?.[currentLang]?.[key] || fallback);

    if (!currentUser) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    if (!isAdminUser(currentUser)) {
        adminContentEl.style.display = "none";
        guardMessageEl.style.display = "block";
        guardMessageEl.textContent = `${t("adminAccessDenied", "Admin access only.")} (youssefAdmin@gmail.com)`;
        return;
    }

    renderNavbarUser();
    updateCartCount();
    bindTabs();

    let products = [];
    try {
        products = await loadProducts();
        renderOrders();
        renderProductsTable();
    } catch (error) {
        console.error("Admin page failed to initialize:", error);
        adminContentEl.style.display = "none";
        guardMessageEl.style.display = "block";
        guardMessageEl.textContent = "Admin page failed to load data. Open through localhost server, not file://";
        return;
    }

    productForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const id = Number(productIdInput.value);
        const name = productNameInput.value.trim();
        const category = productCategoryInput.value;
        const price = Number(productPriceInput.value);
        const image = productImageInput.value.trim();

        if (!name || !category || !price || !image) {
            alert("Please fill all product fields.");
            return;
        }

        if (id) {
            const index = products.findIndex((p) => p.id === id);
            if (index !== -1) {
                products[index] = { ...products[index], name, category, price, image };
            }
        } else {
            const nextId = products.length ? Math.max(...products.map((p) => Number(p.id) || 0)) + 1 : 1;
            products.push({ id: nextId, name, category, price, image });
        }

        saveProducts(products);
        renderProductsTable();
        clearProductForm();
    });

    resetProductFormBtn.addEventListener("click", clearProductForm);

    function isAdminUser(user) {
        const email = (user.email || "").trim().toLowerCase();
        const password = (user.password || "").trim();
        return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    }

    function bindTabs() {
        tabButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                tabButtons.forEach((b) => b.classList.remove("active"));
                tabs.forEach((tab) => tab.classList.remove("active"));

                btn.classList.add("active");
                const target = document.getElementById(btn.dataset.tab);
                if (target) target.classList.add("active");
            });
        });
    }

    function updateUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
        const refreshedCurrentUser = users.find((u) => u.email === currentUser.email);
        if (refreshedCurrentUser) {
            currentUser = refreshedCurrentUser;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
        }
    }

    function renderOrders() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const allOrders = [];

        users.forEach((user, userIndex) => {
            (user.orders || []).forEach((order, orderIndex) => {
                allOrders.push({ user, userIndex, order, orderIndex });
            });
        });

        ordersBody.innerHTML = "";
        if (allOrders.length === 0) {
            ordersBody.innerHTML = `<tr><td colspan="7" style="text-align:center;opacity:.7;">${t("noOrdersAdmin", "No orders found.")}</td></tr>`;
            return;
        }

        allOrders.forEach((entry, index) => {
            const { user, userIndex, order, orderIndex } = entry;
            const tr = document.createElement("tr");
            const productsText = (order.products || []).map((p) => `${p.name} x${p.quantity}`).join(", ");

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td>${user.name || "-"}<br><small>${user.email || ""}</small></td>
                <td>${productsText || "-"}</td>
                <td>$${Number(order.total || 0).toFixed(2)}</td>
                <td>
                    <select class="admin-status-select" data-user="${userIndex}" data-order="${orderIndex}">
                        <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                        <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                    </select>
                </td>
                <td>${order.date || "-"}</td>
                <td><button class="btn-small admin-delete-order" data-user="${userIndex}" data-order="${orderIndex}" style="background:#f44336;color:#fff;">${t("deleteAction", "Delete")}</button></td>
            `;
            ordersBody.appendChild(tr);
        });

        document.querySelectorAll(".admin-status-select").forEach((select) => {
            select.addEventListener("change", (e) => {
                const userIndex = Number(e.target.dataset.user);
                const orderIndex = Number(e.target.dataset.order);
                const users = JSON.parse(localStorage.getItem("users")) || [];

                users[userIndex].orders[orderIndex].status = e.target.value;
                updateUsers(users);
                renderOrders();
            });
        });

        document.querySelectorAll(".admin-delete-order").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const userIndex = Number(e.target.dataset.user);
                const orderIndex = Number(e.target.dataset.order);
                const users = JSON.parse(localStorage.getItem("users")) || [];

                users[userIndex].orders.splice(orderIndex, 1);
                updateUsers(users);
                renderOrders();
            });
        });
    }

    async function loadProducts() {
        const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
        if (storedProducts) {
            try {
                return JSON.parse(storedProducts);
            } catch (error) {
                console.error("Failed to parse productsData:", error);
            }
        }

        try {
            const response = await fetch("data/products.json");
            const defaultProducts = await response.json();
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(defaultProducts));
            return defaultProducts;
        } catch (error) {
            console.warn("Unable to fetch data/products.json, using empty list.", error);
            return [];
        }
    }

    function saveProducts(list) {
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(list));
    }

    function clearProductForm() {
        productIdInput.value = "";
        productNameInput.value = "";
        productCategoryInput.value = "Men";
        productPriceInput.value = "";
        productImageInput.value = "";
    }

    function renderProductsTable() {
        productsBody.innerHTML = "";

        if (!products.length) {
            productsBody.innerHTML = `<tr><td colspan="5" style="text-align:center;opacity:.7;">${t("noProductsAdmin", "No products found.")}</td></tr>`;
            return;
        }

        products.forEach((product) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${Number(product.price).toFixed(2)}</td>
                <td>
                    <button class="btn-small admin-edit-product" data-id="${product.id}">${t("editAction", "Edit")}</button>
                    <button class="btn-small admin-delete-product" data-id="${product.id}" style="background:#f44336;color:#fff;">${t("deleteAction", "Delete")}</button>
                </td>
            `;
            productsBody.appendChild(tr);
        });

        document.querySelectorAll(".admin-edit-product").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = Number(e.target.dataset.id);
                const product = products.find((p) => p.id === id);
                if (!product) return;

                productIdInput.value = product.id;
                productNameInput.value = product.name;
                productCategoryInput.value = product.category;
                productPriceInput.value = product.price;
                productImageInput.value = product.image;
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });

        document.querySelectorAll(".admin-delete-product").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const id = Number(e.target.dataset.id);
                products = products.filter((p) => p.id !== id);
                saveProducts(products);
                renderProductsTable();
            });
        });
    }

    function updateCartCount() {
        if (!cartCountEl) return;
        const count = (currentUser.cart || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
        cartCountEl.textContent = count;
    }

    function renderNavbarUser() {
        if (!userInfoEl) return;
        userInfoEl.innerHTML = `
            <span style="color:#d4af37; font-weight:600;">${currentUser.name}</span>
            <i id="logout-btn" style="padding:5px 10px; font-size:0.8rem; margin-left:10px;" class="fa-solid fa-right-from-bracket">${translations[currentLang].logout}</i>
        `;

        const logoutBtn = document.getElementById("logout-btn");
        if (!logoutBtn) return;
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "login.html";
        });
    }
});

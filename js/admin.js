document.addEventListener("DOMContentLoaded", async () => {
    const PRODUCTS_STORAGE_KEY = "productsData";
    const cartCountEl = document.getElementById("cart-count");
    const userInfoEl = document.getElementById("user-info");
    const guardMessageEl = document.getElementById("admin-guard-message");
    const adminContentEl = document.getElementById("admin-content");
    const ordersBody = document.querySelector("#admin-orders-table tbody");
    const productsBody = document.querySelector("#admin-products-table tbody");
    const usersBody = document.querySelector("#admin-users-table tbody");
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

    let currentUser = await usersStore.syncCurrentUserFromStore();
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
        await renderOrders();
        renderProductsTable();
        await renderUsersTable();
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

    async function updateUsers(users) {
        await usersStore.saveUsers(users);
        const refreshedCurrentUser = users.find((u) => u.email === currentUser.email);
        if (refreshedCurrentUser) {
            currentUser = refreshedCurrentUser;
            usersStore.setCurrentUser(currentUser);
        }
    }

    async function renderOrders() {
        const users = await usersStore.getUsers();
        const allOrders = [];

        users.forEach((user, userIndex) => {
            (user.orders || []).forEach((order, orderIndex) => {
                allOrders.push({ user, userIndex, order, orderIndex });
            });
        });

        ordersBody.innerHTML = "";
        if (allOrders.length === 0) {
            ordersBody.innerHTML = `<tr><td colspan="7" class="muted-cell">${t("noOrdersAdmin", "No orders found.")}</td></tr>`;
            return;
        }

        allOrders.forEach((entry, index) => {
            const { user, userIndex, order, orderIndex } = entry;
            const tr = document.createElement("tr");
            const productsText = (order.products || []).map((p) => `${p.name} x${p.quantity}`).join(", ");

            tr.innerHTML = `
                <td data-label="#">${index + 1}</td>
                <td data-label="${t("customer", "Customer")}">${user.name || "-"}<br><small>${user.email || ""}</small></td>
                <td data-label="${t("products", "Products")}" class="admin-products-cell">${productsText || "-"}</td>
                <td data-label="${t("total", "Total")}">$${Number(order.total || 0).toFixed(2)}</td>
                <td data-label="${t("status", "Status")}">
                    <select class="admin-status-select" data-user="${userIndex}" data-order="${orderIndex}">
                        <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                        <option value="Completed" ${order.status === "Completed" ? "selected" : ""}>Completed</option>
                        <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                    </select>
                </td>
                <td data-label="${t("date", "Date")}">${order.date || "-"}</td>
                <td data-label="${t("actions", "Actions")}" class="admin-actions-cell"><button class="btn-small admin-delete-order danger-btn" data-user="${userIndex}" data-order="${orderIndex}">${t("deleteAction", "Delete")}</button></td>
            `;
            ordersBody.appendChild(tr);
        });

        document.querySelectorAll(".admin-status-select").forEach((select) => {
            select.addEventListener("change", async (e) => {
                const userIndex = Number(e.target.dataset.user);
                const orderIndex = Number(e.target.dataset.order);
                const users = await usersStore.getUsers();

                users[userIndex].orders[orderIndex].status = e.target.value;
                await updateUsers(users);
                await renderOrders();
                await renderUsersTable();
            });
        });

        document.querySelectorAll(".admin-delete-order").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const userIndex = Number(e.target.dataset.user);
                const orderIndex = Number(e.target.dataset.order);
                const users = await usersStore.getUsers();

                users[userIndex].orders.splice(orderIndex, 1);
                await updateUsers(users);
                await renderOrders();
                await renderUsersTable();
            });
        });
    }

    async function renderUsersTable() {
        if (!usersBody) return;
        const users = await usersStore.getUsers();

        usersBody.innerHTML = "";
        if (!users.length) {
            usersBody.innerHTML = '<tr><td colspan="6" class="muted-cell">No users found.</td></tr>';
            return;
        }

        users.forEach((user, index) => {
            const tr = document.createElement("tr");
            const isCoreAdmin = (user.email || "").toLowerCase() === ADMIN_EMAIL;
            const ordersCount = (user.orders || []).length;
            const cartCount = (user.cart || []).reduce((sum, item) => sum + (item.quantity || 0), 0);

            tr.innerHTML = `
                <td data-label="#">${index + 1}</td>
                <td data-label="Name">${user.name || "-"}</td>
                <td data-label="Email">${user.email || "-"}</td>
                <td data-label="Orders">${ordersCount}</td>
                <td data-label="Cart Items">${cartCount}</td>
                <td data-label="Actions" class="admin-actions-cell">
                    <button class="btn-small admin-copy-email" data-email="${user.email || ""}">Copy Email</button>
                    ${isCoreAdmin ? "" : `<button class="btn-small admin-delete-user danger-btn" data-email="${user.email || ""}">Delete User</button>`}
                </td>
            `;
            usersBody.appendChild(tr);
        });

        document.querySelectorAll(".admin-copy-email").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const email = e.currentTarget.dataset.email || "";
                try {
                    await navigator.clipboard.writeText(email);
                    alert("Email copied.");
                } catch (error) {
                    alert(email);
                }
            });
        });

        document.querySelectorAll(".admin-delete-user").forEach((btn) => {
            btn.addEventListener("click", async (e) => {
                const email = e.currentTarget.dataset.email || "";
                if (!email) return;
                if (!confirm(`Delete user ${email}?`)) return;

                const users = await usersStore.getUsers();
                const filtered = users.filter((u) => u.email !== email);
                await updateUsers(filtered);
                await renderUsersTable();
                await renderOrders();
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
            productsBody.innerHTML = `<tr><td colspan="5" class="muted-cell">${t("noProductsAdmin", "No products found.")}</td></tr>`;
            return;
        }

        products.forEach((product) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td data-label="ID">${product.id}</td>
                <td data-label="${t("product", "Product")}">${product.name}</td>
                <td data-label="${t("category", "Category")}">${product.category}</td>
                <td data-label="${t("price", "Price")}">$${Number(product.price).toFixed(2)}</td>
                <td data-label="${t("actions", "Actions")}" class="admin-actions-cell">
                    <button class="btn-small admin-edit-product" data-id="${product.id}">${t("editAction", "Edit")}</button>
                    <button class="btn-small admin-delete-product danger-btn" data-id="${product.id}">${t("deleteAction", "Delete")}</button>
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
            <span class="text-accent">${currentUser.name}</span>
            <i id="logout-btn" style="padding:5px 10px; font-size:0.8rem; margin-left:10px;" class="fa-solid fa-right-from-bracket">${translations[currentLang].logout}</i>
        `;

        const logoutBtn = document.getElementById("logout-btn");
        if (!logoutBtn) return;
        logoutBtn.addEventListener("click", () => {
            usersStore.clearCurrentUser();
            window.location.href = "login.html";
        });
    }
});

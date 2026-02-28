// account.js
document.addEventListener("DOMContentLoaded", async () => {
    const cartCountEl = document.getElementById("cart-count");
    const userInfoEl = document.getElementById("user-info");
    const profileNameInput = document.getElementById("profile-name");
    const profileEmailInput = document.getElementById("profile-email");
    const profilePasswordInput = document.getElementById("profile-password");
    const profileForm = document.getElementById("profile-form");
    const ordersTableBody = document.querySelector("#orders-table tbody");
    const wishlistGrid = document.getElementById("wishlist-grid");
    const languageSelect = document.getElementById("language-select");
    const settingsForm = document.getElementById("settings-form");
    const tabs = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab");
    const adminPanelLink = document.getElementById("admin-panel-link");
    const clearWishlistBtn = document.getElementById("clear-wishlist");
    const ADMIN_EMAIL = "youssefadmin@gmail.com";

    let currentUser = await usersStore.syncCurrentUserFromStore();
    if (!currentUser) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    if (adminPanelLink) {
        const isAllowedAdmin = (currentUser.email || "").trim().toLowerCase() === ADMIN_EMAIL;
        adminPanelLink.style.display = isAllowedAdmin ? "list-item" : "none";
    }

    async function persistUser(user, oldEmail = null) {
        await usersStore.upsertUser(user, oldEmail);
        currentUser = usersStore.getCurrentUser();
    }

    function updateCartCount() {
        const count = (currentUser.cart || []).reduce((s, it) => s + (it.quantity || 0), 0);
        if (cartCountEl) cartCountEl.textContent = count;
    }

    function renderNavbarUser() {
        if (!userInfoEl) return;

        const greetingText = currentLang === "ar"
            ? `${currentUser.name}, Welcome`
            : `Hi, ${currentUser.name}`;

        userInfoEl.innerHTML = `
            <span class="user-name text-accent" style="display:inline-block;">${greetingText}</span>
            <i id="logout-btn" style="padding:5px 10px; font-size:0.8rem; margin-left:10px;" class="fa-solid fa-right-from-bracket">${translations[currentLang].logout}</i>
        `;

        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click", () => {
            usersStore.clearCurrentUser();
            window.location.href = "login.html";
        });
    }

    const ACTIVE_TAB_KEY = "accountActiveTab";
    function setActiveTab(tabName) {
        tabs.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active", "fade-in"));
        const tabLink = [...tabs].find((t) => t.dataset.tab === tabName);
        const tabContent = document.getElementById(tabName);
        if (tabLink && tabContent) {
            tabLink.classList.add("active");
            tabContent.classList.add("active", "fade-in");
            localStorage.setItem(ACTIVE_TAB_KEY, tabName);
        }
    }

    tabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            setActiveTab(tab.dataset.tab);
        });
    });
    setActiveTab(localStorage.getItem(ACTIVE_TAB_KEY) || "profile");

    profileNameInput.value = currentUser.name || "";
    profileEmailInput.value = currentUser.email || "";
    profilePasswordInput.value = "";

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const newName = profileNameInput.value.trim();
        const newEmail = profileEmailInput.value.trim();
        const newPassword = profilePasswordInput.value.trim();

        if (!newName || !newEmail) {
            alert("Name and email cannot be empty.");
            return;
        }

        const users = await usersStore.getUsers();
        const emailChanged = newEmail !== currentUser.email;
        if (emailChanged) {
            const exists = users.find((u) => u.email === newEmail);
            if (exists) {
                alert("This email is already used by another account.");
                return;
            }
        }

        const oldEmail = currentUser.email;
        currentUser.name = newName;
        currentUser.email = newEmail;
        if (newPassword) currentUser.password = newPassword;

        await persistUser(currentUser, oldEmail);

        document.querySelectorAll(".user-name").forEach((el) => {
            el.textContent = `Hi, ${currentUser.name}`;
        });
        alert("Profile updated successfully!");
        profilePasswordInput.value = "";
        renderNavbarUser();
    });

    function createOrderModal() {
        const modal = document.createElement("div");
        modal.id = "order-modal";
        modal.innerHTML = `
            <div id="order-modal-content">
                <span id="close-modal">&times;</span>
                <h3>Order Details</h3>
                <div id="order-details-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener("click", (e) => {
            if (e.target === modal || e.target.id === "close-modal") {
                modal.style.display = "none";
            }
        });

        return modal;
    }

    const orderModal = createOrderModal();

    function renderOrders() {
        ordersTableBody.innerHTML = "";
        const orders = currentUser.orders || [];
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="4" class="muted-cell">${translations[currentLang].noOrders}</td></tr>`;
            return;
        }

        orders.forEach((order, idx) => {
            const tr = document.createElement("tr");
            let statusColor = "#ccc";
            let statusText = translations[currentLang][`status${order.status}`] || order.status;

            if (order.status === "Pending") statusColor = "#f0a500";
            if (order.status === "Completed") statusColor = "#4caf50";
            if (order.status === "Cancelled") statusColor = "#f44336";

            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${order.products.map((p) => `${p.name} x${p.quantity}`).join(", ")}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td style="color:${statusColor}; font-weight:600;">${statusText}</td>
            `;

            tr.addEventListener("click", () => {
                const detailsDiv = document.getElementById("order-details-body");
                detailsDiv.innerHTML = `
                    <p><strong>${translations[currentLang].orderNumber}:</strong> ${idx + 1}</p>
                    <p><strong>${translations[currentLang].date || "Date"}:</strong> ${order.date || translations[currentLang].unknown}</p>
                    <p><strong>${translations[currentLang].status}:</strong> ${statusText}</p>
                    <p><strong>${translations[currentLang].total}:</strong> $${order.total.toFixed(2)}</p>
                    <h4>${translations[currentLang].products}:</h4>
                    <ul style="margin-left:20px;">
                        ${order.products.map((p) => `<li>${p.name} x${p.quantity} ($${p.price})</li>`).join("")}
                    </ul>
                `;
                orderModal.style.display = "flex";
            });

            ordersTableBody.appendChild(tr);
        });
    }

    function renderWishlist() {
        wishlistGrid.innerHTML = "";
        const wishlist = currentUser.wishlist || [];
        if (wishlist.length === 0) {
            wishlistGrid.innerHTML = `<p class="muted-cell">${translations[currentLang].emptyWishlist}</p>`;
            return;
        }

        wishlist.forEach((p) => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${p.image}" alt="${p.name}">
                <div class="info" style="text-align:center;">
                    <h4 style="margin:8px 0 4px;">${p.name}</h4>
                    <p class="price" style="margin:0 0 10px;">$${p.price}</p>
                    <div style="justify-content:center; grid-template-columns: repeat(2, minmax(30px, 1fr)); display:grid; gap:8px; align-items:center;">
                        <button class="btn-small add-wish-to-cart">${translations[currentLang].addToCart}</button>
                        <a href="product.html?id=${p.id}" class="btn-small">${translations[currentLang].view}</a>
                        <button style="grid-column: 1 / -1;" class="remove-from-wishlist danger-btn">${translations[currentLang].remove}</button>
                    </div>
                </div>
            `;

            card.querySelector(".add-wish-to-cart").addEventListener("click", async (e) => {
                e.preventDefault();
                currentUser.cart = currentUser.cart || [];
                const existing = currentUser.cart.find((it) => it.id === p.id);
                if (existing) existing.quantity += 1;
                else currentUser.cart.push({ ...p, quantity: 1 });

                await persistUser(currentUser);
                updateCartCount();
                alert(`${p.name} added to cart!`);
            });

            card.querySelector(".remove-from-wishlist").addEventListener("click", async (e) => {
                e.preventDefault();
                currentUser.wishlist = (currentUser.wishlist || []).filter((it) => it.id !== p.id);
                await persistUser(currentUser);
                renderWishlist();
            });

            wishlistGrid.appendChild(card);
        });
    }

    if (settingsForm) {
        languageSelect.value = currentLang;
        settingsForm.addEventListener("submit", (e) => {
            e.preventDefault();
            localStorage.setItem("selectedLanguage", languageSelect.value);
            window.location.reload();
        });
    }

    if (clearWishlistBtn) {
        clearWishlistBtn.addEventListener("click", async () => {
            if (!confirm("Are you sure you want to clear your wishlist?")) return;
            currentUser.wishlist = [];
            await persistUser(currentUser);
            renderWishlist();
        });
    }

    renderNavbarUser();
    updateCartCount();
    renderOrders();
    renderWishlist();
});

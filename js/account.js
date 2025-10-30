// account.js
document.addEventListener("DOMContentLoaded", () => {
    // elements
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

    // load current user
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    // utility: save currentUser and users list
    function persistUser(user, oldEmail = null) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        // if oldEmail provided, find by oldEmail (useful when email changes)
        let idx = -1;
        if (oldEmail) {
            idx = users.findIndex(u => u.email === oldEmail);
        } else {
            idx = users.findIndex(u => u.email === user.email);
        }
        if (idx !== -1) {
            users[idx] = user;
        } else {
            // fallback: try finding by id-like uniqueness (email uniqueness expected)
            const altIdx = users.findIndex(u => u.email === oldEmail || (u.name === user.name && u.password === user.password));
            if (altIdx !== -1) users[altIdx] = user;
            else users.push(user);
        }
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(user));
        currentUser = user;
    }

    // update cart count in navbar
    function updateCartCount() {
        const count = (currentUser.cart || []).reduce((s, it) => s + (it.quantity || 0), 0);
        if (cartCountEl) cartCountEl.textContent = count;
    }

    // render user info in navbar (name + logout)
// render user info in navbar (name + logout)
function renderNavbarUser() {
    if (!userInfoEl) return;

    // نص الترحيب حسب اللغة
    const greetingText = currentLang === "ar"
        ? `${currentUser.name}, أهلاً`
        : `Hi,  ${currentUser.name}`;

    userInfoEl.innerHTML = `
        <span class="user-name" 
            style="color:#d4af37; font-weight:600; display:inline-block;">
            ${greetingText}
        </span>
        <button id="logout-btn" class="btn" style="padding:5px 10px; font-size:0.8rem; margin-left:10px;">
            ${translations[currentLang].logout}
        </button>`;

    const logoutBtn = document.getElementById("logout-btn");
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}

    // ------------------------
    // Tabs: preserve active tab in localStorage
    // ------------------------
    const ACTIVE_TAB_KEY = "accountActiveTab";
    function setActiveTab(tabName) {
        // remove active classes
        tabs.forEach(t => t.classList.remove("active"));
        tabContents.forEach(c => c.classList.remove("active", "fade-in"));
        // set new
        const tabLink = [...tabs].find(t => t.dataset.tab === tabName);
        const tabContent = document.getElementById(tabName);
        if (tabLink && tabContent) {
            tabLink.classList.add("active");
            tabContent.classList.add("active", "fade-in");
            localStorage.setItem(ACTIVE_TAB_KEY, tabName);
        }
    }
    // bind click
    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            setActiveTab(tab.dataset.tab);
        });
    });
    // set initial tab from storage or default 'profile'
    const savedTab = localStorage.getItem(ACTIVE_TAB_KEY) || "profile";
    setActiveTab(savedTab);

    // ------------------------
    // Profile: populate and handle update
    // ------------------------
    profileNameInput.value = currentUser.name || "";
    profileEmailInput.value = currentUser.email || "";
    profilePasswordInput.value = ""; // don't prefill passwords

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const newName = profileNameInput.value.trim();
        const newEmail = profileEmailInput.value.trim();
        const newPassword = profilePasswordInput.value.trim();

        if (!newName || !newEmail) {
            alert("Name and email cannot be empty.");
            return;
        }

        // if email changed, ensure uniqueness
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const emailChanged = newEmail !== currentUser.email;
        if (emailChanged) {
            const exists = users.find(u => u.email === newEmail);
            if (exists) {
                alert("This email is already used by another account.");
                return;
            }
        }

        const oldEmail = currentUser.email;
        currentUser.name = newName;
        currentUser.email = newEmail;
        if (newPassword) currentUser.password = newPassword; // change only if provided

        persistUser(currentUser, oldEmail);

        // reflect update in UI
        document.querySelectorAll(".user-name").forEach(el => el.textContent = `Hi, ${currentUser.name}`);
        alert("Profile updated successfully!");
        profilePasswordInput.value = ""; // clear password field
        renderNavbarUser();
    });

    // ------------------------
    // Orders
    // ------------------------
    function renderOrders() {
        ordersTableBody.innerHTML = "";
        const orders = currentUser.orders || [];
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;opacity:0.7;">${translations[currentLang].noOrders}</td></tr>`;
            return;
        }

        orders.forEach((order, idx) => {
            const tr = document.createElement("tr");
            // colorize status
            let statusColor = "#ccc";
            if (order.status === "Pending") statusColor = "#f0a500";
            if (order.status === "Completed") statusColor = "#4caf50";
            if (order.status === "Cancelled") statusColor = "#f44336";

            tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${order.products.map(p => `${p.name} x${p.quantity}`).join(", ")}</td>
        <td>$${order.total.toFixed(2)}</td>
        <td style="color:${statusColor}; font-weight:600;">${order.status}</td>
      `;
            // click to show details
            tr.addEventListener("click", () => {
                // show simple modal-like detail using confirm/alert or custom; we'll use alert with details
                const details = [
                    `Order #${idx + 1}`,
                    `Date: ${order.date || "Unknown"}`,
                    `Status: ${order.status}`,
                    `Total: $${order.total.toFixed(2)}`,
                    `Products:`,
                    ...order.products.map(p => ` - ${p.name} x${p.quantity} ($${p.price})`)
                ].join("\n");
                alert(details);
            });

            ordersTableBody.appendChild(tr);
        });
    }

    // ------------------------
    // Wishlist
    // ------------------------
    function renderWishlist() {
        wishlistGrid.innerHTML = "";
        const wishlist = currentUser.wishlist || [];
        if (wishlist.length === 0) {
            wishlistGrid.innerHTML = `<p style="opacity:0.7; color: #ccc;">${translations[currentLang].emptyWishlist}</p>`;
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
    <div style="justify-content:center; display:flex; gap:8px; align-items:center;">
      <a href="product.html?id=${p.id}" class="btn-small">${translations[currentLang].view}</a>
      <button class="btn-small add-wish-to-cart">${translations[currentLang].addToCart}</button>
      <button class="btn-small remove-from-wishlist" style="background:#f44336;">${translations[currentLang].remove}</button>
    </div>
  </div>
`;

            // Add to Cart from wishlist
            card.querySelector(".add-wish-to-cart").addEventListener("click", (e) => {
                e.preventDefault();
                currentUser.cart = currentUser.cart || [];
                const existing = currentUser.cart.find(it => it.id === p.id);
                if (existing) existing.quantity += 1;
                else currentUser.cart.push({ ...p, quantity: 1 });

                persistUser(currentUser);
                updateCartCount();
                alert(`${p.name} added to cart!`);
            });

            // Remove from wishlist
            card.querySelector(".remove-from-wishlist").addEventListener("click", (e) => {
                e.preventDefault();
                currentUser.wishlist = (currentUser.wishlist || []).filter(it => it.id !== p.id);
                persistUser(currentUser);
                renderWishlist();
            });

            wishlistGrid.appendChild(card);
        });
    }
    // ------------------------
    //  MODAL FOR ORDER DETAILS
    // ------------------------
    function createOrderModal() {
        const modal = document.createElement("div");
        modal.id = "order-modal";
        modal.style.cssText = `
    display:none; position:fixed; top:0; left:0; width:100%; height:100%;
    background:rgba(0,0,0,0.6); justify-content:center; align-items:center; z-index:1000;
  `;
        modal.innerHTML = `
    <div id="order-modal-content" style="
      background:#fff; padding:20px; border-radius:10px; max-width:500px; width:90%;
      position:relative; color:#000; overflow-y:auto; max-height:80vh;
    ">
      <span id="close-modal" style="
        position:absolute; top:10px; right:15px; cursor:pointer; font-size:20px;
      ">&times;</span>
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

    // تعديل دالة renderOrders لعرض المودال بدلاً من alert
    function renderOrders() {
        ordersTableBody.innerHTML = "";
        const orders = currentUser.orders || [];
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;opacity:0.7;">${translations[currentLang].noOrders}</td></tr>`;
            return;
        }

        orders.forEach((order, idx) => {
            const tr = document.createElement("tr");
            let statusColor = "#ccc";
            // استخدم النص المترجم
            let statusText = translations[currentLang][`status${order.status}`] || order.status;

            if (order.status === "Pending") statusColor = "#f0a500";
            if (order.status === "Completed") statusColor = "#4caf50";
            if (order.status === "Cancelled") statusColor = "#f44336";

            tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${order.products.map(p => `${p.name} x${p.quantity}`).join(", ")}</td>
      <td>$${order.total.toFixed(2)}</td>
      <td style="color:${statusColor}; font-weight:600;">${statusText}</td>
    `;

            tr.addEventListener("click", () => {
                const detailsDiv = document.getElementById("order-details-body");

                // كل النصوص هنا مترجمة
                detailsDiv.innerHTML = `
        <p><strong>${translations[currentLang].orderNumber}:</strong> ${idx + 1}</p>
        <p><strong>${translations[currentLang].date || "Date"}:</strong> ${order.date || translations[currentLang].unknown}</p>
        <p><strong>${translations[currentLang].status}:</strong> ${statusText}</p>
        <p><strong>${translations[currentLang].total}:</strong> $${order.total.toFixed(2)}</p>
        <h4>${translations[currentLang].products}:</h4>
        <ul style="margin-left:20px;">
          ${order.products.map(p => `<li>${p.name} x${p.quantity} ($${p.price})</li>`).join("")}
        </ul>
      `;
                orderModal.style.display = "flex";
            });

            ordersTableBody.appendChild(tr);
        });
    }

    // ------------------------
    // initialization & renders
    // ------------------------
    renderNavbarUser();
    updateCartCount();
    renderOrders();
    renderWishlist();


    // Clear Wishlist button
    document.getElementById("clear-wishlist").addEventListener("click", () => {
        if (confirm("Are you sure you want to clear your wishlist?")) {
            currentUser.wishlist = [];
            persistUser(currentUser);
            renderWishlist();
        }
    });




}); // DOMContentLoaded end

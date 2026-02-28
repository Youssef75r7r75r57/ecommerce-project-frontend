document.addEventListener("DOMContentLoaded", () => {
    const cartCount = document.getElementById("cart-count");
    const userInfo = document.getElementById("user-info");
    const checkoutItems = document.getElementById("checkout-items");
    const checkoutForm = document.getElementById("checkout-form");
    const subtotalEl = document.getElementById("summary-subtotal");
    const shippingEl = document.getElementById("summary-shipping");
    const totalEl = document.getElementById("summary-total");

    const shippingCost = 5;
    // Google Apps Script webhook URL
    const SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz3ge9wZR2EJd54TV_MZXQ0mPQSDO1kgkZ57w6b7F3FHmS8TfiKvaxRkZOMoHIZ8X2R/exec";
    let currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    let cart = currentUser.cart || [];
    if (cart.length === 0) {
        alert("Your cart is empty.");
        window.location.href = "cart.html";
        return;
    }

    function updateCurrentUser(user) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex((u) => u.email === user.email);

        if (index !== -1) {
            users[index] = user;
        } else {
            users.push(user);
        }

        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(user));
    }

    function renderUser() {
        const count = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = count;

        userInfo.innerHTML = `
            <span style="color:#d4af37; font-weight:600;">${currentUser.name}</span>
            <i id="logout-btn" style="padding:5px 10px; font-size:0.8rem; margin-left:10px;" class="fa-solid fa-right-from-bracket">${translations[currentLang].logout}</i>
        `;

        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("currentUser");
            window.location.href = "index.html";
        });
    }

    function renderSummary() {
        checkoutItems.innerHTML = "";
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const total = subtotal + shippingCost;

        cart.forEach((item) => {
            const row = document.createElement("div");
            row.className = "checkout-item";
            row.innerHTML = `
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            checkoutItems.appendChild(row);
        });

        subtotalEl.textContent = subtotal.toFixed(2);
        shippingEl.textContent = shippingCost.toFixed(2);
        totalEl.textContent = total.toFixed(2);
    }

    async function sendOrderToSheet(orderData) {
        if (!SHEET_WEBHOOK_URL) return;

        const payload = {
            fullname: orderData.shippingInfo.fullName,
            phone: orderData.shippingInfo.phone,
            address: orderData.shippingInfo.address,
            city: orderData.shippingInfo.city,
            ordernotes: orderData.shippingInfo.notes || "",
            orderDate: orderData.date,
            customerEmail: currentUser.email || "",
            subtotal: orderData.subtotal,
            shipping: orderData.shipping,
            total: orderData.total,
            status: orderData.status,
            products: orderData.products
                .map((p) => `${p.name} x${p.quantity} ($${p.price})`)
                .join(" | ")
        };

        try {
            const response = await fetch(SHEET_WEBHOOK_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) return;
        } catch (error) {
            console.warn("JSON sync failed, trying fallback transport.", error);
        }

        await fetch(SHEET_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=UTF-8"
            },
            body: JSON.stringify(payload)
        });
    }

    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fullName = document.getElementById("full-name").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const address = document.getElementById("address").value.trim();
        const city = document.getElementById("city").value.trim();
        const notes = document.getElementById("notes").value.trim();

        if (!fullName || !phone || !address || !city) {
            alert("Please fill all required fields.");
            return;
        }

        const subtotal = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const total = subtotal + shippingCost;

        const order = {
            products: cart.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: p.quantity
            })),
            shippingInfo: { fullName, phone, address, city, notes },
            subtotal,
            shipping: shippingCost,
            total,
            status: "Pending",
            date: new Date().toLocaleString()
        };

        currentUser.orders = currentUser.orders || [];
        currentUser.orders.push(order);
        currentUser.cart = [];
        cart = [];
        updateCurrentUser(currentUser);

        try {
            await sendOrderToSheet(order);
        } catch (error) {
            console.error(error);
            alert("Order saved, but failed to sync with sheet.");
        }

        alert("Order placed successfully!");
        window.location.href = "account.html";
    });

    renderUser();
    renderSummary();
});

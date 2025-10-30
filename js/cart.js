document.addEventListener("DOMContentLoaded", () => {
    const cartTableBody = document.querySelector("#cart-table tbody");
    const totalPriceEl = document.getElementById("total-price");
    const cartCount = document.getElementById("cart-count");

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Please login first!");
        window.location.href = "login.html";
    }

    let cart = currentUser.cart || [];
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    function renderCart() {
        cartTableBody.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const row = document.createElement("tr");
            row.innerHTML = `
        <td style="padding:10px; display:flex; align-items:center;">
            <img src="${item.image}" alt="${item.name}" style="width:50px; height:50px; object-fit:cover; border-radius:5px; margin-right:10px;">
            <span style="font-size:16px; font-weight:bold; color: #fff;">${item.name}</span>
        </td>
        <td style="padding:10px; font-size:16px; color: #fff;">$${item.price}</td>
        <td style="padding:10px;">
            <input type="number" class="quantity-input" min="1" value="${item.quantity}" data-index="${index}" 
            style="width:50px; padding:5px; font-size:16px; text-align:center; border-radius:5px; border:1px solid #ccc;">
        </td>
        <td style="padding:10px; font-size:16px; font-weight:bold; color: #fff;">$${subtotal.toFixed(2)}</td>
        <td style="padding:10px;">
            <button class="remove-btn" data-index="${index}" 
            style="padding:5px 10px; background-color:#f44336; color:#fff; border:none; border-radius:5px; cursor:pointer;">X</button>
        </td>
      `;
            cartTableBody.appendChild(row);
        });

        totalPriceEl.textContent = total.toFixed(2);
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        addCartListeners();
    }

    function addCartListeners() {
        document.querySelectorAll(".quantity-input").forEach(input => {
            input.addEventListener("change", (e) => {
                const index = e.target.dataset.index;
                let val = parseInt(e.target.value);
                if (val < 1) val = 1;
                cart[index].quantity = val;
                saveCart();
                renderCart();
            });
        });

        document.querySelectorAll(".remove-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const index = e.target.dataset.index;
                cart.splice(index, 1);
                saveCart();
                renderCart();
            });
        });
    }

    function saveCart() {
        currentUser.cart = cart;
        updateCurrentUser(currentUser);
    }

    function updateCurrentUser(user) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex(u => u.email === user.email);
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem("users", JSON.stringify(users));
        }
        localStorage.setItem("currentUser", JSON.stringify(user));
    }

document.getElementById("checkout-btn").addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Cart is empty!");
        return;
    }

    // إنشاء الطلب
    const order = {
        products: cart.map(p => ({ id: p.id, name: p.name, price: p.price, quantity: p.quantity })),
        total: cart.reduce((sum, p) => sum + p.price * p.quantity, 0),
        status: "Pending",
        date: new Date().toLocaleString()
    };

    // إضافة الطلب للمستخدم الحالي
    currentUser.orders = currentUser.orders || [];
    currentUser.orders.push(order);

    // تفريغ السلة
    cart = [];
    currentUser.cart = cart;

    // تحديث LocalStorage
    updateCurrentUser(currentUser);

    renderCart();
    alert("Order placed successfully!");
});

function updateCurrentUser(user) {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.email === user.email);
    if (index !== -1) users[index] = user;
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(user));
};

    renderCart();
});

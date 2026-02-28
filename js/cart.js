document.addEventListener("DOMContentLoaded", () => {
    const cartTableBody = document.querySelector("#cart-table tbody");
    const totalPriceEl = document.getElementById("total-price");
    const cartCount = document.getElementById("cart-count");
    const checkoutBtn = document.getElementById("checkout-btn");

    let currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    let cart = currentUser.cart || [];
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

    function updateCurrentUser(user) {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const index = users.findIndex((u) => u.email === user.email);

        if (index !== -1) {
            users[index] = user;
            localStorage.setItem("users", JSON.stringify(users));
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
    }

    function saveCart() {
        currentUser.cart = cart;
        updateCurrentUser(currentUser);
    }

    function renderCart() {
        cartTableBody.innerHTML = "";
        let total = 0;

        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;

            const row = document.createElement("tr");
            row.innerHTML = `
        <td class="cart-product-cell">
            <img src="${item.image}" alt="${item.name}">
            <span>${item.name}</span>
        </td>
        <td>$${item.price}</td>
        <td>
            <input type="number" class="quantity-input" min="1" value="${item.quantity}" data-index="${index}" 
            style="width:60px; text-align:center;">
        </td>
        <td><strong>$${subtotal.toFixed(2)}</strong></td>
        <td>
            <button class="remove-btn" data-index="${index}"></button>
        </td>
      `;
            cartTableBody.appendChild(row);
        });

        totalPriceEl.textContent = total.toFixed(2);
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);

        addCartListeners();
    }

    function addCartListeners() {
        document.querySelectorAll(".quantity-input").forEach((input) => {
            input.addEventListener("change", (e) => {
                const index = Number(e.target.dataset.index);
                let val = parseInt(e.target.value, 10);

                if (!val || val < 1) val = 1;
                cart[index].quantity = val;
                saveCart();
                renderCart();
            });
        });

        document.querySelectorAll(".remove-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const index = Number(e.target.dataset.index);
                cart.splice(index, 1);
                saveCart();
                renderCart();
            });
        });
    }

    checkoutBtn.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Cart is empty!");
            return;
        }

        window.location.href = "checkout.html";
    });

    renderCart();
});

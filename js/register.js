document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirm-password").value.trim();

        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill all fields!");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        // Load users from LocalStorage or create empty array
        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Check if email already exists
        const existingUser = users.find(user => user.email === email);
        if (existingUser) {
            alert("Email already registered!");
            return;
        }

        // Add new user
        users.push({
            name: name,
            email: email,
            password: password,
            cart: [] // السلة الخاصة بالمستخدم
        });
        localStorage.setItem("users", JSON.stringify(users));

        alert("Registration successful! Please login.");
        window.location.href = "login.html";
    });
});

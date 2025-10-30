document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please fill all fields!");
            return;
        }

        // Simulate login (for portfolio, no backend)
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            localStorage.setItem("currentUser", JSON.stringify(user));
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert("Invalid email or password!");
        }

    });
});

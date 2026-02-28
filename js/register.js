document.addEventListener("DOMContentLoaded", async () => {
    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", async (e) => {
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

        const users = await usersStore.getUsers();
        const existingUser = users.find((user) => user.email === email);
        if (existingUser) {
            alert("Email already registered!");
            return;
        }

        users.push({
            name,
            email,
            password,
            cart: [],
            wishlist: [],
            orders: []
        });

        await usersStore.saveUsers(users);

        alert("Registration successful! Please login.");
        window.location.href = "login.html";
    });
});

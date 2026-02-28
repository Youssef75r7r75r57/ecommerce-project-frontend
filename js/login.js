document.addEventListener("DOMContentLoaded", async () => {
    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("Please fill all fields!");
            return;
        }

        const users = await usersStore.getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            usersStore.setCurrentUser(user);
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert("Invalid email or password!");
        }

    });
});

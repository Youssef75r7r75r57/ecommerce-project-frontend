/* Global users store with optional remote sync.
   Configure remote endpoint by setting one of:
   - window.APP_USERS_API_URL before loading this file
   - localStorage.setItem("usersApiUrl", "https://your-api.example.com/users")
*/
(function () {
    const USERS_KEY = "users";
    const CURRENT_USER_KEY = "currentUser";
    const endpointFromWindow = typeof window !== "undefined" ? window.APP_USERS_API_URL : "";
    const endpointFromStorage = typeof localStorage !== "undefined" ? localStorage.getItem("usersApiUrl") : "";
    const USERS_API_URL = (endpointFromWindow || endpointFromStorage || "").trim();

    function normalizeUsers(list) {
        return Array.isArray(list) ? list : [];
    }

    function readLocalUsers() {
        try {
            return normalizeUsers(JSON.parse(localStorage.getItem(USERS_KEY)));
        } catch (error) {
            console.error("Failed to parse local users:", error);
            return [];
        }
    }

    function writeLocalUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(normalizeUsers(users)));
    }

    async function fetchRemoteUsers() {
        const response = await fetch(USERS_API_URL, {
            method: "GET",
            headers: { "Accept": "application/json" }
        });
        if (!response.ok) {
            throw new Error(`Users API GET failed: ${response.status}`);
        }
        const data = await response.json();
        return normalizeUsers(data);
    }

    async function saveRemoteUsers(users) {
        const response = await fetch(USERS_API_URL, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(normalizeUsers(users))
        });
        if (!response.ok) {
            throw new Error(`Users API PUT failed: ${response.status}`);
        }
    }

    async function getUsers() {
        if (!USERS_API_URL) return readLocalUsers();
        try {
            const users = await fetchRemoteUsers();
            writeLocalUsers(users);
            return users;
        } catch (error) {
            console.warn("Users API unavailable, using local users fallback.", error);
            return readLocalUsers();
        }
    }

    async function saveUsers(users) {
        const safeUsers = normalizeUsers(users);
        writeLocalUsers(safeUsers);
        if (!USERS_API_URL) return;
        try {
            await saveRemoteUsers(safeUsers);
        } catch (error) {
            console.warn("Users API save failed, changes kept locally.", error);
        }
    }

    function getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
        } catch (error) {
            console.error("Failed to parse currentUser:", error);
            return null;
        }
    }

    function setCurrentUser(user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user || null));
    }

    function clearCurrentUser() {
        localStorage.removeItem(CURRENT_USER_KEY);
    }

    async function syncCurrentUserFromStore() {
        const currentUser = getCurrentUser();
        if (!currentUser || !currentUser.email) return currentUser;
        const users = await getUsers();
        const latest = users.find((u) => u.email === currentUser.email);
        if (latest) {
            setCurrentUser(latest);
            return latest;
        }
        return currentUser;
    }

    async function upsertUser(user, oldEmail) {
        const users = await getUsers();
        let index = -1;
        if (oldEmail) {
            index = users.findIndex((u) => u.email === oldEmail);
        }
        if (index === -1) {
            index = users.findIndex((u) => u.email === user.email);
        }

        if (index === -1) {
            users.push(user);
        } else {
            users[index] = user;
        }

        await saveUsers(users);
        setCurrentUser(user);
        return user;
    }

    window.usersStore = {
        getUsers,
        saveUsers,
        getCurrentUser,
        setCurrentUser,
        clearCurrentUser,
        syncCurrentUserFromStore,
        upsertUser,
        hasRemoteSync: Boolean(USERS_API_URL),
        remoteUrl: USERS_API_URL
    };
})();

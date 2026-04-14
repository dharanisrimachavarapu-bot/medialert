// ==========================================
// LOCAL DATABASE (using localStorage)
// ==========================================
const db = {
    getUsers: () => JSON.parse(localStorage.getItem('medUsers')) || [],
    setUsers: (users) => localStorage.setItem('medUsers', JSON.stringify(users)),
};

// ==========================================
// AUTO REDIRECT IF ALREADY LOGGED IN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    if (sessionStorage.getItem('activeUser')) {
        window.location.href = "dashboard.html";
    }
});

// ==========================================
// TOGGLE LOGIN / REGISTER FORM
// ==========================================
function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const regForm = document.getElementById('register-form');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        regForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        regForm.style.display = 'block';
    }
}

// ==========================================
// REGISTER FUNCTION
// ==========================================
function register() {
    const name = document.getElementById('regFullName').value.trim();
    const user = document.getElementById('regUsername').value.trim();
    const pass = document.getElementById('regPassword').value.trim();

    if (!user || !pass || !name) {
        return showToast("Please fill all fields", "error");
    }

    const users = db.getUsers();

    if (users.find(u => u.user === user)) {
        return showToast("Username already registered", "error");
    }

    users.push({ name, user, pass });
    db.setUsers(users);

    showToast("Registration successful! Please login.", "success");
    toggleAuth();
}

// ==========================================
// LOGIN FUNCTION
// ==========================================
function login() {
    const user = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value.trim();

    if (!user || !pass) {
        return showToast("Please fill all fields", "error");
    }

    const users = db.getUsers();
    const validUser = users.find(u => u.user === user && u.pass === pass);

    if (validUser) {
        sessionStorage.setItem('activeUser', user);
        sessionStorage.setItem('activeName', validUser.name);

        showToast("Login successful!", "success");

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    } else {
        showToast("Invalid credentials", "error");
    }
}

// ==========================================
// GOOGLE LOGIN (FIXED VERSION)
// ==========================================
let googleLoading = false;

function googleLogin() {
    if (googleLoading) return; // prevent multiple clicks
    googleLoading = true;

    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;

            // Store user session
            sessionStorage.setItem('activeUser', user.email);
            sessionStorage.setItem('activeName', user.displayName);

            showToast("Google Login Successful", "success");

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        })
        .catch((error) => {
            console.error(error);
            showToast(error.message, "error");
        })
        .finally(() => {
            googleLoading = false;
        });
}

// ==========================================
// TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = "success") {
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success'
        ? 'fa-circle-check'
        : 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

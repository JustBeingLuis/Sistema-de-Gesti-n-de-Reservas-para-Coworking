const registroForm = document.getElementById("registro-form");
const loginForm = document.getElementById("login-form");
const registroButton = document.getElementById("submit-button");
const loginButton = document.getElementById("login-button");
const registroMessage = document.getElementById("registro-message");
const loginMessage = document.getElementById("login-message");

const TOKEN_KEY = "coworking_access_token";
const DASHBOARD_URL = "/dashboard.html";

const showLoginBtn = document.getElementById("show-login");
const showRegisterBtn = document.getElementById("show-register");

showLoginBtn?.addEventListener("click", () => {
    registroForm.hidden = true;
    loginForm.hidden = false;
});

showRegisterBtn?.addEventListener("click", () => {
    loginForm.hidden = true;
    registroForm.hidden = false;
});

if (localStorage.getItem(TOKEN_KEY)) {
    window.location.replace(DASHBOARD_URL);
}

registroForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correoRegistro").value.trim().toLowerCase();
    const password = document.getElementById("passwordRegistro").value;
    const confirmacionPassword = document.getElementById("confirmacionPassword").value;

    if (!nombre || !correo || !password || !confirmacionPassword) {
        showMessage(registroMessage, "Todos los campos del registro son obligatorios.", "error");
        return;
    }

    if (password.length < 8) {
        showMessage(registroMessage, "La contrasena debe tener minimo 8 caracteres.", "error");
        return;
    }

    if (password !== confirmacionPassword) {
        showMessage(registroMessage, "La confirmacion de la contrasena no coincide.", "error");
        return;
    }

    toggleLoading(registroButton, true, "Creando cuenta...");

    try {
        const response = await fetch("/api/usuarios/registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, correo, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            showMessage(registroMessage, data.message || "No fue posible crear la cuenta.", "error");
            return;
        }

        registroForm.reset();
        document.getElementById("correoLogin").value = data.correo;
        showMessage(registroMessage, `Cuenta creada para ${data.nombre}. Ya puedes iniciar sesion.`, "success");
    } catch (error) {
        showMessage(registroMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(registroButton, false);
    }
});

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const correo = document.getElementById("correoLogin").value.trim().toLowerCase();
    const password = document.getElementById("passwordLogin").value;

    if (!correo || !password) {
        showMessage(loginMessage, "Debes completar correo y contrasena.", "error");
        return;
    }

    toggleLoading(loginButton, true, "Ingresando...");

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ correo, password })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            showMessage(loginMessage, data.message || "No fue posible iniciar sesion.", "error");
            return;
        }

        localStorage.setItem(TOKEN_KEY, data.accessToken);
        window.location.assign(DASHBOARD_URL);
    } catch (error) {
        showMessage(loginMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(loginButton, false);
    }
});

function showMessage(target, message, type) {
    target.textContent = message;
    target.className = type ? `form-message ${type}` : "form-message";
}

function toggleLoading(button, isLoading, loadingText) {
    if (!button.dataset.defaultText) {
        button.dataset.defaultText = button.textContent;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}

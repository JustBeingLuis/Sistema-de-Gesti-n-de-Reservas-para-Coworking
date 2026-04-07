const registroForm = document.getElementById("registro-form");
const loginForm = document.getElementById("login-form");
const registroButton = document.getElementById("submit-button");
const loginButton = document.getElementById("login-button");
const perfilButton = document.getElementById("perfil-button");
const registroMessage = document.getElementById("registro-message");
const loginMessage = document.getElementById("login-message");
const perfilMessage = document.getElementById("perfil-message");
const tokenPreview = document.getElementById("token-preview");

const TOKEN_KEY = "coworking_access_token";

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

    toggleLoading(registroButton, true, "Registrando...");

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
            showMessage(registroMessage, data.message || "No fue posible registrar el usuario.", "error");
            return;
        }

        registroForm.reset();
        document.getElementById("correoLogin").value = data.correo;
        showMessage(registroMessage, `Usuario ${data.nombre} registrado correctamente con rol ${data.rol}.`, "success");
    } catch (error) {
        showMessage(registroMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(registroButton, false, "Registrar usuario");
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

    toggleLoading(loginButton, true, "Autenticando...");

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
            showMessage(loginMessage, data.message || "No fue posible autenticar el usuario.", "error");
            return;
        }

        localStorage.setItem(TOKEN_KEY, data.accessToken);
        renderTokenPreview(data.accessToken, data.usuario);
        loginForm.reset();
        showMessage(loginMessage, `Sesion iniciada correctamente como ${data.usuario.rol}.`, "success");
        showMessage(perfilMessage, "", "");
    } catch (error) {
        showMessage(loginMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(loginButton, false, "Iniciar sesion");
    }
});

perfilButton.addEventListener("click", async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        showMessage(perfilMessage, "No hay token almacenado. Inicia sesion primero.", "error");
        return;
    }

    toggleLoading(perfilButton, true, "Consultando...");

    try {
        const response = await fetch("/api/auth/perfil", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            showMessage(perfilMessage, data.message || "No fue posible consultar el perfil.", "error");
            return;
        }

        showMessage(
            perfilMessage,
            `Perfil autenticado: ${data.nombre} (${data.correo}) con rol ${data.rol}.`,
            "success"
        );
    } catch (error) {
        showMessage(perfilMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(perfilButton, false, "Consultar perfil protegido");
    }
});

hydrateTokenPreview();

function hydrateTokenPreview() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        tokenPreview.textContent = "Aun no hay token almacenado.";
        return;
    }

    renderTokenPreview(token);
}

function renderTokenPreview(token, usuario) {
    const preview = [
        usuario ? `Usuario: ${usuario.nombre}` : null,
        usuario ? `Rol: ${usuario.rol}` : null,
        `Token: ${token}`
    ].filter(Boolean).join("\n");

    tokenPreview.textContent = preview;
}

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

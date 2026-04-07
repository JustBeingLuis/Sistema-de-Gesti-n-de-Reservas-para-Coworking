const form = document.getElementById("registro-form");
const submitButton = document.getElementById("submit-button");
const formMessage = document.getElementById("form-message");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const correo = document.getElementById("correo").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const confirmacionPassword = document.getElementById("confirmacionPassword").value;

    if (!nombre || !correo || !password || !confirmacionPassword) {
        showMessage("Todos los campos son obligatorios.", "error");
        return;
    }

    if (password.length < 8) {
        showMessage("La contrasena debe tener minimo 8 caracteres.", "error");
        return;
    }

    if (password !== confirmacionPassword) {
        showMessage("La confirmacion de la contrasena no coincide.", "error");
        return;
    }

    toggleLoading(true);

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
            showMessage(data.message || "No fue posible registrar el usuario.", "error");
            return;
        }

        form.reset();
        showMessage(`Usuario ${data.nombre} registrado correctamente con rol ${data.rol}.`, "success");
    } catch (error) {
        showMessage("No fue posible conectar con el backend. Verifica que la API este en ejecucion.", "error");
    } finally {
        toggleLoading(false);
    }
});

function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.className = `form-message ${type}`;
}

function toggleLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.textContent = isLoading ? "Registrando..." : "Registrar usuario";
}

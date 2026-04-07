const logoutButton = document.getElementById("logout-button");
const spacesMessage = document.getElementById("spaces-message");
const sessionSummary = document.getElementById("session-summary");
const spacesSummary = document.getElementById("spaces-summary");
const spacesGrid = document.getElementById("spaces-grid");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";

logoutButton.addEventListener("click", () => {
    clearSession();
    window.location.assign(LOGIN_URL);
});

hydrateSessionState();

async function hydrateSessionState() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    await refreshWorkspace();
}

async function refreshWorkspace() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    try {
        const response = await fetch("/api/auth/perfil", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(LOGIN_URL);
                return;
            }

            return;
        }

        renderSessionSummary(data);

        await loadSpaces(false);
    } catch (error) {
        sessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
    }
}

async function loadSpaces(showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    try {
        const response = await fetch("/api/espacios/disponibles", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ([]));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(LOGIN_URL);
                return;
            }

            if (showFeedback) {
                showMessage(spacesMessage, data.message || "No fue posible consultar los espacios.", "error");
            }
            return;
        }

        renderSpacesSummary(data);
        renderSpacesGrid(data);

        if (showFeedback) {
            const message = data.length > 0
                ? `Se cargaron ${data.length} espacios activos del coworking.`
                : "No hay espacios activos registrados en este momento.";
            showMessage(spacesMessage, message, data.length > 0 ? "success" : "error");
        } else {
            showMessage(spacesMessage, "", "");
        }
    } catch (error) {
        if (showFeedback) {
            showMessage(spacesMessage, "No fue posible conectar con el backend.", "error");
        }
    }
}

function renderSessionSummary(usuario) {
    sessionSummary.innerHTML = `
        <strong>${usuario.nombre}</strong>
        <span>Correo: ${usuario.correo}</span>
        <span>Rol: ${usuario.rol}</span>
    `;
}

function renderSpacesSummary(espacios) {
    const totalEspacios = espacios.length;
    const capacidadAcumulada = espacios.reduce((total, espacio) => total + espacio.capacidad, 0);
    const tipos = new Set(espacios.map((espacio) => espacio.tipo)).size;

    spacesSummary.innerHTML = `
        <article class="summary-card">
            <span>Total de espacios</span>
            <strong>${totalEspacios}</strong>
        </article>
        <article class="summary-card">
            <span>Capacidad acumulada</span>
            <strong>${capacidadAcumulada}</strong>
        </article>
        <article class="summary-card">
            <span>Tipos disponibles</span>
            <strong>${tipos}</strong>
        </article>
    `;
}

function renderSpacesGrid(espacios) {
    if (!espacios || espacios.length === 0) {
        spacesGrid.innerHTML = `
            <article class="empty-state">
                <h3>Todavia no hay espacios activos</h3>
                <p>Cuando el catalogo tenga espacios habilitados para reserva, apareceran aqui.</p>
            </article>
        `;
        return;
    }

    spacesGrid.innerHTML = espacios.map((espacio) => `
        <article class="space-card">
            <div class="space-card-header">
                <div>
                    <h3>${espacio.nombre}</h3>
                </div>
                <span class="space-badge">${espacio.tipo}</span>
            </div>
            <p class="space-description">${espacio.descripcionTipo || "Espacio habilitado para reserva dentro del coworking."}</p>
            <div class="space-meta">
                <div class="space-meta-item">
                    <span>Capacidad</span>
                    <strong>${espacio.capacidad} persona${espacio.capacidad === 1 ? "" : "s"}</strong>
                </div>
                <div class="space-meta-item">
                    <span>Precio por hora</span>
                    <strong>${formatPrice(espacio.precioPorHora)}</strong>
                </div>
            </div>
        </article>
    `).join("");
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
}

function formatPrice(value) {
    const number = Number(value || 0);
    return `$ ${new Intl.NumberFormat("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number)}`;
}

function showMessage(target, message, type) {
    target.textContent = message;
    target.className = type ? `form-message ${type}` : "form-message";
}

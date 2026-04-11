const adminLogoutButton = document.getElementById("admin-logout-button");
const adminSessionSummary = document.getElementById("admin-session-summary");
const adminSpacesMessage = document.getElementById("admin-spaces-message");
const adminSpacesGrid = document.getElementById("admin-spaces-grid");
const adminSpacesPagination = document.getElementById("admin-spaces-pagination");
const adminSpaceForm = document.getElementById("admin-space-form");
const adminSpaceName = document.getElementById("admin-space-name");
const adminSpaceType = document.getElementById("admin-space-type");
const adminSpaceCapacity = document.getElementById("admin-space-capacity");
const adminSpacePrice = document.getElementById("admin-space-price");
const adminSpaceActive = document.getElementById("admin-space-active");
const adminSpaceSubmit = document.getElementById("admin-space-submit");
const adminSpaceReset = document.getElementById("admin-space-reset");
const adminSpaceFormMessage = document.getElementById("admin-space-form-message");
const adminFormTitle = document.getElementById("admin-form-title");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";
const DASHBOARD_URL = "/dashboard.html";
const ADMIN_SPACES_PAGE_SIZE = 6;

let currentAdminSpacesPage = 0;
let currentEditingSpaceId = null;

adminLogoutButton.addEventListener("click", () => {
    clearSession();
    window.location.assign(LOGIN_URL);
});

adminSpaceForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveSpace();
});

adminSpaceReset.addEventListener("click", () => {
    resetAdminForm();
});

adminSpacesGrid.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-space-id]");
    const deleteButton = event.target.closest("[data-delete-space-id]");

    if (editButton) {
        const spaceId = Number(editButton.dataset.editSpaceId);

        if (Number.isInteger(spaceId)) {
            await loadSpaceIntoForm(spaceId);
        }
        return;
    }

    if (deleteButton && !deleteButton.disabled) {
        const spaceId = Number(deleteButton.dataset.deleteSpaceId);

        if (Number.isInteger(spaceId)) {
            await deleteSpace(spaceId, deleteButton);
        }
    }
});

adminSpacesPagination.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-page-target]");

    if (!button || button.disabled) {
        return;
    }

    const targetPage = Number(button.dataset.pageTarget);

    if (!Number.isInteger(targetPage) || targetPage < 0 || targetPage === currentAdminSpacesPage) {
        return;
    }

    await loadAdminSpaces(targetPage, false);
});

hydrateAdminSpacesView();

async function hydrateAdminSpacesView() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    const perfilValido = await loadSessionAndAuthorize();

    if (!perfilValido) {
        return;
    }

    await loadSpaceTypes();
    await loadAdminSpaces(currentAdminSpacesPage, false);
}

async function loadSessionAndAuthorize() {
    const token = localStorage.getItem(TOKEN_KEY);

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
            }
            return false;
        }

        if (String(data.rol || "").toUpperCase() !== "ADMIN") {
            window.location.replace(DASHBOARD_URL);
            return false;
        }

        adminSessionSummary.innerHTML = `
            <strong>${escapeHtml(data.nombre || "")}</strong>
            <span>Correo: ${escapeHtml(data.correo || "")}</span>
            <span>Rol: ${escapeHtml(data.rol || "")}</span>
        `;
        return true;
    } catch (error) {
        adminSessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
        return false;
    }
}

async function loadSpaceTypes() {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const response = await fetch("/api/admin/espacios/tipos-espacio", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ([]));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminSpacesMessage, data.message || "No fue posible cargar los tipos de espacio.", "error");
            return;
        }

        adminSpaceType.innerHTML = `
            <option value="">Selecciona un tipo</option>
            ${data.map((tipo) => `
                <option value="${tipo.id}">${escapeHtml(tipo.nombre || "")}</option>
            `).join("")}
        `;
    } catch (error) {
        showMessage(adminSpacesMessage, "No fue posible conectar con el backend.", "error");
    }
}

async function loadAdminSpaces(page = currentAdminSpacesPage, showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const params = new URLSearchParams({
            page: String(page),
            size: String(ADMIN_SPACES_PAGE_SIZE)
        });

        const response = await fetch(`/api/admin/espacios?${params.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminSpacesMessage, data.message || "No fue posible consultar los espacios.", "error");
            return;
        }

        if (page > 0 && (!data.content || data.content.length === 0) && Number(data.totalElements || 0) > 0) {
            await loadAdminSpaces(page - 1, false);
            return;
        }

        currentAdminSpacesPage = data.pageNumber ?? page;
        renderAdminSpacesGrid(Array.isArray(data.content) ? data.content : []);
        renderPagination(adminSpacesPagination, data, "espacios");

        if (showFeedback) {
            const message = Number(data.totalElements || 0) > 0
                ? `Mostrando ${data.numberOfElements} espacio(s) de ${data.totalElements}.`
                : "Todavia no hay espacios registrados para administracion.";
            showMessage(adminSpacesMessage, message, Number(data.totalElements || 0) > 0 ? "success" : "");
        } else {
            showMessage(adminSpacesMessage, "", "");
        }
    } catch (error) {
        showMessage(adminSpacesMessage, "No fue posible conectar con el backend.", "error");
    }
}

async function loadSpaceIntoForm(spaceId) {
    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(adminSpaceSubmit, true, "Cargando...");

    try {
        const response = await fetch(`/api/admin/espacios/${spaceId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminSpaceFormMessage, data.message || "No fue posible cargar el espacio.", "error");
            return;
        }

        currentEditingSpaceId = data.id;
        adminFormTitle.textContent = `Editar espacio #${data.id}`;
        adminSpaceName.value = data.nombre || "";
        adminSpaceType.value = data.tipoId || "";
        adminSpaceCapacity.value = data.capacidad || "";
        adminSpacePrice.value = data.precioPorHora || "";
        adminSpaceActive.checked = Boolean(data.activo);

        showMessage(adminSpaceFormMessage, `Editando el espacio ${data.nombre}.`, "success");
        adminSpaceName.focus();
    } catch (error) {
        showMessage(adminSpaceFormMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(adminSpaceSubmit, false);
    }
}

async function saveSpace() {
    const token = localStorage.getItem(TOKEN_KEY);
    const payload = buildSpacePayload();

    if (!payload) {
        return;
    }

    const isEditing = Number.isInteger(currentEditingSpaceId);
    const url = isEditing ? `/api/admin/espacios/${currentEditingSpaceId}` : "/api/admin/espacios";
    const method = isEditing ? "PUT" : "POST";

    toggleLoading(adminSpaceSubmit, true, isEditing ? "Guardando cambios..." : "Creando espacio...");

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminSpaceFormMessage, data.message || "No fue posible guardar el espacio.", "error");
            return;
        }

        resetAdminForm(false);
        await loadAdminSpaces(currentAdminSpacesPage, false);
        showMessage(
            adminSpacesMessage,
            isEditing
                ? `El espacio ${data.nombre || ""} fue actualizado correctamente.`
                : `El espacio ${data.nombre || ""} fue creado correctamente.`,
            "success"
        );
    } catch (error) {
        showMessage(adminSpaceFormMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(adminSpaceSubmit, false);
    }
}

async function deleteSpace(spaceId, button) {
    if (!window.confirm("Se desactivara este espacio y dejara de aparecer en el catalogo disponible. Deseas continuar?")) {
        return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(button, true, "Desactivando...");

    try {
        const response = await fetch(`/api/admin/espacios/${spaceId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(response.status === 403 ? DASHBOARD_URL : LOGIN_URL);
                return;
            }

            showMessage(adminSpacesMessage, data.message || "No fue posible desactivar el espacio.", "error");
            return;
        }

        if (currentEditingSpaceId === data.id) {
            resetAdminForm(false);
        }

        await loadAdminSpaces(currentAdminSpacesPage, false);
        showMessage(adminSpacesMessage, `El espacio ${data.nombre || ""} fue desactivado correctamente.`, "success");
    } catch (error) {
        showMessage(adminSpacesMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(button, false);
    }
}

function buildSpacePayload() {
    const nombre = adminSpaceName.value.trim();
    const tipoId = Number(adminSpaceType.value);
    const capacidad = Number(adminSpaceCapacity.value);
    const precioPorHora = Number(adminSpacePrice.value);
    const activo = adminSpaceActive.checked;

    if (!nombre) {
        showMessage(adminSpaceFormMessage, "El nombre del espacio es obligatorio.", "error");
        return null;
    }

    if (!Number.isInteger(tipoId) || tipoId < 1) {
        showMessage(adminSpaceFormMessage, "Debes seleccionar un tipo de espacio valido.", "error");
        return null;
    }

    if (!Number.isInteger(capacidad) || capacidad < 1) {
        showMessage(adminSpaceFormMessage, "La capacidad debe ser mayor o igual a 1.", "error");
        return null;
    }

    if (!Number.isFinite(precioPorHora) || precioPorHora <= 0) {
        showMessage(adminSpaceFormMessage, "El precio por hora debe ser mayor que cero.", "error");
        return null;
    }

    return {
        nombre,
        tipoId,
        capacidad,
        precioPorHora,
        activo
    };
}

function renderAdminSpacesGrid(espacios) {
    if (!espacios || espacios.length === 0) {
        adminSpacesGrid.innerHTML = `
            <article class="empty-state">
                <h3>No hay espacios registrados</h3>
                <p>Cuando crees el primer espacio del coworking, aparecera aqui para edicion o desactivacion.</p>
            </article>
        `;
        return;
    }

    adminSpacesGrid.innerHTML = espacios.map((espacio) => `
        <article class="space-card admin-space-card">
            <div class="space-card-header">
                <div>
                    <h3>${escapeHtml(espacio.nombre || "")}</h3>
                </div>
                <div class="admin-space-badges">
                    <span class="space-badge">${escapeHtml(espacio.tipoNombre || "Tipo")}</span>
                    <span class="space-badge ${espacio.activo ? "status-badge--active" : "status-badge--inactive"}">
                        ${espacio.activo ? "Activa" : "Inactiva"}
                    </span>
                </div>
            </div>
            <p class="space-description">${escapeHtml(
                espacio.tipoDescripcion || "Espacio administrable dentro del coworking."
            )}</p>
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
            <div class="admin-space-actions">
                <button type="button" class="secondary-button admin-card-button" data-edit-space-id="${espacio.id}">
                    Editar
                </button>
                <button
                    type="button"
                    class="secondary-button admin-card-button"
                    data-delete-space-id="${espacio.id}"
                    ${espacio.activo ? "" : "disabled"}
                >
                    ${espacio.activo ? "Desactivar" : "Ya inactivo"}
                </button>
            </div>
        </article>
    `).join("");
}

function renderPagination(target, pageData, itemLabel) {
    const totalPages = Math.max(Number(pageData.totalPages || 0), 1);
    const currentPage = Number(pageData.pageNumber || 0) + 1;
    const hasItems = Number(pageData.totalElements || 0) > 0;

    if (!hasItems) {
        target.innerHTML = "";
        return;
    }

    target.innerHTML = `
        <div class="pagination-info">
            <strong>Pagina ${currentPage} de ${totalPages}</strong>
            <span>${pageData.totalElements} ${itemLabel} en total</span>
        </div>
        <div class="pagination-actions">
            <button
                type="button"
                class="secondary-button pagination-button"
                data-page-target="${Math.max(currentPage - 2, 0)}"
                ${pageData.first ? "disabled" : ""}
            >
                Anterior
            </button>
            <button
                type="button"
                class="secondary-button pagination-button"
                data-page-target="${currentPage}"
                ${pageData.last ? "disabled" : ""}
            >
                Siguiente
            </button>
        </div>
    `;
}

function resetAdminForm(clearMessage = true) {
    currentEditingSpaceId = null;
    adminFormTitle.textContent = "Nuevo espacio";
    adminSpaceForm.reset();
    adminSpaceActive.checked = true;

    if (clearMessage) {
        showMessage(adminSpaceFormMessage, "", "");
    }
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

function toggleLoading(button, isLoading, loadingText) {
    if (!button.dataset.defaultText) {
        button.dataset.defaultText = button.textContent.trim();
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll("\"", "&quot;")
        .replaceAll("'", "&#39;");
}

const adminUsersLogoutButton = document.getElementById("admin-users-logout-button");
const adminUsersSessionSummary = document.getElementById("admin-users-session-summary");
const adminUsersMessage = document.getElementById("admin-users-message");
const adminUsersSummary = document.getElementById("admin-users-summary");
const adminUsersGrid = document.getElementById("admin-users-grid");
const adminUsersPagination = document.getElementById("admin-users-pagination");
const adminUserForm = document.getElementById("admin-user-form");
const adminUserFormTitle = document.getElementById("admin-user-form-title");
const adminUserName = document.getElementById("admin-user-name");
const adminUserEmail = document.getElementById("admin-user-email");
const adminUserRole = document.getElementById("admin-user-role");
const adminUserActive = document.getElementById("admin-user-active");
const adminUserSubmit = document.getElementById("admin-user-submit");
const adminUserReset = document.getElementById("admin-user-reset");
const adminUserFormMessage = document.getElementById("admin-user-form-message");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";
const DASHBOARD_URL = "/dashboard.html";
const ADMIN_USERS_PAGE_SIZE = 6;

let currentAdminUsersPage = 0;
let currentEditingUserId = null;

adminUsersLogoutButton.addEventListener("click", () => {
    clearSession();
    window.location.assign(LOGIN_URL);
});

adminUserForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await saveUser();
});

adminUserReset.addEventListener("click", () => {
    resetAdminUserForm();
});

adminUsersGrid.addEventListener("click", async (event) => {
    const editButton = event.target.closest("[data-edit-user-id]");
    const toggleButton = event.target.closest("[data-toggle-user-id]");

    if (editButton) {
        const userId = Number(editButton.dataset.editUserId);

        if (Number.isInteger(userId)) {
            await loadUserIntoForm(userId);
        }
        return;
    }

    if (toggleButton && !toggleButton.disabled) {
        const userId = Number(toggleButton.dataset.toggleUserId);
        const active = String(toggleButton.dataset.toggleActive || "").toLowerCase() === "true";

        if (Number.isInteger(userId)) {
            await toggleUserStatus(userId, active, toggleButton);
        }
    }
});

adminUsersPagination.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-page-target]");

    if (!button || button.disabled) {
        return;
    }

    const targetPage = Number(button.dataset.pageTarget);

    if (!Number.isInteger(targetPage) || targetPage < 0 || targetPage === currentAdminUsersPage) {
        return;
    }

    await loadAdminUsers(targetPage, false);
});

hydrateAdminUsersView();

async function hydrateAdminUsersView() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    const perfilValido = await loadSessionAndAuthorize();

    if (!perfilValido) {
        return;
    }

    await loadRoles();
    await loadAdminUsers(currentAdminUsersPage, false);
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

        adminUsersSessionSummary.innerHTML = `
            <strong>${escapeHtml(data.nombre || "")}</strong>
            <span>Correo: ${escapeHtml(data.correo || "")}</span>
            <span>Rol: ${escapeHtml(data.rol || "")}</span>
        `;
        return true;
    } catch (error) {
        adminUsersSessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
        return false;
    }
}

async function loadRoles() {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const response = await fetch("/api/admin/usuarios/roles", {
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

            showMessage(adminUsersMessage, data.message || "No fue posible cargar los roles.", "error");
            return;
        }

        adminUserRole.innerHTML = `
            <option value="">Selecciona un rol</option>
            ${data.map((rol) => `
                <option value="${rol.id}">${escapeHtml(rol.nombre || "")}</option>
            `).join("")}
        `;
    } catch (error) {
        showMessage(adminUsersMessage, "No fue posible conectar con el backend.", "error");
    }
}

async function loadAdminUsers(page = currentAdminUsersPage, showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const params = new URLSearchParams({
            page: String(page),
            size: String(ADMIN_USERS_PAGE_SIZE)
        });

        const response = await fetch(`/api/admin/usuarios?${params.toString()}`, {
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

            showMessage(adminUsersMessage, data.message || "No fue posible consultar los usuarios.", "error");
            return;
        }

        if (page > 0 && (!data.pagina?.content || data.pagina.content.length === 0) && Number(data.pagina?.totalElements || 0) > 0) {
            await loadAdminUsers(page - 1, false);
            return;
        }

        currentAdminUsersPage = data.pagina?.pageNumber ?? page;
        renderUsersSummary(data.resumen || {});
        renderUsersGrid(Array.isArray(data.pagina?.content) ? data.pagina.content : []);
        renderPagination(adminUsersPagination, data.pagina || buildEmptyPageData(page, ADMIN_USERS_PAGE_SIZE), "usuarios");

        if (showFeedback) {
            const total = Number(data.resumen?.totalUsuarios || data.pagina?.totalElements || 0);
            const current = Number(data.pagina?.numberOfElements || 0);
            const message = total > 0
                ? `Mostrando ${current} usuario(s) de ${total}.`
                : "Todavia no hay usuarios registrados en el sistema.";
            showMessage(adminUsersMessage, message, total > 0 ? "success" : "");
        } else {
            showMessage(adminUsersMessage, "", "");
        }
    } catch (error) {
        showMessage(adminUsersMessage, "No fue posible conectar con el backend.", "error");
    }
}

async function loadUserIntoForm(userId) {
    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(adminUserSubmit, true, "Cargando...");

    try {
        const response = await fetch(`/api/admin/usuarios/${userId}`, {
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

            showMessage(adminUserFormMessage, data.message || "No fue posible cargar el usuario.", "error");
            return;
        }

        currentEditingUserId = data.id;
        adminUserFormTitle.textContent = `Editar usuario #${data.id}`;
        adminUserName.value = data.nombre || "";
        adminUserEmail.value = data.correo || "";
        adminUserRole.value = data.rolId || "";
        adminUserActive.checked = Boolean(data.activo);

        showMessage(adminUserFormMessage, `Editando el usuario ${data.nombre}.`, "success");
        adminUserName.focus();
    } catch (error) {
        showMessage(adminUserFormMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(adminUserSubmit, false);
    }
}

async function saveUser() {
    if (!Number.isInteger(currentEditingUserId)) {
        showMessage(adminUserFormMessage, "Selecciona un usuario del listado antes de guardar cambios.", "error");
        return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    const payload = buildUserPayload();

    if (!payload) {
        return;
    }

    toggleLoading(adminUserSubmit, true, "Guardando...");

    try {
        const response = await fetch(`/api/admin/usuarios/${currentEditingUserId}`, {
            method: "PUT",
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

            showMessage(adminUserFormMessage, data.message || "No fue posible guardar el usuario.", "error");
            return;
        }

        await loadAdminUsers(currentAdminUsersPage, false);
        await loadUserIntoForm(data.id);
        showMessage(adminUsersMessage, `El usuario ${data.nombre || ""} fue actualizado correctamente.`, "success");
    } catch (error) {
        showMessage(adminUserFormMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(adminUserSubmit, false);
    }
}

async function toggleUserStatus(userId, active, button) {
    const actionLabel = active ? "activar" : "desactivar";

    if (!window.confirm(`Se va a ${actionLabel} esta cuenta. Deseas continuar?`)) {
        return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(button, true, active ? "Activando..." : "Desactivando...");

    try {
        const response = await fetch(`/api/admin/usuarios/${userId}/estado?activo=${active}`, {
            method: "PATCH",
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

            showMessage(adminUsersMessage, data.message || "No fue posible actualizar el estado del usuario.", "error");
            return;
        }

        if (currentEditingUserId === data.id) {
            adminUserActive.checked = Boolean(data.activo);
            adminUserRole.value = data.rolId || "";
        }

        await loadAdminUsers(currentAdminUsersPage, false);
        showMessage(
            adminUsersMessage,
            `El usuario ${data.nombre || ""} ahora esta ${data.activo ? "activo" : "inactivo"}.`,
            "success"
        );
    } catch (error) {
        showMessage(adminUsersMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(button, false);
    }
}

function buildUserPayload() {
    const nombre = adminUserName.value.trim();
    const correo = adminUserEmail.value.trim();
    const rolId = Number(adminUserRole.value);
    const activo = adminUserActive.checked;

    if (!nombre) {
        showMessage(adminUserFormMessage, "El nombre del usuario es obligatorio.", "error");
        return null;
    }

    if (!correo) {
        showMessage(adminUserFormMessage, "El correo del usuario es obligatorio.", "error");
        return null;
    }

    if (!Number.isInteger(rolId) || rolId < 1) {
        showMessage(adminUserFormMessage, "Debes seleccionar un rol valido.", "error");
        return null;
    }

    return {
        nombre,
        correo,
        rolId,
        activo
    };
}

function renderUsersSummary(resumen) {
    adminUsersSummary.innerHTML = `
        <article class="summary-card">
            <span>Total de usuarios</span>
            <strong>${Number(resumen.totalUsuarios || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>Usuarios activos</span>
            <strong>${Number(resumen.usuariosActivos || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>Administradores</span>
            <strong>${Number(resumen.administradores || 0)}</strong>
        </article>
    `;
}

function renderUsersGrid(users) {
    if (!users || users.length === 0) {
        adminUsersGrid.innerHTML = `
            <article class="empty-state">
                <h3>No hay usuarios registrados</h3>
                <p>Cuando existan cuentas en la plataforma, apareceran aqui para administracion.</p>
            </article>
        `;
        return;
    }

    adminUsersGrid.innerHTML = users.map((user) => `
        <article class="space-card admin-user-card">
            <div class="space-card-header">
                <div>
                    <h3>${escapeHtml(user.nombre || "")}</h3>
                    <p class="reservation-subtitle">${escapeHtml(user.correo || "")}</p>
                </div>
                <div class="admin-space-badges">
                    <span class="space-badge">${escapeHtml(user.rolNombre || "ROL")}</span>
                    <span class="space-badge ${user.activo ? "status-badge--active" : "status-badge--inactive"}">
                        ${user.activo ? "Activo" : "Inactivo"}
                    </span>
                </div>
            </div>
            <p class="space-description">Cuenta registrada el ${formatDateTime(user.fechaRegistro)}.</p>
            <div class="space-meta">
                <div class="space-meta-item">
                    <span>Usuario</span>
                    <strong>#${user.id}</strong>
                </div>
                <div class="space-meta-item">
                    <span>Estado</span>
                    <strong>${user.activo ? "Habilitado" : "Sin acceso"}</strong>
                </div>
            </div>
            <div class="admin-space-actions">
                <button type="button" class="secondary-button admin-card-button" data-edit-user-id="${user.id}">
                    Editar
                </button>
                <button
                    type="button"
                    class="secondary-button admin-card-button"
                    data-toggle-user-id="${user.id}"
                    data-toggle-active="${!user.activo}"
                >
                    ${user.activo ? "Desactivar" : "Activar"}
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

function resetAdminUserForm() {
    currentEditingUserId = null;
    adminUserFormTitle.textContent = "Editar usuario";
    adminUserForm.reset();
    adminUserActive.checked = true;
    showMessage(adminUserFormMessage, "", "");
}

function buildEmptyPageData(pageNumber, pageSize) {
    return {
        content: [],
        pageNumber,
        pageSize,
        totalElements: 0,
        totalPages: 0,
        numberOfElements: 0,
        first: true,
        last: true
    };
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
}

function formatDateTime(value) {
    if (!value) {
        return "Sin fecha";
    }

    const date = new Date(value);

    return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
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

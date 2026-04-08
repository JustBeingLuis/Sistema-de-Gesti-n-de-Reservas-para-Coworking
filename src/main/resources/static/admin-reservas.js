const adminReservasLogoutButton = document.getElementById("admin-reservas-logout-button");
const adminReservasSessionSummary = document.getElementById("admin-reservas-session-summary");
const adminReservasMessage = document.getElementById("admin-reservas-message");
const adminReservasSummary = document.getElementById("admin-reservas-summary");
const adminReservasGrid = document.getElementById("admin-reservas-grid");
const adminReservasPagination = document.getElementById("admin-reservas-pagination");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";
const DASHBOARD_URL = "/dashboard.html";
const ADMIN_RESERVAS_PAGE_SIZE = 6;

let currentAdminReservasPage = 0;

adminReservasLogoutButton.addEventListener("click", () => {
    clearSession();
    window.location.assign(LOGIN_URL);
});

adminReservasGrid.addEventListener("click", async (event) => {
    const cancelButton = event.target.closest("[data-cancel-reservation-id]");

    if (!cancelButton || cancelButton.disabled) {
        return;
    }

    const reservationId = Number(cancelButton.dataset.cancelReservationId);

    if (Number.isInteger(reservationId)) {
        await cancelReservationAsAdmin(reservationId, cancelButton);
    }
});

adminReservasPagination.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-page-target]");

    if (!button || button.disabled) {
        return;
    }

    const targetPage = Number(button.dataset.pageTarget);

    if (!Number.isInteger(targetPage) || targetPage < 0 || targetPage === currentAdminReservasPage) {
        return;
    }

    await loadAdminReservas(targetPage, false);
});

hydrateAdminReservasView();

async function hydrateAdminReservasView() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    const perfilValido = await loadSessionAndAuthorize();

    if (!perfilValido) {
        return;
    }

    await loadAdminReservas(currentAdminReservasPage, false);
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

        adminReservasSessionSummary.innerHTML = `
            <strong>${escapeHtml(data.nombre || "")}</strong>
            <span>Correo: ${escapeHtml(data.correo || "")}</span>
            <span>Rol: ${escapeHtml(data.rol || "")}</span>
        `;
        return true;
    } catch (error) {
        adminReservasSessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
        return false;
    }
}

async function loadAdminReservas(page = currentAdminReservasPage, showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const params = new URLSearchParams({
            page: String(page),
            size: String(ADMIN_RESERVAS_PAGE_SIZE)
        });

        const response = await fetch(`/api/admin/reservas?${params.toString()}`, {
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

            showMessage(adminReservasMessage, data.message || "No fue posible consultar las reservas.", "error");
            return;
        }

        currentAdminReservasPage = data.pagina?.pageNumber ?? page;
        renderReservasSummary(data.resumen || {});
        renderReservasGrid(Array.isArray(data.pagina?.content) ? data.pagina.content : []);
        renderPagination(adminReservasPagination, data.pagina || buildEmptyPageData(page, ADMIN_RESERVAS_PAGE_SIZE), "reservas");

        if (showFeedback) {
            const total = Number(data.resumen?.totalReservas || data.pagina?.totalElements || 0);
            const current = Number(data.pagina?.numberOfElements || 0);
            const message = total > 0
                ? `Mostrando ${current} reserva(s) de ${total}.`
                : "Todavia no hay reservas registradas en el sistema.";
            showMessage(adminReservasMessage, message, total > 0 ? "success" : "");
        } else {
            showMessage(adminReservasMessage, "", "");
        }
    } catch (error) {
        showMessage(adminReservasMessage, "No fue posible conectar con el backend.", "error");
    }
}

function renderReservasSummary(resumen) {
    adminReservasSummary.innerHTML = `
        <article class="summary-card">
            <span>Total de reservas</span>
            <strong>${Number(resumen.totalReservas || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>Reservas activas</span>
            <strong>${Number(resumen.reservasActivas || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>Reservas canceladas</span>
            <strong>${Number(resumen.reservasCanceladas || 0)}</strong>
        </article>
    `;
}

function renderReservasGrid(reservas) {
    if (!reservas || reservas.length === 0) {
        adminReservasGrid.innerHTML = `
            <article class="empty-state">
                <h3>No hay reservas registradas</h3>
                <p>Cuando los usuarios creen reservas, apareceran aqui para administracion.</p>
            </article>
        `;
        return;
    }

    adminReservasGrid.innerHTML = reservas.map((reserva) => {
        const estado = (reserva.estado || "").toUpperCase();
        const badgeClass = getReservationBadgeClass(estado);

        return `
            <article class="reservation-card">
                <div class="reservation-card-header">
                    <div>
                        <h3>${escapeHtml(reserva.nombreEspacio || "")}</h3>
                        <p class="reservation-subtitle">${escapeHtml(reserva.tipoEspacio || "Espacio")}</p>
                    </div>
                    <span class="space-badge ${badgeClass}">${escapeHtml(estado || "RESERVA")}</span>
                </div>

                <p class="reservation-note">
                    <strong>${escapeHtml(reserva.usuarioNombre || "")}</strong>
                    <span class="reservation-note-inline">${escapeHtml(reserva.usuarioCorreo || "")}</span>
                </p>

                <div class="reservation-meta reservation-meta--admin">
                    <div class="space-meta-item">
                        <span>Fecha</span>
                        <strong>${formatDate(reserva.fecha)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Horario</span>
                        <strong>${formatTime(reserva.horaInicio)} - ${formatTime(reserva.horaFin)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Creada</span>
                        <strong>${formatDateTime(reserva.fechaCreacion)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Reserva</span>
                        <strong>#${reserva.id}</strong>
                    </div>
                </div>

                ${estado === "CONFIRMADA" ? `
                    <div class="reservation-actions">
                        <button
                            type="button"
                            class="secondary-button reservation-cancel-button"
                            data-cancel-reservation-id="${reserva.id}"
                        >
                            Cancelar
                        </button>
                    </div>
                ` : ""}
            </article>
        `;
    }).join("");
}

async function cancelReservationAsAdmin(reservationId, button) {
    if (!window.confirm("Esta reserva se cancelara inmediatamente. Deseas continuar?")) {
        return;
    }

    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(button, true, "Cancelando...");

    try {
        const response = await fetch(`/api/admin/reservas/${reservationId}/cancelar`, {
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

            showMessage(adminReservasMessage, data.message || "No fue posible cancelar la reserva.", "error");
            return;
        }

        await loadAdminReservas(currentAdminReservasPage, false);
        showMessage(
            adminReservasMessage,
            `La reserva #${data.id} fue cancelada correctamente.`,
            "success"
        );
    } catch (error) {
        showMessage(adminReservasMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(button, false);
    }
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

function getReservationBadgeClass(estado) {
    if (estado === "CANCELADA") {
        return "status-badge--cancelled";
    }

    if (estado === "FINALIZADA") {
        return "status-badge--finished";
    }

    if (estado === "CONFIRMADA") {
        return "status-badge--confirmed";
    }

    return "status-badge--pending";
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

function formatDate(value) {
    if (!value) {
        return "Sin fecha";
    }

    const date = new Date(`${value}T00:00:00`);

    return new Intl.DateTimeFormat("es-CO", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(date);
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

function formatTime(value) {
    return String(value || "").slice(0, 5);
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

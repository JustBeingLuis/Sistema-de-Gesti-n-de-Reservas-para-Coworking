const logoutButton = document.getElementById("reservas-logout-button");
const reservasMessage = document.getElementById("reservas-message");
const sessionSummary = document.getElementById("reservas-session-summary");
const reservasSummary = document.getElementById("reservas-summary");
const reservasGrid = document.getElementById("reservas-grid");
const reservasPagination = document.getElementById("reservas-pagination");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";
const RESERVAS_PAGE_SIZE = 6;

let currentReservasPage = 0;

logoutButton.addEventListener("click", () => {
    localStorage.removeItem(TOKEN_KEY);
    window.location.assign(LOGIN_URL);
});

reservasGrid.addEventListener("click", async (event) => {
    const cancelButton = event.target.closest("[data-reserva-id]");

    if (!cancelButton || cancelButton.disabled) {
        return;
    }

    const reservaId = Number(cancelButton.dataset.reservaId);

    if (!Number.isInteger(reservaId)) {
        return;
    }

    await cancelarReserva(reservaId, cancelButton);
});

reservasPagination.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-page-target]");

    if (!button || button.disabled) {
        return;
    }

    const targetPage = Number(button.dataset.pageTarget);

    if (!Number.isInteger(targetPage) || targetPage < 0 || targetPage === currentReservasPage) {
        return;
    }

    await loadReservas(targetPage, false);
});

hydrateReservasView();

async function hydrateReservasView() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    await Promise.all([loadPerfil(), loadReservas(currentReservasPage, false)]);
}

async function loadPerfil() {
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
                localStorage.removeItem(TOKEN_KEY);
                window.location.replace(LOGIN_URL);
            }
            return;
        }

        sessionSummary.innerHTML = `
            <strong>${escapeHtml(data.nombre || "")}</strong>
            <span>Correo: ${escapeHtml(data.correo || "")}</span>
            <span>Rol: ${escapeHtml(data.rol || "")}</span>
        `;
    } catch (error) {
        sessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
    }
}

async function loadReservas(page = currentReservasPage, showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const params = new URLSearchParams({
            page: String(page),
            size: String(RESERVAS_PAGE_SIZE)
        });

        const response = await fetch(`/api/reservas/mias?${params.toString()}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem(TOKEN_KEY);
                window.location.replace(LOGIN_URL);
                return;
            }

            showMessage(reservasMessage, data.message || "No fue posible consultar tus reservas.", "error");
            return;
        }

        const summary = data.resumen || {};
        const pageData = data.pagina || buildEmptyPageData(page, RESERVAS_PAGE_SIZE);
        const reservas = Array.isArray(pageData.content) ? pageData.content : [];

        currentReservasPage = pageData.pageNumber ?? page;

        renderReservasSummary(summary);
        renderReservasGrid(reservas);
        renderPagination(reservasPagination, pageData, "reservas");

        if (showFeedback) {
            if (reservas.length > 0) {
                showMessage(
                    reservasMessage,
                    `Mostrando ${pageData.numberOfElements} reserva(s) de ${summary.totalReservas || pageData.totalElements || 0}.`,
                    "success"
                );
            } else {
                showMessage(reservasMessage, "Todavia no tienes reservas registradas.", "");
            }
        } else {
            showMessage(reservasMessage, "", "");
        }
    } catch (error) {
        showMessage(reservasMessage, "No fue posible conectar con el backend.", "error");
    }
}

async function cancelarReserva(reservaId, button) {
    const token = localStorage.getItem(TOKEN_KEY);
    toggleLoading(button, true, "Cancelando...");

    try {
        const response = await fetch(`/api/reservas/${reservaId}/cancelar`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem(TOKEN_KEY);
                window.location.replace(LOGIN_URL);
                return;
            }

            showMessage(reservasMessage, data.message || "No fue posible cancelar la reserva.", "error");
            return;
        }

        await loadReservas(currentReservasPage, false);
        showMessage(
            reservasMessage,
            `La reserva de ${data.nombreEspacio || "tu espacio"} para el ${formatDate(data.fecha)} fue cancelada correctamente.`,
            "success"
        );
    } catch (error) {
        showMessage(reservasMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(button, false);
    }
}

function renderReservasSummary(reservas) {
    reservasSummary.innerHTML = `
        <article class="summary-card">
            <span>Total de reservas</span>
            <strong>${Number(reservas.totalReservas || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>Reservas activas</span>
            <strong>${Number(reservas.reservasActivas || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>Cancelables hoy</span>
            <strong>${Number(reservas.cancelablesHoy || 0)}</strong>
        </article>
    `;
}

function renderReservasGrid(reservas) {
    if (!reservas || reservas.length === 0) {
        reservasGrid.innerHTML = `
            <article class="empty-state">
                <h3>Aun no tienes reservas</h3>
                <p>Cuando registres una reserva, aparecera aqui con su estado y horario.</p>
            </article>
        `;
        return;
    }

    reservasGrid.innerHTML = reservas.map((reserva) => {
        const estado = (reserva.estado || "").toUpperCase();
        const badgeClass = getReservationBadgeClass(estado);
        const note = reserva.puedeCancelarse
            ? "Puedes cancelarla porque aun faltan al menos 6 horas para su inicio."
            : reserva.motivoNoCancelable || "Esta reserva ya no admite cancelacion.";

        return `
            <article class="reservation-card">
                <div class="reservation-card-header">
                    <div>
                        <h3>${escapeHtml(reserva.nombreEspacio || "")}</h3>
                        <p class="reservation-subtitle">${escapeHtml(reserva.tipoEspacio || "Espacio")}</p>
                    </div>
                    <span class="space-badge ${badgeClass}">${escapeHtml(estado || "RESERVA")}</span>
                </div>

                <div class="reservation-meta">
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
                </div>

                <p class="reservation-note">${escapeHtml(note)}</p>

                <div class="reservation-actions">
                    <button
                        type="button"
                        class="secondary-button reservation-cancel-button"
                        data-reserva-id="${reserva.id}"
                        ${reserva.puedeCancelarse ? "" : "disabled"}
                    >
                        ${reserva.puedeCancelarse ? "Cancelar reserva" : "No cancelable"}
                    </button>
                </div>
            </article>
        `;
    }).join("");
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

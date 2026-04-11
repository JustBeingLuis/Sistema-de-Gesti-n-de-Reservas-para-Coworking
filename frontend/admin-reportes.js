const adminReportesLogoutButton = document.getElementById("admin-reportes-logout-button");
const adminReportesSessionSummary = document.getElementById("admin-reportes-session-summary");
const adminReportesMessage = document.getElementById("admin-reportes-message");
const adminReportesFormMessage = document.getElementById("admin-reportes-form-message");
const adminReportesSummaryNote = document.getElementById("admin-reportes-summary-note");
const adminReportesSummary = document.getElementById("admin-reportes-summary");
const adminReportesGrid = document.getElementById("admin-reportes-grid");
const adminReportesPagination = document.getElementById("admin-reportes-pagination");
const reportFilterForm = document.getElementById("report-filter-form");
const reportStartDate = document.getElementById("report-start-date");
const reportEndDate = document.getElementById("report-end-date");
const reportStatus = document.getElementById("report-status");
const reportScope = document.getElementById("report-scope");
const reportSpaceField = document.getElementById("report-space-field");
const reportSpaceSelect = document.getElementById("report-space-select");
const reportSubmitButton = document.getElementById("report-submit-button");
const reportResetButton = document.getElementById("report-reset-button");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";
const DASHBOARD_URL = "/dashboard.html";
const ADMIN_REPORTS_PAGE_SIZE = 6;

let currentAdminReportsPage = 0;

adminReportesLogoutButton.addEventListener("click", () => {
    clearSession();
    window.location.assign(LOGIN_URL);
});

reportFilterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadAdminReportes(0, true);
});

reportResetButton.addEventListener("click", async () => {
    resetReportFilters();
    await loadAdminReportes(0, false);
});

reportScope.addEventListener("change", () => {
    syncReportScopeField();
});

adminReportesPagination.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-page-target]");

    if (!button || button.disabled) {
        return;
    }

    const targetPage = Number(button.dataset.pageTarget);

    if (!Number.isInteger(targetPage) || targetPage < 0 || targetPage === currentAdminReportsPage) {
        return;
    }

    await loadAdminReportes(targetPage, false);
});

hydrateAdminReportesView();

async function hydrateAdminReportesView() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    setDefaultDateRange();
    syncReportScopeField();

    const perfilValido = await loadSessionAndAuthorize();

    if (!perfilValido) {
        return;
    }

    await loadSpacesForReports();
    await loadAdminReportes(currentAdminReportsPage, false);
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

        adminReportesSessionSummary.innerHTML = `
            <strong>${escapeHtml(data.nombre || "")}</strong>
            <span>Correo: ${escapeHtml(data.correo || "")}</span>
            <span>Rol: ${escapeHtml(data.rol || "")}</span>
        `;
        return true;
    } catch (error) {
        adminReportesSessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
        return false;
    }
}

async function loadSpacesForReports() {
    const token = localStorage.getItem(TOKEN_KEY);

    try {
        const response = await fetch("/api/admin/reportes/ocupacion/espacios", {
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

            showMessage(adminReportesFormMessage, data.message || "No fue posible cargar los espacios para el reporte.", "error");
            return;
        }

        reportSpaceSelect.innerHTML = `
            <option value="">Selecciona un espacio</option>
            ${data.map((espacio) => `
                <option value="${espacio.id}">
                    ${escapeHtml(espacio.nombre || "")} · ${escapeHtml(espacio.tipoNombre || "Espacio")}${espacio.activo ? "" : " · Inactivo"}
                </option>
            `).join("")}
        `;
    } catch (error) {
        showMessage(adminReportesFormMessage, "No fue posible conectar con el backend.", "error");
    }
}

async function loadAdminReportes(page = currentAdminReportsPage, showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);
    const filtros = buildReportFilters();

    if (!filtros) {
        return;
    }

    toggleLoading(reportSubmitButton, true, "Generando...");

    try {
        const params = new URLSearchParams({
            fechaInicio: filtros.fechaInicio,
            fechaFin: filtros.fechaFin,
            estado: filtros.estado,
            modo: filtros.modo,
            page: String(page),
            size: String(ADMIN_REPORTS_PAGE_SIZE)
        });

        if (filtros.espacioId) {
            params.set("espacioId", String(filtros.espacioId));
        }

        const response = await fetch(`/api/admin/reportes/ocupacion?${params.toString()}`, {
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

            showMessage(adminReportesMessage, data.message || "No fue posible generar el reporte.", "error");
            return;
        }

        currentAdminReportsPage = data.pagina?.pageNumber ?? page;
        renderReportSummary(data.resumen || {});
        renderReportGrid(Array.isArray(data.pagina?.content) ? data.pagina.content : []);
        renderPagination(adminReportesPagination, data.pagina || buildEmptyPageData(page, ADMIN_REPORTS_PAGE_SIZE), "registros");

        if (showFeedback) {
            const total = Number(data.resumen?.totalReservas || data.pagina?.totalElements || 0);
            const current = Number(data.pagina?.numberOfElements || 0);
            const message = total > 0
                ? `Mostrando ${current} registro(s) de ${total} en el reporte.`
                : "El reporte no encontro reservas para los filtros seleccionados.";
            showMessage(adminReportesMessage, message, total > 0 ? "success" : "");
        } else {
            showMessage(adminReportesMessage, "", "");
        }

        showMessage(adminReportesFormMessage, "", "");
    } catch (error) {
        showMessage(adminReportesMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(reportSubmitButton, false);
    }
}

function buildReportFilters() {
    const fechaInicio = reportStartDate.value;
    const fechaFin = reportEndDate.value;
    const estado = String(reportStatus.value || "").toUpperCase();
    const modo = String(reportScope.value || "").toUpperCase();
    const espacioId = reportSpaceSelect.value ? Number(reportSpaceSelect.value) : null;

    if (!fechaInicio || !fechaFin) {
        showMessage(adminReportesFormMessage, "Debes indicar la fecha inicial y la fecha final.", "error");
        return null;
    }

    if (fechaInicio > fechaFin) {
        showMessage(adminReportesFormMessage, "La fecha inicial no puede ser posterior a la fecha final.", "error");
        return null;
    }

    if (!["CONFIRMADA", "CANCELADA", "FINALIZADA"].includes(estado)) {
        showMessage(adminReportesFormMessage, "Debes seleccionar un estado valido.", "error");
        return null;
    }

    if (modo === "ESPACIO" && (!Number.isInteger(espacioId) || espacioId < 1)) {
        showMessage(adminReportesFormMessage, "Debes seleccionar un espacio para el reporte individual.", "error");
        return null;
    }

    return {
        fechaInicio,
        fechaFin,
        estado,
        modo,
        espacioId
    };
}

function renderReportSummary(resumen) {
    const modo = String(resumen.modo || "GENERAL").toUpperCase();
    const esIndividual = modo === "ESPACIO";
    const espacioLabel = esIndividual
        ? (resumen.nombreEspacio || "Espacio seleccionado")
        : String(Number(resumen.espaciosIncluidos || 0));

    adminReportesSummary.innerHTML = `
        <article class="summary-card">
            <span>Total de reservas</span>
            <strong>${Number(resumen.totalReservas || 0)}</strong>
        </article>
        <article class="summary-card">
            <span>${esIndividual ? "Espacio reportado" : "Espacios incluidos"}</span>
            <strong>${escapeHtml(espacioLabel)}</strong>
        </article>
        <article class="summary-card">
            <span>Estado consultado</span>
            <strong class="report-state-value">${escapeHtml(formatStatus(resumen.estado || ""))}</strong>
        </article>
    `;

    const rango = resumen.fechaInicio && resumen.fechaFin
        ? `${formatDate(resumen.fechaInicio)} al ${formatDate(resumen.fechaFin)}`
        : "Sin rango consultado";
    const alcance = esIndividual
        ? `Reporte individual del espacio ${escapeHtml(resumen.nombreEspacio || "")}.`
        : "Reporte grupal de todos los espacios.";

    adminReportesSummaryNote.innerHTML = `${alcance} Rango consultado: <strong>${rango}</strong>.`;
}

function renderReportGrid(registros) {
    if (!registros || registros.length === 0) {
        adminReportesGrid.innerHTML = `
            <article class="empty-state">
                <h3>Sin resultados para este reporte</h3>
                <p>Ajusta el rango, el estado o el espacio para consultar otro conjunto de reservas.</p>
            </article>
        `;
        return;
    }

    adminReportesGrid.innerHTML = registros.map((registro) => {
        const estado = String(registro.estado || "").toUpperCase();
        const badgeClass = getReservationBadgeClass(estado);

        return `
            <article class="reservation-card">
                <div class="reservation-card-header">
                    <div>
                        <h3>${escapeHtml(registro.nombreEspacio || "")}</h3>
                        <p class="reservation-subtitle">${escapeHtml(registro.tipoEspacio || "Espacio")}</p>
                    </div>
                    <span class="space-badge ${badgeClass}">${escapeHtml(formatStatus(estado))}</span>
                </div>

                <p class="reservation-note reservation-note--stacked">
                    <strong>${escapeHtml(registro.usuarioNombre || "")}</strong>
                    <span class="reservation-note-inline">${escapeHtml(registro.usuarioCorreo || "")}</span>
                </p>

                <div class="reservation-meta reservation-meta--report">
                    <div class="space-meta-item">
                        <span>Creada</span>
                        <strong>${formatDateTime(registro.fechaCreacion)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Fecha</span>
                        <strong>${formatDate(registro.fecha)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Horario</span>
                        <strong>${formatTime(registro.horaInicio)} - ${formatTime(registro.horaFin)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Duracion</span>
                        <strong>${formatDuration(registro.duracionMinutos)}</strong>
                    </div>
                    <div class="space-meta-item">
                        <span>Reserva</span>
                        <strong>#${registro.reservaId}</strong>
                    </div>
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

function syncReportScopeField() {
    const isIndividual = String(reportScope.value || "").toUpperCase() === "ESPACIO";
    reportSpaceField.hidden = !isIndividual;
    reportSpaceSelect.disabled = !isIndividual;

    if (!isIndividual) {
        reportSpaceSelect.value = "";
    }
}

function resetReportFilters() {
    reportStatus.value = "CONFIRMADA";
    reportScope.value = "GENERAL";
    reportSpaceSelect.value = "";
    setDefaultDateRange();
    syncReportScopeField();
    showMessage(adminReportesFormMessage, "", "");
}

function setDefaultDateRange() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    reportStartDate.value = toDateInputValue(firstDay);
    reportEndDate.value = toDateInputValue(today);
}

function toDateInputValue(date) {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function formatStatus(value) {
    const estado = String(value || "").toUpperCase();

    if (estado === "CONFIRMADA") {
        return "Confirmadas";
    }

    if (estado === "CANCELADA") {
        return "Canceladas";
    }

    if (estado === "FINALIZADA") {
        return "Finalizadas";
    }

    return estado || "Sin estado";
}

function formatDuration(minutes) {
    const totalMinutes = Number(minutes || 0);

    if (totalMinutes < 60) {
        return `${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const remainder = totalMinutes % 60;

    return remainder === 0 ? `${hours} h` : `${hours} h ${remainder} min`;
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

function formatTime(value) {
    return String(value || "").slice(0, 5);
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

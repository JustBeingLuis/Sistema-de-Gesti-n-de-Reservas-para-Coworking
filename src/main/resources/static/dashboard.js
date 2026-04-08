const logoutButton = document.getElementById("logout-button");
const spacesMessage = document.getElementById("spaces-message");
const sessionSummary = document.getElementById("session-summary");
const myReservationsLink = document.getElementById("my-reservations-link");
const adminSpacesLink = document.getElementById("admin-spaces-link");
const adminReservationsLink = document.getElementById("admin-reservations-link");
const spacesSummary = document.getElementById("spaces-summary");
const spacesGrid = document.getElementById("spaces-grid");
const spacesPagination = document.getElementById("spaces-pagination");
const availabilityModal = document.getElementById("availability-modal");
const modalCloseButton = document.getElementById("modal-close-button");
const availabilityForm = document.getElementById("availability-form");
const availabilityDateInput = document.getElementById("availability-date");
const availabilityStartInput = document.getElementById("availability-start-time");
const availabilityEndInput = document.getElementById("availability-end-time");
const availabilitySubmitButton = document.getElementById("availability-submit-button");
const reserveSubmitButton = document.getElementById("reserve-submit-button");
const availabilityMessage = document.getElementById("availability-message");
const availabilitySummary = document.getElementById("availability-summary");
const occupiedSlots = document.getElementById("occupied-slots");
const modalTitle = document.getElementById("availability-title");
const modalSpaceBadge = document.getElementById("modal-space-badge");
const modalSpaceCopy = document.getElementById("modal-space-copy");
const modalSpaceMeta = document.getElementById("modal-space-meta");

const TOKEN_KEY = "coworking_access_token";
const LOGIN_URL = "/index.html";
const SPACES_PAGE_SIZE = 6;
const spaceCatalog = new Map();

let currentSpaceId = null;
let currentSpacesPage = 0;

logoutButton.addEventListener("click", () => {
    clearSession();
    closeAvailabilityModal();
    window.location.assign(LOGIN_URL);
});

spacesGrid.addEventListener("click", async (event) => {
    const detailsButton = event.target.closest("[data-space-id]");

    if (!detailsButton) {
        return;
    }

    const spaceId = Number(detailsButton.dataset.spaceId);

    if (!Number.isInteger(spaceId)) {
        return;
    }

    await openAvailabilityModal(spaceId);
});

spacesPagination.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-page-target]");

    if (!button || button.disabled) {
        return;
    }

    const targetPage = Number(button.dataset.pageTarget);

    if (!Number.isInteger(targetPage) || targetPage < 0 || targetPage === currentSpacesPage) {
        return;
    }

    await loadSpaces(targetPage, false);
});

availabilityForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await loadAvailabilityDetails(true);
});

reserveSubmitButton.addEventListener("click", async () => {
    await createReservation();
});

modalCloseButton.addEventListener("click", () => {
    closeAvailabilityModal();
});

availabilityModal.addEventListener("click", (event) => {
    if (event.target === availabilityModal) {
        closeAvailabilityModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !availabilityModal.hidden) {
        closeAvailabilityModal();
    }
});

[availabilityDateInput, availabilityStartInput, availabilityEndInput].forEach((input) => {
    ["input", "change"].forEach((eventName) => {
        input.addEventListener(eventName, () => {
            syncReserveButtonState();
        });
    });
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
            }
            return;
        }

        renderSessionSummary(data);
        await loadSpaces(currentSpacesPage, false);
    } catch (error) {
        sessionSummary.innerHTML = `
            <strong>No fue posible cargar tu sesion</strong>
            <span>Verifica la conexion con el backend e intenta nuevamente.</span>
        `;
    }
}

async function loadSpaces(page = currentSpacesPage, showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    try {
        const params = new URLSearchParams({
            page: String(page),
            size: String(SPACES_PAGE_SIZE)
        });

        const response = await fetch(`/api/espacios/disponibles?${params.toString()}`, {
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

            if (showFeedback) {
                showMessage(spacesMessage, data.message || "No fue posible consultar los espacios.", "error");
            }
            return;
        }

        const summary = data.resumen || {};
        const pageData = data.pagina || buildEmptyPageData(page, SPACES_PAGE_SIZE);
        const espacios = Array.isArray(pageData.content) ? pageData.content : [];

        currentSpacesPage = pageData.pageNumber ?? page;

        renderSpacesSummary(summary);
        renderSpacesGrid(espacios);
        renderPagination(spacesPagination, pageData, "espacios");

        if (showFeedback) {
            const message = espacios.length > 0
                ? `Mostrando ${pageData.numberOfElements} espacio(s) de ${summary.totalEspacios || pageData.totalElements || 0}.`
                : "No hay espacios activos registrados en este momento.";
            showMessage(spacesMessage, message, espacios.length > 0 ? "success" : "error");
        } else {
            showMessage(spacesMessage, "", "");
        }
    } catch (error) {
        if (showFeedback) {
            showMessage(spacesMessage, "No fue posible conectar con el backend.", "error");
        }
    }
}

async function openAvailabilityModal(spaceId) {
    const espacio = spaceCatalog.get(spaceId);

    if (!espacio) {
        return;
    }

    currentSpaceId = spaceId;
    availabilityForm.reset();
    availabilityDateInput.value = getTodayDateValue();
    renderModalHeader(espacio);
    renderAvailabilityPlaceholder();
    syncReserveButtonState();
    showMessage(availabilityMessage, "", "");
    availabilityModal.hidden = false;
    document.body.classList.add("modal-open");

    await loadAvailabilityDetails(false);
}

function closeAvailabilityModal() {
    availabilityModal.hidden = true;
    document.body.classList.remove("modal-open");
    currentSpaceId = null;
    availabilityForm.reset();
    syncReserveButtonState();
    showMessage(availabilityMessage, "", "");
}

async function loadAvailabilityDetails(showFeedback = true) {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    if (!currentSpaceId) {
        return;
    }

    const fecha = availabilityDateInput.value;
    const horaInicio = availabilityStartInput.value;
    const horaFin = availabilityEndInput.value;

    if (!fecha) {
        showMessage(availabilityMessage, "Debes seleccionar una fecha para consultar la disponibilidad.", "error");
        return;
    }

    if ((horaInicio && !horaFin) || (!horaInicio && horaFin)) {
        showMessage(availabilityMessage, "Debes diligenciar la hora de inicio y la hora de fin juntas.", "error");
        return;
    }

    if (horaInicio && horaFin && horaInicio >= horaFin) {
        showMessage(availabilityMessage, "La hora de inicio debe ser anterior a la hora de fin.", "error");
        return;
    }

    toggleLoading(availabilitySubmitButton, true, "Consultando...");

    try {
        const params = new URLSearchParams({ fecha });

        if (horaInicio) {
            params.set("horaInicio", horaInicio);
            params.set("horaFin", horaFin);
        }

        const response = await fetch(`/api/espacios/${currentSpaceId}/disponibilidad?${params.toString()}`, {
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

            showMessage(availabilityMessage, data.message || "No fue posible consultar la disponibilidad.", "error");
            return;
        }

        renderAvailabilitySummary(data);
        renderOccupiedSlots(data.horariosOcupados || []);

        if (showFeedback) {
            showMessage(availabilityMessage, "Consulta realizada correctamente.", "success");
        } else {
            showMessage(availabilityMessage, "", "");
        }
    } catch (error) {
        showMessage(availabilityMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(availabilitySubmitButton, false);
    }
}

function renderSessionSummary(usuario) {
    const esAdmin = String(usuario.rol || "").toUpperCase() === "ADMIN";
    myReservationsLink.hidden = esAdmin;
    adminSpacesLink.hidden = !esAdmin;
    adminReservationsLink.hidden = !esAdmin;

    sessionSummary.innerHTML = `
        <strong>${escapeHtml(usuario.nombre || "")}</strong>
        <span>Correo: ${escapeHtml(usuario.correo || "")}</span>
        <span>Rol: ${escapeHtml(usuario.rol || "")}</span>
    `;
}

function renderSpacesSummary(espacios) {
    const totalEspacios = Number(espacios.totalEspacios || 0);
    const capacidadAcumulada = Number(espacios.capacidadAcumulada || 0);
    const tipos = Number(espacios.tiposDisponibles || 0);

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
    spaceCatalog.clear();

    if (!espacios || espacios.length === 0) {
        spacesGrid.innerHTML = `
            <article class="empty-state">
                <h3>Todavia no hay espacios activos</h3>
                <p>Cuando el catalogo tenga espacios habilitados para reserva, apareceran aqui.</p>
            </article>
        `;
        return;
    }

    espacios.forEach((espacio) => {
        spaceCatalog.set(Number(espacio.id), espacio);
    });

    spacesGrid.innerHTML = espacios.map((espacio) => `
        <article class="space-card">
            <div class="space-card-header">
                <div>
                    <h3>${escapeHtml(espacio.nombre || "")}</h3>
                </div>
                <span class="space-badge">${escapeHtml(espacio.tipo || "")}</span>
            </div>
            <p class="space-description">${escapeHtml(
                espacio.descripcionTipo || "Espacio habilitado para reserva dentro del coworking."
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
            <div class="space-card-actions">
                <button type="button" class="secondary-button space-details-button" data-space-id="${espacio.id}">
                    Detalles
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

function renderModalHeader(espacio) {
    modalTitle.textContent = espacio.nombre || "Espacio";
    modalSpaceBadge.textContent = espacio.tipo || "Espacio";
    modalSpaceCopy.textContent = espacio.descripcionTipo
        || "Consulta los horarios ocupados del espacio y crea la reserva para la fecha y horario seleccionados.";
    modalSpaceMeta.textContent = `Capacidad: ${espacio.capacidad} persona${espacio.capacidad === 1 ? "" : "s"} | Precio por hora: ${formatPrice(espacio.precioPorHora)}`;
}

function renderAvailabilityPlaceholder() {
    availabilitySummary.innerHTML = `
        <article class="summary-card availability-card">
            <span>Fecha consultada</span>
            <strong>${formatDate(getTodayDateValue())}</strong>
        </article>
        <article class="summary-card availability-card">
            <span>Rango consultado</span>
            <strong>Todo el dia</strong>
        </article>
        <article class="summary-card availability-card">
            <span>Estado</span>
            <div class="availability-status">
                <span class="availability-chip">Cargando</span>
                <p>Estamos consultando la disponibilidad real del espacio.</p>
            </div>
        </article>
    `;

    occupiedSlots.innerHTML = `
        <article class="empty-state empty-state--compact">
            <h3>Consultando disponibilidad</h3>
            <p>En breve veras aqui los horarios ocupados para la fecha seleccionada.</p>
        </article>
    `;
}

function renderAvailabilitySummary(disponibilidad) {
    const estadoConsulta = buildAvailabilityStatus(disponibilidad);
    const rangoConsultado = disponibilidad.horaInicioConsulta && disponibilidad.horaFinConsulta
        ? `${formatTime(disponibilidad.horaInicioConsulta)} - ${formatTime(disponibilidad.horaFinConsulta)}`
        : "Todo el dia";

    availabilitySummary.innerHTML = `
        <article class="summary-card availability-card">
            <span>Fecha consultada</span>
            <strong>${formatDate(disponibilidad.fecha)}</strong>
        </article>
        <article class="summary-card availability-card">
            <span>Rango consultado</span>
            <strong>${rangoConsultado}</strong>
        </article>
        <article class="summary-card availability-card">
            <span>Estado</span>
            <div class="availability-status">
                <span class="availability-chip ${estadoConsulta.className}">${estadoConsulta.label}</span>
                <p>${escapeHtml(disponibilidad.mensajeDisponibilidad || "")}</p>
            </div>
        </article>
    `;
}

function renderOccupiedSlots(horariosOcupados) {
    if (!horariosOcupados.length) {
        occupiedSlots.innerHTML = `
            <article class="empty-state empty-state--compact">
                <h3>Sin horarios ocupados</h3>
                <p>Para la fecha seleccionada este espacio no tiene bloques reservados.</p>
            </article>
        `;
        return;
    }

    occupiedSlots.innerHTML = horariosOcupados.map((horario) => `
        <article class="slot-card">
            <div class="slot-card-copy">
                <strong>${formatTime(horario.horaInicio)} - ${formatTime(horario.horaFin)}</strong>
                <span>Bloque reservado en el sistema</span>
            </div>
            <span class="space-badge">${escapeHtml(horario.estado || "RESERVADO")}</span>
        </article>
    `).join("");
}

function buildAvailabilityStatus(disponibilidad) {
    if (disponibilidad.rangoConsultadoDisponible === true) {
        return {
            label: "Disponible",
            className: "availability-chip--available"
        };
    }

    if (disponibilidad.rangoConsultadoDisponible === false) {
        return {
            label: "No disponible",
            className: "availability-chip--occupied"
        };
    }

    if (disponibilidad.totalHorariosOcupados > 0) {
        return {
            label: `${disponibilidad.totalHorariosOcupados} bloque(s) ocupado(s)`,
            className: ""
        };
    }

    return {
        label: "Dia sin ocupacion",
        className: "availability-chip--available"
    };
}

async function createReservation() {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
        window.location.replace(LOGIN_URL);
        return;
    }

    if (!currentSpaceId) {
        return;
    }

    const fecha = availabilityDateInput.value;
    const horaInicio = availabilityStartInput.value;
    const horaFin = availabilityEndInput.value;

    if (!fecha || !horaInicio || !horaFin) {
        showMessage(availabilityMessage, "Debes indicar fecha, hora de inicio y hora de fin para crear la reserva.", "error");
        return;
    }

    if (horaInicio >= horaFin) {
        showMessage(availabilityMessage, "La hora de inicio debe ser anterior a la hora de fin.", "error");
        return;
    }

    toggleLoading(reserveSubmitButton, true, "Reservando...");

    try {
        const response = await fetch("/api/reservas", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                espacioId: currentSpaceId,
                fecha,
                horaInicio,
                horaFin
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                clearSession();
                window.location.replace(LOGIN_URL);
                return;
            }

            showMessage(availabilityMessage, data.message || "No fue posible crear la reserva.", "error");
            return;
        }

        availabilityStartInput.value = "";
        availabilityEndInput.value = "";
        syncReserveButtonState();
        await loadAvailabilityDetails(false);

        showMessage(
            availabilityMessage,
            `Reserva creada correctamente para ${data.nombreEspacio || "el espacio"} el ${formatDate(data.fecha)} de ${formatTime(data.horaInicio)} a ${formatTime(data.horaFin)}.`,
            "success"
        );
    } catch (error) {
        showMessage(availabilityMessage, "No fue posible conectar con el backend.", "error");
    } finally {
        toggleLoading(reserveSubmitButton, false);
        syncReserveButtonState();
    }
}

function syncReserveButtonState() {
    const canReserve = Boolean(
        currentSpaceId
        && availabilityDateInput.value
        && availabilityStartInput.value
        && availabilityEndInput.value
    );

    reserveSubmitButton.disabled = !canReserve;
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
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

function formatPrice(value) {
    const number = Number(value || 0);
    return `$ ${new Intl.NumberFormat("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number)}`;
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

function getTodayDateValue() {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${today.getFullYear()}-${month}-${day}`;
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

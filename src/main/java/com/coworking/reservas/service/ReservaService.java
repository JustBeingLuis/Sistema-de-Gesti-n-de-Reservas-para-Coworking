package com.coworking.reservas.service;

import java.time.LocalDateTime;
import java.time.ZoneId;

import com.coworking.reservas.domain.Espacio;
import com.coworking.reservas.domain.EstadoReserva;
import com.coworking.reservas.domain.Reserva;
import com.coworking.reservas.domain.Usuario;
import com.coworking.reservas.dto.PageResponse;
import com.coworking.reservas.dto.ReservaAdminListadoResponse;
import com.coworking.reservas.dto.ReservaAdminResponse;
import com.coworking.reservas.dto.ReservaAdminSummaryResponse;
import com.coworking.reservas.dto.ReservaCreateRequest;
import com.coworking.reservas.dto.ReservaListadoResponse;
import com.coworking.reservas.dto.ReservaListadoSummaryResponse;
import com.coworking.reservas.dto.ReservaResponse;
import com.coworking.reservas.exception.ResourceNotFoundException;
import com.coworking.reservas.repository.EspacioRepository;
import com.coworking.reservas.repository.EstadoReservaRepository;
import com.coworking.reservas.repository.ReservaRepository;
import com.coworking.reservas.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReservaService implements IReservaService {

    private static final String ESTADO_RESERVA_POR_DEFECTO = "CONFIRMADA";
    private static final String ESTADO_CANCELADA = "CANCELADA";
    private static final String ESTADO_FINALIZADA = "FINALIZADA";
    private static final long HORAS_MINIMAS_ANTICIPACION_CANCELACION = 6;
    private static final int MAX_PAGE_SIZE = 24;

    @Value("${app.timezone}")
    private String appTimezone;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EspacioRepository espacioRepository;

    @Autowired
    private EstadoReservaRepository estadoReservaRepository;

    @Override
    public ReservaResponse crearReserva(Long usuarioId, ReservaCreateRequest reservaCreateRequest) {
        validarReserva(reservaCreateRequest);

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro el usuario autenticado para registrar la reserva."
                ));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new IllegalArgumentException("Tu cuenta no esta habilitada para crear reservas.");
        }

        Espacio espacio = espacioRepository.findByIdAndActivoTrue(reservaCreateRequest.getEspacioId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro un espacio activo con el id " + reservaCreateRequest.getEspacioId()
                ));

        if (!reservaRepository.findConflictosByEspacioFechaYHorario(
                espacio.getId(),
                reservaCreateRequest.getFecha(),
                reservaCreateRequest.getHoraInicio(),
                reservaCreateRequest.getHoraFin()
        ).isEmpty()) {
            throw new IllegalArgumentException(
                    "El espacio ya tiene una reserva en conflicto para el rango horario seleccionado."
            );
        }

        EstadoReserva estadoReserva = estadoReservaRepository.findByNombreIgnoreCase(ESTADO_RESERVA_POR_DEFECTO)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro el estado de reserva '" + ESTADO_RESERVA_POR_DEFECTO + "'."
                ));

        Reserva reserva = new Reserva();
        reserva.setFecha(reservaCreateRequest.getFecha());
        reserva.setHoraInicio(reservaCreateRequest.getHoraInicio());
        reserva.setHoraFin(reservaCreateRequest.getHoraFin());
        reserva.setFechaCreacion(LocalDateTime.now(getBusinessZoneId()));
        reserva.setUsuario(usuario);
        reserva.setEspacio(espacio);
        reserva.setEstado(estadoReserva);

        Reserva reservaGuardada = reservaRepository.save(reserva);
        return mapToResponse(reservaGuardada);
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Scheduled(fixedDelayString = "${app.reservas.finalization-interval-ms:60000}")
    public void actualizarReservasFinalizadas() {
        EstadoReserva estadoFinalizada = estadoReservaRepository.findByNombreIgnoreCase(ESTADO_FINALIZADA)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro el estado de reserva '" + ESTADO_FINALIZADA + "'."
                ));

        EstadoReserva estadoCancelada = estadoReservaRepository.findByNombreIgnoreCase(ESTADO_CANCELADA)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro el estado de reserva '" + ESTADO_CANCELADA + "'."
                ));

        LocalDateTime ahora = LocalDateTime.now(getBusinessZoneId());

        reservaRepository.marcarReservasComoFinalizadas(
                estadoFinalizada,
                estadoCancelada.getId(),
                estadoFinalizada.getId(),
                ahora.toLocalDate(),
                ahora.toLocalTime()
        );
    }

    @Override
    public ReservaListadoResponse consultarReservasDelUsuario(Long usuarioId, int page, int size) {
        actualizarReservasFinalizadas();
        validarPaginacion(page, size);

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("fecha"),
                        Sort.Order.desc("horaInicio")
                )
        );

        Page<ReservaResponse> reservas = reservaRepository.findByUsuarioId(usuarioId, pageable)
                .map(this::mapToResponse);

        LocalDateTime fechaReferenciaCancelacion = LocalDateTime.now(getBusinessZoneId())
                .plusHours(HORAS_MINIMAS_ANTICIPACION_CANCELACION);

        ReservaListadoSummaryResponse resumen = new ReservaListadoSummaryResponse(
                reservas.getTotalElements(),
                reservaRepository.countReservasActivasByUsuarioId(usuarioId),
                reservaRepository.countReservasCancelablesByUsuarioId(
                        usuarioId,
                        fechaReferenciaCancelacion.toLocalDate(),
                        fechaReferenciaCancelacion.toLocalTime()
                )
        );

        return new ReservaListadoResponse(PageResponse.from(reservas), resumen);
    }

    @Override
    public ReservaAdminListadoResponse consultarTodasLasReservas(int page, int size) {
        actualizarReservasFinalizadas();
        validarPaginacion(page, size);

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("fecha"),
                        Sort.Order.desc("horaInicio"),
                        Sort.Order.desc("fechaCreacion")
                )
        );

        Page<ReservaAdminResponse> reservas = reservaRepository.findAllBy(pageable)
                .map(this::mapToAdminResponse);

        ReservaAdminSummaryResponse resumen = new ReservaAdminSummaryResponse(
                reservas.getTotalElements(),
                reservaRepository.countReservasActivas(),
                reservaRepository.countReservasCanceladas()
        );

        return new ReservaAdminListadoResponse(PageResponse.from(reservas), resumen);
    }

    @Override
    public ReservaResponse cancelarReserva(Long usuarioId, Long reservaId) {
        actualizarReservasFinalizadas();

        Reserva reserva = reservaRepository.findDetalleById(reservaId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro la reserva solicitada."
                ));

        if (!reserva.getUsuario().getId().equals(usuarioId)) {
            throw new ResourceNotFoundException("No se encontro una reserva asociada a tu usuario con ese id.");
        }

        ValidacionCancelacion validacion = evaluarCancelacion(reserva);

        if (!validacion.puedeCancelarse()) {
            throw new IllegalArgumentException(validacion.motivoNoCancelable());
        }

        EstadoReserva estadoCancelada = estadoReservaRepository.findByNombreIgnoreCase(ESTADO_CANCELADA)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro el estado de reserva '" + ESTADO_CANCELADA + "'."
                ));

        reserva.setEstado(estadoCancelada);
        Reserva reservaActualizada = reservaRepository.save(reserva);
        return mapToResponse(reservaActualizada);
    }

    private void validarReserva(ReservaCreateRequest reservaCreateRequest) {
        if (!reservaCreateRequest.getHoraInicio().isBefore(reservaCreateRequest.getHoraFin())) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin.");
        }
    }

    private void validarPaginacion(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("El numero de pagina no puede ser negativo.");
        }

        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new IllegalArgumentException("El tamano de pagina debe estar entre 1 y " + MAX_PAGE_SIZE + ".");
        }
    }

    private ReservaResponse mapToResponse(Reserva reserva) {
        ValidacionCancelacion validacion = evaluarCancelacion(reserva);

        return new ReservaResponse(
                reserva.getId(),
                reserva.getEspacio().getId(),
                reserva.getEspacio().getNombre(),
                reserva.getEspacio().getTipo().getNombre(),
                reserva.getFecha(),
                reserva.getHoraInicio(),
                reserva.getHoraFin(),
                reserva.getFechaCreacion(),
                reserva.getEstado().getNombre(),
                validacion.puedeCancelarse(),
                validacion.motivoNoCancelable()
        );
    }

    private ReservaAdminResponse mapToAdminResponse(Reserva reserva) {
        return new ReservaAdminResponse(
                reserva.getId(),
                reserva.getUsuario().getId(),
                reserva.getUsuario().getNombre(),
                reserva.getUsuario().getCorreo(),
                reserva.getEspacio().getId(),
                reserva.getEspacio().getNombre(),
                reserva.getEspacio().getTipo().getNombre(),
                reserva.getFecha(),
                reserva.getHoraInicio(),
                reserva.getHoraFin(),
                reserva.getFechaCreacion(),
                reserva.getEstado().getNombre()
        );
    }

    private ValidacionCancelacion evaluarCancelacion(Reserva reserva) {
        String estadoReserva = reserva.getEstado().getNombre();

        if (ESTADO_CANCELADA.equalsIgnoreCase(estadoReserva)) {
            return new ValidacionCancelacion(false, "La reserva ya fue cancelada.");
        }

        if (ESTADO_FINALIZADA.equalsIgnoreCase(estadoReserva)) {
            return new ValidacionCancelacion(false, "La reserva ya fue finalizada y no puede cancelarse.");
        }

        LocalDateTime inicioReserva = LocalDateTime.of(reserva.getFecha(), reserva.getHoraInicio());
        LocalDateTime ahora = LocalDateTime.now(getBusinessZoneId());

        if (!inicioReserva.isAfter(ahora)) {
            return new ValidacionCancelacion(false, "La reserva ya inicio o ya ocurrio.");
        }

        LocalDateTime fechaLimiteCancelacion = inicioReserva.minusHours(HORAS_MINIMAS_ANTICIPACION_CANCELACION);

        if (ahora.isAfter(fechaLimiteCancelacion)) {
            return new ValidacionCancelacion(
                    false,
                    "Solo puedes cancelar con al menos 6 horas de antelacion respecto a la hora de inicio."
            );
        }

        return new ValidacionCancelacion(true, null);
    }

    private ZoneId getBusinessZoneId() {
        return ZoneId.of(appTimezone);
    }

    private record ValidacionCancelacion(Boolean puedeCancelarse, String motivoNoCancelable) {
    }
}

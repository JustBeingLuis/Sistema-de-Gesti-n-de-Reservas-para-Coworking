package com.coworking.reservas.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.coworking.reservas.domain.Espacio;
import com.coworking.reservas.domain.Reserva;
import com.coworking.reservas.domain.TipoEspacio;
import com.coworking.reservas.dto.EspacioAdminRequest;
import com.coworking.reservas.dto.EspacioAdminResponse;
import com.coworking.reservas.dto.EspacioCatalogSummaryResponse;
import com.coworking.reservas.dto.EspacioCatalogoResponse;
import com.coworking.reservas.dto.EspacioDisponibleResponse;
import com.coworking.reservas.dto.EspacioDisponibilidadDetalleResponse;
import com.coworking.reservas.dto.HorarioOcupadoResponse;
import com.coworking.reservas.dto.PageResponse;
import com.coworking.reservas.dto.TipoEspacioResponse;
import com.coworking.reservas.exception.ResourceNotFoundException;
import com.coworking.reservas.repository.EspacioRepository;
import com.coworking.reservas.repository.ReservaRepository;
import com.coworking.reservas.repository.TipoEspacioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EspacioService implements IEspacioService {

    private static final int MAX_PAGE_SIZE = 24;

    @Autowired
    private EspacioRepository espacioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private TipoEspacioRepository tipoEspacioRepository;

    @Override
    public EspacioCatalogoResponse consultarEspaciosDisponibles(int page, int size) {
        validarPaginacion(page, size);

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.asc("tipo.nombre"),
                        Sort.Order.asc("nombre")
                )
        );

        Page<EspacioDisponibleResponse> espacios = espacioRepository.findByActivoTrue(pageable)
                .map(this::mapToResponse);

        EspacioCatalogSummaryResponse resumen = new EspacioCatalogSummaryResponse(
                espacios.getTotalElements(),
                espacioRepository.sumCapacidadByActivoTrue(),
                espacioRepository.countTiposDisponiblesActivos()
        );

        return new EspacioCatalogoResponse(PageResponse.from(espacios), resumen);
    }

    @Override
    public PageResponse<EspacioAdminResponse> consultarEspaciosParaAdministracion(int page, int size) {
        validarPaginacion(page, size);

        PageRequest pageable = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("activo"),
                        Sort.Order.asc("tipo.nombre"),
                        Sort.Order.asc("nombre")
                )
        );

        Page<EspacioAdminResponse> espacios = espacioRepository.findAllBy(pageable)
                .map(this::mapToAdminResponse);

        return PageResponse.from(espacios);
    }

    @Override
    public EspacioAdminResponse buscarEspacioParaAdministracion(Long espacioId) {
        if (espacioId == null) {
            throw new IllegalArgumentException("El id del espacio es obligatorio.");
        }

        return mapToAdminResponse(buscarEspacioPorId(espacioId));
    }

    @Override
    @Transactional
    public EspacioAdminResponse crearEspacio(EspacioAdminRequest espacioAdminRequest) {
        validarSolicitudEspacio(espacioAdminRequest);

        TipoEspacio tipoEspacio = buscarTipoEspacio(espacioAdminRequest.getTipoId());

        Espacio espacio = new Espacio();
        aplicarCambios(espacio, espacioAdminRequest, tipoEspacio);

        return mapToAdminResponse(espacioRepository.save(espacio));
    }

    @Override
    @Transactional
    public EspacioAdminResponse actualizarEspacio(Long espacioId, EspacioAdminRequest espacioAdminRequest) {
        if (espacioId == null) {
            throw new IllegalArgumentException("El id del espacio es obligatorio.");
        }

        validarSolicitudEspacio(espacioAdminRequest);

        Espacio espacio = buscarEspacioPorId(espacioId);
        TipoEspacio tipoEspacio = buscarTipoEspacio(espacioAdminRequest.getTipoId());

        aplicarCambios(espacio, espacioAdminRequest, tipoEspacio);

        return mapToAdminResponse(espacioRepository.save(espacio));
    }

    @Override
    @Transactional
    public EspacioAdminResponse eliminarEspacio(Long espacioId) {
        if (espacioId == null) {
            throw new IllegalArgumentException("El id del espacio es obligatorio.");
        }

        Espacio espacio = buscarEspacioPorId(espacioId);
        espacio.setActivo(Boolean.FALSE);

        return mapToAdminResponse(espacioRepository.save(espacio));
    }

    @Override
    public List<TipoEspacioResponse> consultarTiposEspacio() {
        return tipoEspacioRepository.findAllByOrderByNombreAsc()
                .stream()
                .map(this::mapToTipoResponse)
                .toList();
    }

    @Override
    public EspacioDisponibilidadDetalleResponse consultarDisponibilidadPorFechaYHorario(Long espacioId, LocalDate fecha,
                                                                                        LocalTime horaInicio,
                                                                                        LocalTime horaFin) {
        validarConsultaDisponibilidad(fecha, horaInicio, horaFin);

        Espacio espacio = espacioRepository.findByIdAndActivoTrue(espacioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro un espacio activo con el id " + espacioId
                ));

        List<Reserva> reservas = reservaRepository.findHorariosOcupadosByEspacioAndFecha(espacioId, fecha);
        Boolean rangoDisponible = null;
        String mensajeDisponibilidad;

        if (horaInicio != null && horaFin != null) {
            rangoDisponible = reservas.stream()
                    .noneMatch(reserva -> haySolapamiento(horaInicio, horaFin,
                            reserva.getHoraInicio(), reserva.getHoraFin()));

            mensajeDisponibilidad = rangoDisponible
                    ? "El rango horario consultado esta disponible para este espacio."
                    : "El rango horario consultado entra en conflicto con una reserva existente.";
        } else if (reservas.isEmpty()) {
            mensajeDisponibilidad = "No hay horarios ocupados para la fecha consultada.";
        } else {
            mensajeDisponibilidad = "Estos son los horarios ocupados para la fecha consultada.";
        }

        List<HorarioOcupadoResponse> horariosOcupados = reservas.stream()
                .map(this::mapHorarioOcupado)
                .toList();

        return new EspacioDisponibilidadDetalleResponse(
                espacio.getId(),
                espacio.getNombre(),
                espacio.getTipo().getNombre(),
                espacio.getTipo().getDescripcion(),
                espacio.getCapacidad(),
                espacio.getPrecioPorHora(),
                fecha,
                horaInicio,
                horaFin,
                rangoDisponible,
                mensajeDisponibilidad,
                horariosOcupados.size(),
                horariosOcupados
        );
    }

    private EspacioDisponibleResponse mapToResponse(Espacio espacio) {
        return new EspacioDisponibleResponse(
                espacio.getId(),
                espacio.getNombre(),
                espacio.getTipo().getNombre(),
                espacio.getTipo().getDescripcion(),
                espacio.getCapacidad(),
                espacio.getPrecioPorHora()
        );
    }

    private EspacioAdminResponse mapToAdminResponse(Espacio espacio) {
        return new EspacioAdminResponse(
                espacio.getId(),
                espacio.getNombre(),
                espacio.getCapacidad(),
                espacio.getPrecioPorHora(),
                espacio.getActivo(),
                espacio.getTipo().getId(),
                espacio.getTipo().getNombre(),
                espacio.getTipo().getDescripcion()
        );
    }

    private TipoEspacioResponse mapToTipoResponse(TipoEspacio tipoEspacio) {
        return new TipoEspacioResponse(
                tipoEspacio.getId(),
                tipoEspacio.getNombre(),
                tipoEspacio.getDescripcion()
        );
    }

    private HorarioOcupadoResponse mapHorarioOcupado(Reserva reserva) {
        return new HorarioOcupadoResponse(
                reserva.getHoraInicio(),
                reserva.getHoraFin(),
                reserva.getEstado().getNombre()
        );
    }

    private void validarConsultaDisponibilidad(LocalDate fecha, LocalTime horaInicio, LocalTime horaFin) {
        if (fecha == null) {
            throw new IllegalArgumentException("Debes indicar una fecha para consultar la disponibilidad.");
        }

        if ((horaInicio == null && horaFin != null) || (horaInicio != null && horaFin == null)) {
            throw new IllegalArgumentException("Debes indicar la hora de inicio y la hora de fin juntas.");
        }

        if (horaInicio != null && !horaInicio.isBefore(horaFin)) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin.");
        }
    }

    private void validarSolicitudEspacio(EspacioAdminRequest espacioAdminRequest) {
        if (espacioAdminRequest.getNombre() == null || espacioAdminRequest.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre del espacio es obligatorio.");
        }

        if (espacioAdminRequest.getCapacidad() == null || espacioAdminRequest.getCapacidad() < 1) {
            throw new IllegalArgumentException("La capacidad debe ser mayor o igual a 1.");
        }

        if (espacioAdminRequest.getPrecioPorHora() == null
                || espacioAdminRequest.getPrecioPorHora().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("El precio por hora debe ser mayor que cero.");
        }

        if (espacioAdminRequest.getActivo() == null) {
            throw new IllegalArgumentException("Debes indicar si el espacio esta activo.");
        }

        if (espacioAdminRequest.getTipoId() == null) {
            throw new IllegalArgumentException("Debes seleccionar un tipo de espacio.");
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

    private TipoEspacio buscarTipoEspacio(Long tipoId) {
        return tipoEspacioRepository.findById(tipoId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro un tipo de espacio con el id " + tipoId
                ));
    }

    private Espacio buscarEspacioPorId(Long espacioId) {
        return espacioRepository.findById(espacioId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No se encontro un espacio con el id " + espacioId
                ));
    }

    private void aplicarCambios(Espacio espacio, EspacioAdminRequest espacioAdminRequest, TipoEspacio tipoEspacio) {
        espacio.setNombre(espacioAdminRequest.getNombre().trim());
        espacio.setCapacidad(espacioAdminRequest.getCapacidad());
        espacio.setPrecioPorHora(espacioAdminRequest.getPrecioPorHora());
        espacio.setActivo(espacioAdminRequest.getActivo());
        espacio.setTipo(tipoEspacio);
    }

    private boolean haySolapamiento(LocalTime inicioConsultado, LocalTime finConsultado,
                                    LocalTime inicioReservado, LocalTime finReservado) {
        return inicioConsultado.isBefore(finReservado) && finConsultado.isAfter(inicioReservado);
    }
}

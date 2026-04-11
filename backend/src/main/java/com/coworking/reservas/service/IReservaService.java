package com.coworking.reservas.service;

import java.time.LocalDate;

import com.coworking.reservas.dto.ReporteOcupacionListadoResponse;
import com.coworking.reservas.dto.ReservaAdminListadoResponse;
import com.coworking.reservas.dto.ReservaAdminResponse;
import com.coworking.reservas.dto.ReservaCreateRequest;
import com.coworking.reservas.dto.ReservaListadoResponse;
import com.coworking.reservas.dto.ReservaResponse;

public interface IReservaService {

    ReservaResponse crearReserva(Long usuarioId, ReservaCreateRequest reservaCreateRequest);

    void actualizarReservasFinalizadas();

    ReservaListadoResponse consultarReservasDelUsuario(Long usuarioId, int page, int size);

    ReservaAdminListadoResponse consultarTodasLasReservas(int page, int size);

    ReservaAdminResponse cancelarReservaComoAdministrador(Long reservaId);

    ReporteOcupacionListadoResponse generarReporteOcupacion(LocalDate fechaInicio, LocalDate fechaFin, String estado,
                                                           String modo, Long espacioId, int page, int size);

    ReservaResponse cancelarReserva(Long usuarioId, Long reservaId);
}

package com.coworking.reservas.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.coworking.reservas.dto.EspacioAdminRequest;
import com.coworking.reservas.dto.EspacioAdminResponse;
import com.coworking.reservas.dto.EspacioCatalogoResponse;
import com.coworking.reservas.dto.EspacioDisponibilidadDetalleResponse;
import com.coworking.reservas.dto.PageResponse;
import com.coworking.reservas.dto.TipoEspacioResponse;

public interface IEspacioService {

    EspacioCatalogoResponse consultarEspaciosDisponibles(int page, int size);

    PageResponse<EspacioAdminResponse> consultarEspaciosParaAdministracion(int page, int size);

    EspacioAdminResponse buscarEspacioParaAdministracion(Long espacioId);

    EspacioAdminResponse crearEspacio(EspacioAdminRequest espacioAdminRequest);

    EspacioAdminResponse actualizarEspacio(Long espacioId, EspacioAdminRequest espacioAdminRequest);

    EspacioAdminResponse eliminarEspacio(Long espacioId);

    List<TipoEspacioResponse> consultarTiposEspacio();

    EspacioDisponibilidadDetalleResponse consultarDisponibilidadPorFechaYHorario(Long espacioId, LocalDate fecha,
                                                                                 LocalTime horaInicio,
                                                                                 LocalTime horaFin);
}

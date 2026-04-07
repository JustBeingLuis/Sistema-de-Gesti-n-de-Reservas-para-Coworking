package com.coworking.reservas.service;

import java.util.List;

import com.coworking.reservas.dto.EspacioDisponibleResponse;

public interface IEspacioService {

    List<EspacioDisponibleResponse> consultarEspaciosDisponibles();
}

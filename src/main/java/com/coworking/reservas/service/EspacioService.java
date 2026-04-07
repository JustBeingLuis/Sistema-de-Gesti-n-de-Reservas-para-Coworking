package com.coworking.reservas.service;

import java.util.List;

import com.coworking.reservas.domain.Espacio;
import com.coworking.reservas.dto.EspacioDisponibleResponse;
import com.coworking.reservas.repository.EspacioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class EspacioService implements IEspacioService {

    @Autowired
    private EspacioRepository espacioRepository;

    @Override
    public List<EspacioDisponibleResponse> consultarEspaciosDisponibles() {
        return espacioRepository.findEspaciosDisponibles()
                .stream()
                .map(this::mapToResponse)
                .toList();
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
}

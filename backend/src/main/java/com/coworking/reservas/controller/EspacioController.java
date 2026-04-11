package com.coworking.reservas.controller;

import java.time.LocalDate;
import java.time.LocalTime;

import com.coworking.reservas.dto.EspacioCatalogoResponse;
import com.coworking.reservas.dto.EspacioDisponibilidadDetalleResponse;
import com.coworking.reservas.service.IEspacioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/espacios")
public class EspacioController {

    @Autowired
    private IEspacioService espacioService;

    @GetMapping("/disponibles")
    public ResponseEntity<EspacioCatalogoResponse> consultarDisponibles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        EspacioCatalogoResponse espacios = espacioService.consultarEspaciosDisponibles(page, size);
        return new ResponseEntity<>(espacios, HttpStatus.OK);
    }

    @GetMapping("/{espacioId}/disponibilidad")
    public ResponseEntity<EspacioDisponibilidadDetalleResponse> consultarDisponibilidadPorFechaYHorario(
            @PathVariable Long espacioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaFin) {
        EspacioDisponibilidadDetalleResponse disponibilidad = espacioService
                .consultarDisponibilidadPorFechaYHorario(espacioId, fecha, horaInicio, horaFin);

        return new ResponseEntity<>(disponibilidad, HttpStatus.OK);
    }
}

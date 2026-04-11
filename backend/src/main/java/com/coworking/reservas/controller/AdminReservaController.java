package com.coworking.reservas.controller;

import com.coworking.reservas.dto.ReservaAdminListadoResponse;
import com.coworking.reservas.dto.ReservaAdminResponse;
import com.coworking.reservas.service.IReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reservas")
public class AdminReservaController {

    @Autowired
    private IReservaService reservaService;

    @GetMapping
    public ResponseEntity<ReservaAdminListadoResponse> consultarTodasLasReservas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        ReservaAdminListadoResponse reservas = reservaService.consultarTodasLasReservas(page, size);
        return new ResponseEntity<>(reservas, HttpStatus.OK);
    }

    @PatchMapping("/{reservaId}/cancelar")
    public ResponseEntity<ReservaAdminResponse> cancelarReserva(@PathVariable Long reservaId) {
        ReservaAdminResponse reserva = reservaService.cancelarReservaComoAdministrador(reservaId);
        return new ResponseEntity<>(reserva, HttpStatus.OK);
    }
}

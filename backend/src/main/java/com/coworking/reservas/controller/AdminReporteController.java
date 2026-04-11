package com.coworking.reservas.controller;

import java.time.LocalDate;
import java.util.List;

import com.coworking.reservas.dto.EspacioReporteOptionResponse;
import com.coworking.reservas.dto.ReporteOcupacionListadoResponse;
import com.coworking.reservas.service.IEspacioService;
import com.coworking.reservas.service.IReservaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reportes/ocupacion")
public class AdminReporteController {

    @Autowired
    private IReservaService reservaService;

    @Autowired
    private IEspacioService espacioService;

    @GetMapping
    public ResponseEntity<ReporteOcupacionListadoResponse> generarReporteOcupacion(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            @RequestParam String estado,
            @RequestParam(defaultValue = "GENERAL") String modo,
            @RequestParam(required = false) Long espacioId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        ReporteOcupacionListadoResponse reporte = reservaService.generarReporteOcupacion(
                fechaInicio,
                fechaFin,
                estado,
                modo,
                espacioId,
                page,
                size
        );
        return new ResponseEntity<>(reporte, HttpStatus.OK);
    }

    @GetMapping("/espacios")
    public ResponseEntity<List<EspacioReporteOptionResponse>> consultarEspaciosParaReporte() {
        List<EspacioReporteOptionResponse> espacios = espacioService.consultarEspaciosParaReporte();
        return new ResponseEntity<>(espacios, HttpStatus.OK);
    }
}

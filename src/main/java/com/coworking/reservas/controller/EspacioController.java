package com.coworking.reservas.controller;

import java.util.List;

import com.coworking.reservas.dto.EspacioDisponibleResponse;
import com.coworking.reservas.service.IEspacioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/espacios")
public class EspacioController {

    @Autowired
    private IEspacioService espacioService;

    @GetMapping("/disponibles")
    public ResponseEntity<List<EspacioDisponibleResponse>> consultarDisponibles() {
        List<EspacioDisponibleResponse> espacios = espacioService.consultarEspaciosDisponibles();
        return new ResponseEntity<>(espacios, HttpStatus.OK);
    }
}

package com.coworking.reservas.controller;

import com.coworking.reservas.dto.UsuarioRegistroRequest;
import com.coworking.reservas.dto.UsuarioResponse;
import com.coworking.reservas.service.IUsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private IUsuarioService usuarioService;

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody UsuarioRegistroRequest usuarioRegistroRequest) {
        UsuarioResponse usuario = usuarioService.registrarUsuario(usuarioRegistroRequest);
        return new ResponseEntity<>(usuario, HttpStatus.CREATED);
    }
}

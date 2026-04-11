package com.coworking.reservas.controller;

import com.coworking.reservas.config.UsuarioDetails;
import com.coworking.reservas.dto.AuthLoginRequest;
import com.coworking.reservas.dto.AuthResponse;
import com.coworking.reservas.dto.UsuarioResponse;
import com.coworking.reservas.service.IAuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private IAuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthLoginRequest authLoginRequest) {
        AuthResponse authResponse = authService.autenticar(authLoginRequest);
        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    @GetMapping("/perfil")
    public ResponseEntity<UsuarioResponse> perfil(@AuthenticationPrincipal UsuarioDetails usuarioDetails) {
        UsuarioResponse usuario = authService.obtenerPerfilAutenticado(usuarioDetails.getCorreo());
        return new ResponseEntity<>(usuario, HttpStatus.OK);
    }
}

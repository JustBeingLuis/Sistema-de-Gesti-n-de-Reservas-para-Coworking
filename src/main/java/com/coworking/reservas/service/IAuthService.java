package com.coworking.reservas.service;

import com.coworking.reservas.dto.AuthLoginRequest;
import com.coworking.reservas.dto.AuthResponse;
import com.coworking.reservas.dto.UsuarioResponse;

public interface IAuthService {

    AuthResponse autenticar(AuthLoginRequest authLoginRequest);

    UsuarioResponse obtenerPerfilAutenticado(String correo);
}

package com.coworking.reservas.service;

import com.coworking.reservas.dto.UsuarioRegistroRequest;
import com.coworking.reservas.dto.UsuarioResponse;

public interface IUsuarioService {

    UsuarioResponse registrarUsuario(UsuarioRegistroRequest usuarioRegistroRequest);
}

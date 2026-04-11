package com.coworking.reservas.service;

import java.util.List;

import com.coworking.reservas.dto.PageResponse;
import com.coworking.reservas.dto.RolOptionResponse;
import com.coworking.reservas.dto.UsuarioAdminListadoResponse;
import com.coworking.reservas.dto.UsuarioAdminRequest;
import com.coworking.reservas.dto.UsuarioAdminResponse;
import com.coworking.reservas.dto.UsuarioRegistroRequest;
import com.coworking.reservas.dto.UsuarioResponse;

public interface IUsuarioService {

    UsuarioResponse registrarUsuario(UsuarioRegistroRequest usuarioRegistroRequest);

    UsuarioAdminListadoResponse consultarUsuariosParaAdministracion(int page, int size);

    UsuarioAdminResponse buscarUsuarioParaAdministracion(Long usuarioId);

    UsuarioAdminResponse actualizarUsuarioComoAdministrador(Long usuarioId, UsuarioAdminRequest usuarioAdminRequest,
                                                           String correoAdminAutenticado);

    UsuarioAdminResponse actualizarEstadoUsuario(Long usuarioId, Boolean activo, String correoAdminAutenticado);

    List<RolOptionResponse> consultarRolesParaAdministracion();
}

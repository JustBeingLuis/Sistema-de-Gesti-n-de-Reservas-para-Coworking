package com.coworking.reservas.controller;

import java.util.List;

import com.coworking.reservas.config.UsuarioDetails;
import com.coworking.reservas.dto.RolOptionResponse;
import com.coworking.reservas.dto.UsuarioAdminListadoResponse;
import com.coworking.reservas.dto.UsuarioAdminRequest;
import com.coworking.reservas.dto.UsuarioAdminResponse;
import com.coworking.reservas.service.IUsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUsuarioController {

    @Autowired
    private IUsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<UsuarioAdminListadoResponse> consultarUsuarios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        UsuarioAdminListadoResponse usuarios = usuarioService.consultarUsuariosParaAdministracion(page, size);
        return new ResponseEntity<>(usuarios, HttpStatus.OK);
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RolOptionResponse>> consultarRoles() {
        List<RolOptionResponse> roles = usuarioService.consultarRolesParaAdministracion();
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<UsuarioAdminResponse> consultarUsuario(@PathVariable Long usuarioId) {
        UsuarioAdminResponse usuario = usuarioService.buscarUsuarioParaAdministracion(usuarioId);
        return new ResponseEntity<>(usuario, HttpStatus.OK);
    }

    @PutMapping("/{usuarioId}")
    public ResponseEntity<UsuarioAdminResponse> actualizarUsuario(@PathVariable Long usuarioId,
                                                                  @Valid @RequestBody UsuarioAdminRequest request,
                                                                  @AuthenticationPrincipal UsuarioDetails usuarioDetails) {
        UsuarioAdminResponse usuario = usuarioService.actualizarUsuarioComoAdministrador(
                usuarioId,
                request,
                usuarioDetails.getCorreo()
        );
        return new ResponseEntity<>(usuario, HttpStatus.OK);
    }

    @PatchMapping("/{usuarioId}/estado")
    public ResponseEntity<UsuarioAdminResponse> actualizarEstado(@PathVariable Long usuarioId,
                                                                 @RequestParam Boolean activo,
                                                                 @AuthenticationPrincipal UsuarioDetails usuarioDetails) {
        UsuarioAdminResponse usuario = usuarioService.actualizarEstadoUsuario(
                usuarioId,
                activo,
                usuarioDetails.getCorreo()
        );
        return new ResponseEntity<>(usuario, HttpStatus.OK);
    }
}

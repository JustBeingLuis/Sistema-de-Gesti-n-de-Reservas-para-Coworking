package com.coworking.reservas.dto;

public class UsuarioAdminSummaryResponse {

    private Long totalUsuarios;
    private Long usuariosActivos;
    private Long administradores;

    public UsuarioAdminSummaryResponse() {
    }

    public UsuarioAdminSummaryResponse(Long totalUsuarios, Long usuariosActivos, Long administradores) {
        this.totalUsuarios = totalUsuarios;
        this.usuariosActivos = usuariosActivos;
        this.administradores = administradores;
    }

    public Long getTotalUsuarios() {
        return totalUsuarios;
    }

    public void setTotalUsuarios(Long totalUsuarios) {
        this.totalUsuarios = totalUsuarios;
    }

    public Long getUsuariosActivos() {
        return usuariosActivos;
    }

    public void setUsuariosActivos(Long usuariosActivos) {
        this.usuariosActivos = usuariosActivos;
    }

    public Long getAdministradores() {
        return administradores;
    }

    public void setAdministradores(Long administradores) {
        this.administradores = administradores;
    }
}

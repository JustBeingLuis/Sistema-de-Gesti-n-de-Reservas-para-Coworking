package com.coworking.reservas.dto;

public class UsuarioAdminRequest {

    private String nombre;
    private String correo;
    private Boolean activo;
    private Long rolId;

    public UsuarioAdminRequest() {
    }

    public UsuarioAdminRequest(String nombre, String correo, Boolean activo, Long rolId) {
        this.nombre = nombre;
        this.correo = correo;
        this.activo = activo;
        this.rolId = rolId;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Long getRolId() {
        return rolId;
    }

    public void setRolId(Long rolId) {
        this.rolId = rolId;
    }
}

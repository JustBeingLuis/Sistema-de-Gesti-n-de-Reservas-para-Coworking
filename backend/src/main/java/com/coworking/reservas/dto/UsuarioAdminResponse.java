package com.coworking.reservas.dto;

import java.time.LocalDateTime;

public class UsuarioAdminResponse {

    private Long id;
    private String nombre;
    private String correo;
    private Boolean activo;
    private Long rolId;
    private String rolNombre;
    private LocalDateTime fechaRegistro;

    public UsuarioAdminResponse() {
    }

    public UsuarioAdminResponse(Long id, String nombre, String correo, Boolean activo, Long rolId, String rolNombre,
                                LocalDateTime fechaRegistro) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.activo = activo;
        this.rolId = rolId;
        this.rolNombre = rolNombre;
        this.fechaRegistro = fechaRegistro;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getRolNombre() {
        return rolNombre;
    }

    public void setRolNombre(String rolNombre) {
        this.rolNombre = rolNombre;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}

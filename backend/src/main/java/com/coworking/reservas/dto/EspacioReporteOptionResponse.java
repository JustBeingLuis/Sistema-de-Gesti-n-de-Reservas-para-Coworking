package com.coworking.reservas.dto;

public class EspacioReporteOptionResponse {

    private Long id;
    private String nombre;
    private String tipoNombre;
    private Boolean activo;

    public EspacioReporteOptionResponse() {
    }

    public EspacioReporteOptionResponse(Long id, String nombre, String tipoNombre, Boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.tipoNombre = tipoNombre;
        this.activo = activo;
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

    public String getTipoNombre() {
        return tipoNombre;
    }

    public void setTipoNombre(String tipoNombre) {
        this.tipoNombre = tipoNombre;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
}

package com.coworking.reservas.dto;

import java.math.BigDecimal;

public class EspacioAdminResponse {

    private Long id;
    private String nombre;
    private Integer capacidad;
    private BigDecimal precioPorHora;
    private Boolean activo;
    private Long tipoId;
    private String tipoNombre;
    private String tipoDescripcion;

    public EspacioAdminResponse() {
    }

    public EspacioAdminResponse(Long id, String nombre, Integer capacidad, BigDecimal precioPorHora, Boolean activo,
                                Long tipoId, String tipoNombre, String tipoDescripcion) {
        this.id = id;
        this.nombre = nombre;
        this.capacidad = capacidad;
        this.precioPorHora = precioPorHora;
        this.activo = activo;
        this.tipoId = tipoId;
        this.tipoNombre = tipoNombre;
        this.tipoDescripcion = tipoDescripcion;
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

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public BigDecimal getPrecioPorHora() {
        return precioPorHora;
    }

    public void setPrecioPorHora(BigDecimal precioPorHora) {
        this.precioPorHora = precioPorHora;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Long getTipoId() {
        return tipoId;
    }

    public void setTipoId(Long tipoId) {
        this.tipoId = tipoId;
    }

    public String getTipoNombre() {
        return tipoNombre;
    }

    public void setTipoNombre(String tipoNombre) {
        this.tipoNombre = tipoNombre;
    }

    public String getTipoDescripcion() {
        return tipoDescripcion;
    }

    public void setTipoDescripcion(String tipoDescripcion) {
        this.tipoDescripcion = tipoDescripcion;
    }
}

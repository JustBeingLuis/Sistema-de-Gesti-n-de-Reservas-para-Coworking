package com.coworking.reservas.dto;

import java.math.BigDecimal;

public class EspacioDisponibleResponse {

    private Long id;
    private String nombre;
    private String tipo;
    private String descripcionTipo;
    private Integer capacidad;
    private BigDecimal precioPorHora;

    public EspacioDisponibleResponse() {
    }

    public EspacioDisponibleResponse(Long id, String nombre, String tipo, String descripcionTipo,
                                     Integer capacidad, BigDecimal precioPorHora) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.descripcionTipo = descripcionTipo;
        this.capacidad = capacidad;
        this.precioPorHora = precioPorHora;
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getDescripcionTipo() {
        return descripcionTipo;
    }

    public void setDescripcionTipo(String descripcionTipo) {
        this.descripcionTipo = descripcionTipo;
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
}

package com.coworking.reservas.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class EspacioAdminRequest {

    @NotBlank(message = "El nombre del espacio es obligatorio")
    @Size(max = 100, message = "El nombre del espacio no puede superar los 100 caracteres")
    private String nombre;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad debe ser mayor o igual a 1")
    private Integer capacidad;

    @NotNull(message = "El precio por hora es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio por hora debe ser mayor que cero")
    private BigDecimal precioPorHora;

    @NotNull(message = "Debes indicar si el espacio esta activo")
    private Boolean activo;

    @NotNull(message = "Debes seleccionar un tipo de espacio")
    private Long tipoId;

    public EspacioAdminRequest() {
    }

    public EspacioAdminRequest(String nombre, Integer capacidad, BigDecimal precioPorHora, Boolean activo,
                               Long tipoId) {
        this.nombre = nombre;
        this.capacidad = capacidad;
        this.precioPorHora = precioPorHora;
        this.activo = activo;
        this.tipoId = tipoId;
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
}

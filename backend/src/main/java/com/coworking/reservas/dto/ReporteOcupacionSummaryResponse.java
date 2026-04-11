package com.coworking.reservas.dto;

import java.time.LocalDate;

public class ReporteOcupacionSummaryResponse {

    private String modo;
    private String estado;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private Long espacioId;
    private String nombreEspacio;
    private Long totalReservas;
    private Long espaciosIncluidos;

    public ReporteOcupacionSummaryResponse() {
    }

    public ReporteOcupacionSummaryResponse(String modo, String estado, LocalDate fechaInicio, LocalDate fechaFin,
                                           Long espacioId, String nombreEspacio, Long totalReservas,
                                           Long espaciosIncluidos) {
        this.modo = modo;
        this.estado = estado;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.espacioId = espacioId;
        this.nombreEspacio = nombreEspacio;
        this.totalReservas = totalReservas;
        this.espaciosIncluidos = espaciosIncluidos;
    }

    public String getModo() {
        return modo;
    }

    public void setModo(String modo) {
        this.modo = modo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Long getEspacioId() {
        return espacioId;
    }

    public void setEspacioId(Long espacioId) {
        this.espacioId = espacioId;
    }

    public String getNombreEspacio() {
        return nombreEspacio;
    }

    public void setNombreEspacio(String nombreEspacio) {
        this.nombreEspacio = nombreEspacio;
    }

    public Long getTotalReservas() {
        return totalReservas;
    }

    public void setTotalReservas(Long totalReservas) {
        this.totalReservas = totalReservas;
    }

    public Long getEspaciosIncluidos() {
        return espaciosIncluidos;
    }

    public void setEspaciosIncluidos(Long espaciosIncluidos) {
        this.espaciosIncluidos = espaciosIncluidos;
    }
}

package com.coworking.reservas.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ReservaResponse {

    private Long id;
    private Long espacioId;
    private String nombreEspacio;
    private String tipoEspacio;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private LocalDateTime fechaCreacion;
    private String estado;
    private Boolean puedeCancelarse;
    private String motivoNoCancelable;

    public ReservaResponse() {
    }

    public ReservaResponse(Long id, Long espacioId, String nombreEspacio, String tipoEspacio, LocalDate fecha,
                           LocalTime horaInicio, LocalTime horaFin, LocalDateTime fechaCreacion, String estado,
                           Boolean puedeCancelarse, String motivoNoCancelable) {
        this.id = id;
        this.espacioId = espacioId;
        this.nombreEspacio = nombreEspacio;
        this.tipoEspacio = tipoEspacio;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
        this.puedeCancelarse = puedeCancelarse;
        this.motivoNoCancelable = motivoNoCancelable;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getTipoEspacio() {
        return tipoEspacio;
    }

    public void setTipoEspacio(String tipoEspacio) {
        this.tipoEspacio = tipoEspacio;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Boolean getPuedeCancelarse() {
        return puedeCancelarse;
    }

    public void setPuedeCancelarse(Boolean puedeCancelarse) {
        this.puedeCancelarse = puedeCancelarse;
    }

    public String getMotivoNoCancelable() {
        return motivoNoCancelable;
    }

    public void setMotivoNoCancelable(String motivoNoCancelable) {
        this.motivoNoCancelable = motivoNoCancelable;
    }
}

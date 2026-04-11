package com.coworking.reservas.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotNull;

public class ReservaCreateRequest {

    @NotNull(message = "Debes seleccionar un espacio.")
    private Long espacioId;

    @NotNull(message = "Debes indicar la fecha de la reserva.")
    private LocalDate fecha;

    @NotNull(message = "Debes indicar la hora de inicio.")
    private LocalTime horaInicio;

    @NotNull(message = "Debes indicar la hora de fin.")
    private LocalTime horaFin;

    public ReservaCreateRequest() {
    }

    public ReservaCreateRequest(Long espacioId, LocalDate fecha, LocalTime horaInicio, LocalTime horaFin) {
        this.espacioId = espacioId;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    public Long getEspacioId() {
        return espacioId;
    }

    public void setEspacioId(Long espacioId) {
        this.espacioId = espacioId;
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
}

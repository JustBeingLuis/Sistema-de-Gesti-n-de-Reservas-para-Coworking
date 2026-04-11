package com.coworking.reservas.dto;

import java.time.LocalTime;

public class HorarioOcupadoResponse {

    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String estado;

    public HorarioOcupadoResponse() {
    }

    public HorarioOcupadoResponse(LocalTime horaInicio, LocalTime horaFin, String estado) {
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.estado = estado;
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

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }
}

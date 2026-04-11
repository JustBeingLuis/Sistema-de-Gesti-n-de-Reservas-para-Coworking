package com.coworking.reservas.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class ReporteOcupacionItemResponse {

    private Long reservaId;
    private Long espacioId;
    private String nombreEspacio;
    private String tipoEspacio;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioCorreo;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private LocalDateTime fechaCreacion;
    private String estado;
    private Long duracionMinutos;

    public ReporteOcupacionItemResponse() {
    }

    public ReporteOcupacionItemResponse(Long reservaId, Long espacioId, String nombreEspacio, String tipoEspacio,
                                        Long usuarioId, String usuarioNombre, String usuarioCorreo, LocalDate fecha,
                                        LocalTime horaInicio, LocalTime horaFin, LocalDateTime fechaCreacion,
                                        String estado, Long duracionMinutos) {
        this.reservaId = reservaId;
        this.espacioId = espacioId;
        this.nombreEspacio = nombreEspacio;
        this.tipoEspacio = tipoEspacio;
        this.usuarioId = usuarioId;
        this.usuarioNombre = usuarioNombre;
        this.usuarioCorreo = usuarioCorreo;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.fechaCreacion = fechaCreacion;
        this.estado = estado;
        this.duracionMinutos = duracionMinutos;
    }

    public Long getReservaId() {
        return reservaId;
    }

    public void setReservaId(Long reservaId) {
        this.reservaId = reservaId;
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

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public String getUsuarioNombre() {
        return usuarioNombre;
    }

    public void setUsuarioNombre(String usuarioNombre) {
        this.usuarioNombre = usuarioNombre;
    }

    public String getUsuarioCorreo() {
        return usuarioCorreo;
    }

    public void setUsuarioCorreo(String usuarioCorreo) {
        this.usuarioCorreo = usuarioCorreo;
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

    public Long getDuracionMinutos() {
        return duracionMinutos;
    }

    public void setDuracionMinutos(Long duracionMinutos) {
        this.duracionMinutos = duracionMinutos;
    }
}

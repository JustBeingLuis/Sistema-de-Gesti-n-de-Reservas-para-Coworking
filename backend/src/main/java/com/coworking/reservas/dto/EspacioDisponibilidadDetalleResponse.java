package com.coworking.reservas.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class EspacioDisponibilidadDetalleResponse {

    private Long espacioId;
    private String nombreEspacio;
    private String tipoEspacio;
    private String descripcionTipo;
    private Integer capacidad;
    private BigDecimal precioPorHora;
    private LocalDate fecha;
    private LocalTime horaInicioConsulta;
    private LocalTime horaFinConsulta;
    private Boolean rangoConsultadoDisponible;
    private String mensajeDisponibilidad;
    private Integer totalHorariosOcupados;
    private List<HorarioOcupadoResponse> horariosOcupados;

    public EspacioDisponibilidadDetalleResponse() {
    }

    public EspacioDisponibilidadDetalleResponse(Long espacioId, String nombreEspacio, String tipoEspacio,
                                                String descripcionTipo, Integer capacidad, BigDecimal precioPorHora,
                                                LocalDate fecha, LocalTime horaInicioConsulta,
                                                LocalTime horaFinConsulta, Boolean rangoConsultadoDisponible,
                                                String mensajeDisponibilidad, Integer totalHorariosOcupados,
                                                List<HorarioOcupadoResponse> horariosOcupados) {
        this.espacioId = espacioId;
        this.nombreEspacio = nombreEspacio;
        this.tipoEspacio = tipoEspacio;
        this.descripcionTipo = descripcionTipo;
        this.capacidad = capacidad;
        this.precioPorHora = precioPorHora;
        this.fecha = fecha;
        this.horaInicioConsulta = horaInicioConsulta;
        this.horaFinConsulta = horaFinConsulta;
        this.rangoConsultadoDisponible = rangoConsultadoDisponible;
        this.mensajeDisponibilidad = mensajeDisponibilidad;
        this.totalHorariosOcupados = totalHorariosOcupados;
        this.horariosOcupados = horariosOcupados;
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

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicioConsulta() {
        return horaInicioConsulta;
    }

    public void setHoraInicioConsulta(LocalTime horaInicioConsulta) {
        this.horaInicioConsulta = horaInicioConsulta;
    }

    public LocalTime getHoraFinConsulta() {
        return horaFinConsulta;
    }

    public void setHoraFinConsulta(LocalTime horaFinConsulta) {
        this.horaFinConsulta = horaFinConsulta;
    }

    public Boolean getRangoConsultadoDisponible() {
        return rangoConsultadoDisponible;
    }

    public void setRangoConsultadoDisponible(Boolean rangoConsultadoDisponible) {
        this.rangoConsultadoDisponible = rangoConsultadoDisponible;
    }

    public String getMensajeDisponibilidad() {
        return mensajeDisponibilidad;
    }

    public void setMensajeDisponibilidad(String mensajeDisponibilidad) {
        this.mensajeDisponibilidad = mensajeDisponibilidad;
    }

    public Integer getTotalHorariosOcupados() {
        return totalHorariosOcupados;
    }

    public void setTotalHorariosOcupados(Integer totalHorariosOcupados) {
        this.totalHorariosOcupados = totalHorariosOcupados;
    }

    public List<HorarioOcupadoResponse> getHorariosOcupados() {
        return horariosOcupados;
    }

    public void setHorariosOcupados(List<HorarioOcupadoResponse> horariosOcupados) {
        this.horariosOcupados = horariosOcupados;
    }
}

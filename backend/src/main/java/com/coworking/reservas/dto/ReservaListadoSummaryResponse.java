package com.coworking.reservas.dto;

public class ReservaListadoSummaryResponse {

    private long totalReservas;
    private long reservasActivas;
    private long cancelablesHoy;

    public ReservaListadoSummaryResponse() {
    }

    public ReservaListadoSummaryResponse(long totalReservas, long reservasActivas, long cancelablesHoy) {
        this.totalReservas = totalReservas;
        this.reservasActivas = reservasActivas;
        this.cancelablesHoy = cancelablesHoy;
    }

    public long getTotalReservas() {
        return totalReservas;
    }

    public void setTotalReservas(long totalReservas) {
        this.totalReservas = totalReservas;
    }

    public long getReservasActivas() {
        return reservasActivas;
    }

    public void setReservasActivas(long reservasActivas) {
        this.reservasActivas = reservasActivas;
    }

    public long getCancelablesHoy() {
        return cancelablesHoy;
    }

    public void setCancelablesHoy(long cancelablesHoy) {
        this.cancelablesHoy = cancelablesHoy;
    }
}

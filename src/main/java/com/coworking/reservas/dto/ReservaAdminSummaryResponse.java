package com.coworking.reservas.dto;

public class ReservaAdminSummaryResponse {

    private long totalReservas;
    private long reservasActivas;
    private long reservasCanceladas;

    public ReservaAdminSummaryResponse() {
    }

    public ReservaAdminSummaryResponse(long totalReservas, long reservasActivas, long reservasCanceladas) {
        this.totalReservas = totalReservas;
        this.reservasActivas = reservasActivas;
        this.reservasCanceladas = reservasCanceladas;
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

    public long getReservasCanceladas() {
        return reservasCanceladas;
    }

    public void setReservasCanceladas(long reservasCanceladas) {
        this.reservasCanceladas = reservasCanceladas;
    }
}

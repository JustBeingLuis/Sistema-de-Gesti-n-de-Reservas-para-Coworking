package com.coworking.reservas.dto;

public class EspacioCatalogSummaryResponse {

    private long totalEspacios;
    private long capacidadAcumulada;
    private long tiposDisponibles;

    public EspacioCatalogSummaryResponse() {
    }

    public EspacioCatalogSummaryResponse(long totalEspacios, long capacidadAcumulada, long tiposDisponibles) {
        this.totalEspacios = totalEspacios;
        this.capacidadAcumulada = capacidadAcumulada;
        this.tiposDisponibles = tiposDisponibles;
    }

    public long getTotalEspacios() {
        return totalEspacios;
    }

    public void setTotalEspacios(long totalEspacios) {
        this.totalEspacios = totalEspacios;
    }

    public long getCapacidadAcumulada() {
        return capacidadAcumulada;
    }

    public void setCapacidadAcumulada(long capacidadAcumulada) {
        this.capacidadAcumulada = capacidadAcumulada;
    }

    public long getTiposDisponibles() {
        return tiposDisponibles;
    }

    public void setTiposDisponibles(long tiposDisponibles) {
        this.tiposDisponibles = tiposDisponibles;
    }
}

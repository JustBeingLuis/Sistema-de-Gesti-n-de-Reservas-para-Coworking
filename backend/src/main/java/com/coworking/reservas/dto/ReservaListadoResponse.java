package com.coworking.reservas.dto;

public class ReservaListadoResponse {

    private PageResponse<ReservaResponse> pagina;
    private ReservaListadoSummaryResponse resumen;

    public ReservaListadoResponse() {
    }

    public ReservaListadoResponse(PageResponse<ReservaResponse> pagina, ReservaListadoSummaryResponse resumen) {
        this.pagina = pagina;
        this.resumen = resumen;
    }

    public PageResponse<ReservaResponse> getPagina() {
        return pagina;
    }

    public void setPagina(PageResponse<ReservaResponse> pagina) {
        this.pagina = pagina;
    }

    public ReservaListadoSummaryResponse getResumen() {
        return resumen;
    }

    public void setResumen(ReservaListadoSummaryResponse resumen) {
        this.resumen = resumen;
    }
}

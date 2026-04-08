package com.coworking.reservas.dto;

public class ReservaAdminListadoResponse {

    private PageResponse<ReservaAdminResponse> pagina;
    private ReservaAdminSummaryResponse resumen;

    public ReservaAdminListadoResponse() {
    }

    public ReservaAdminListadoResponse(PageResponse<ReservaAdminResponse> pagina,
                                       ReservaAdminSummaryResponse resumen) {
        this.pagina = pagina;
        this.resumen = resumen;
    }

    public PageResponse<ReservaAdminResponse> getPagina() {
        return pagina;
    }

    public void setPagina(PageResponse<ReservaAdminResponse> pagina) {
        this.pagina = pagina;
    }

    public ReservaAdminSummaryResponse getResumen() {
        return resumen;
    }

    public void setResumen(ReservaAdminSummaryResponse resumen) {
        this.resumen = resumen;
    }
}

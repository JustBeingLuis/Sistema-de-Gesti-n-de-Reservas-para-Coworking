package com.coworking.reservas.dto;

public class ReporteOcupacionListadoResponse {

    private PageResponse<ReporteOcupacionItemResponse> pagina;
    private ReporteOcupacionSummaryResponse resumen;

    public ReporteOcupacionListadoResponse() {
    }

    public ReporteOcupacionListadoResponse(PageResponse<ReporteOcupacionItemResponse> pagina,
                                           ReporteOcupacionSummaryResponse resumen) {
        this.pagina = pagina;
        this.resumen = resumen;
    }

    public PageResponse<ReporteOcupacionItemResponse> getPagina() {
        return pagina;
    }

    public void setPagina(PageResponse<ReporteOcupacionItemResponse> pagina) {
        this.pagina = pagina;
    }

    public ReporteOcupacionSummaryResponse getResumen() {
        return resumen;
    }

    public void setResumen(ReporteOcupacionSummaryResponse resumen) {
        this.resumen = resumen;
    }
}

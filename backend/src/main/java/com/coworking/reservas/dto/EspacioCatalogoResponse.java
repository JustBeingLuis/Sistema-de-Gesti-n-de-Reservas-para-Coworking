package com.coworking.reservas.dto;

public class EspacioCatalogoResponse {

    private PageResponse<EspacioDisponibleResponse> pagina;
    private EspacioCatalogSummaryResponse resumen;

    public EspacioCatalogoResponse() {
    }

    public EspacioCatalogoResponse(PageResponse<EspacioDisponibleResponse> pagina,
                                   EspacioCatalogSummaryResponse resumen) {
        this.pagina = pagina;
        this.resumen = resumen;
    }

    public PageResponse<EspacioDisponibleResponse> getPagina() {
        return pagina;
    }

    public void setPagina(PageResponse<EspacioDisponibleResponse> pagina) {
        this.pagina = pagina;
    }

    public EspacioCatalogSummaryResponse getResumen() {
        return resumen;
    }

    public void setResumen(EspacioCatalogSummaryResponse resumen) {
        this.resumen = resumen;
    }
}

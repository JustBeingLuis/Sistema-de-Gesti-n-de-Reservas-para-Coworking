package com.coworking.reservas.dto;

public class UsuarioAdminListadoResponse {

    private PageResponse<UsuarioAdminResponse> pagina;
    private UsuarioAdminSummaryResponse resumen;

    public UsuarioAdminListadoResponse() {
    }

    public UsuarioAdminListadoResponse(PageResponse<UsuarioAdminResponse> pagina,
                                       UsuarioAdminSummaryResponse resumen) {
        this.pagina = pagina;
        this.resumen = resumen;
    }

    public PageResponse<UsuarioAdminResponse> getPagina() {
        return pagina;
    }

    public void setPagina(PageResponse<UsuarioAdminResponse> pagina) {
        this.pagina = pagina;
    }

    public UsuarioAdminSummaryResponse getResumen() {
        return resumen;
    }

    public void setResumen(UsuarioAdminSummaryResponse resumen) {
        this.resumen = resumen;
    }
}

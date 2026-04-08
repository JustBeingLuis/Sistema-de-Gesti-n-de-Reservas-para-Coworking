package com.coworking.reservas.controller;

import java.util.List;

import com.coworking.reservas.dto.EspacioAdminRequest;
import com.coworking.reservas.dto.EspacioAdminResponse;
import com.coworking.reservas.dto.PageResponse;
import com.coworking.reservas.dto.TipoEspacioResponse;
import com.coworking.reservas.service.IEspacioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/espacios")
public class AdminEspacioController {

    @Autowired
    private IEspacioService espacioService;

    @GetMapping
    public ResponseEntity<PageResponse<EspacioAdminResponse>> consultarEspacios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        PageResponse<EspacioAdminResponse> espacios = espacioService.consultarEspaciosParaAdministracion(page, size);
        return new ResponseEntity<>(espacios, HttpStatus.OK);
    }

    @GetMapping("/tipos-espacio")
    public ResponseEntity<List<TipoEspacioResponse>> consultarTiposEspacio() {
        List<TipoEspacioResponse> tipos = espacioService.consultarTiposEspacio();
        return new ResponseEntity<>(tipos, HttpStatus.OK);
    }

    @GetMapping("/{espacioId}")
    public ResponseEntity<EspacioAdminResponse> consultarEspacio(@PathVariable Long espacioId) {
        EspacioAdminResponse espacio = espacioService.buscarEspacioParaAdministracion(espacioId);
        return new ResponseEntity<>(espacio, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<EspacioAdminResponse> crearEspacio(@Valid @RequestBody EspacioAdminRequest request) {
        EspacioAdminResponse espacio = espacioService.crearEspacio(request);
        return new ResponseEntity<>(espacio, HttpStatus.CREATED);
    }

    @PutMapping("/{espacioId}")
    public ResponseEntity<EspacioAdminResponse> actualizarEspacio(@PathVariable Long espacioId,
                                                                  @Valid @RequestBody EspacioAdminRequest request) {
        EspacioAdminResponse espacio = espacioService.actualizarEspacio(espacioId, request);
        return new ResponseEntity<>(espacio, HttpStatus.OK);
    }

    @DeleteMapping("/{espacioId}")
    public ResponseEntity<EspacioAdminResponse> eliminarEspacio(@PathVariable Long espacioId) {
        EspacioAdminResponse espacio = espacioService.eliminarEspacio(espacioId);
        return new ResponseEntity<>(espacio, HttpStatus.OK);
    }
}

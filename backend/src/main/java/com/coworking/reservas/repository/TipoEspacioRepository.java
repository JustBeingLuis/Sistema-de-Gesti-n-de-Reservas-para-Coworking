package com.coworking.reservas.repository;

import java.util.List;

import com.coworking.reservas.domain.TipoEspacio;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TipoEspacioRepository extends JpaRepository<TipoEspacio, Long> {

    List<TipoEspacio> findAllByOrderByNombreAsc();
}

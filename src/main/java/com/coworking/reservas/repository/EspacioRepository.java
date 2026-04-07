package com.coworking.reservas.repository;

import java.util.List;

import com.coworking.reservas.domain.Espacio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EspacioRepository extends JpaRepository<Espacio, Long> {

    @Query("""
            select e
            from Espacio e
            join fetch e.tipo t
            where e.activo = true
            order by t.nombre asc, e.nombre asc
            """)
    List<Espacio> findEspaciosDisponibles();
}

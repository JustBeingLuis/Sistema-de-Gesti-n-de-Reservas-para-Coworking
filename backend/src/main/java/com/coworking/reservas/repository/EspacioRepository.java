package com.coworking.reservas.repository;

import java.util.List;
import java.util.Optional;

import com.coworking.reservas.domain.Espacio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EspacioRepository extends JpaRepository<Espacio, Long> {

    @EntityGraph(attributePaths = "tipo")
    Page<Espacio> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = "tipo")
    Page<Espacio> findByActivoTrue(Pageable pageable);

    @EntityGraph(attributePaths = "tipo")
    List<Espacio> findAllByOrderByNombreAsc();

    @Query("""
            select coalesce(sum(e.capacidad), 0)
            from Espacio e
            where e.activo = true
            """)
    Long sumCapacidadByActivoTrue();

    @Query("""
            select count(distinct e.tipo.id)
            from Espacio e
            where e.activo = true
            """)
    Long countTiposDisponiblesActivos();

    Optional<Espacio> findByIdAndActivoTrue(Long id);
}

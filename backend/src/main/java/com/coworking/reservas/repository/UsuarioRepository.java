package com.coworking.reservas.repository;

import java.util.Optional;

import com.coworking.reservas.domain.Usuario;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    boolean existsByCorreoIgnoreCase(String correo);

    Optional<Usuario> findByCorreoIgnoreCase(String correo);

    @EntityGraph(attributePaths = "rol")
    Page<Usuario> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = "rol")
    Optional<Usuario> findDetalleById(Long id);

    long countByActivoTrue();

    long countByRolNombreIgnoreCase(String nombreRol);
}

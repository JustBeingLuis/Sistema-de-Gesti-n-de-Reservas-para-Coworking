package com.coworking.reservas.repository;

import java.util.List;
import java.util.Optional;

import com.coworking.reservas.domain.Rol;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolRepository extends JpaRepository<Rol, Long> {

    Optional<Rol> findByNombreIgnoreCase(String nombre);

    List<Rol> findAllByOrderByNombreAsc();
}

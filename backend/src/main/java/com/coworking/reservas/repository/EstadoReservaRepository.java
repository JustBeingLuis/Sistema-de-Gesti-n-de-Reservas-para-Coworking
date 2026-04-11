package com.coworking.reservas.repository;

import java.util.Optional;

import com.coworking.reservas.domain.EstadoReserva;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstadoReservaRepository extends JpaRepository<EstadoReserva, Long> {

    Optional<EstadoReserva> findByNombreIgnoreCase(String nombre);
}

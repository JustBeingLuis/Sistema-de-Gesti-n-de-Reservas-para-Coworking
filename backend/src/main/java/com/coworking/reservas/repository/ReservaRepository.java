package com.coworking.reservas.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import com.coworking.reservas.domain.EstadoReserva;
import com.coworking.reservas.domain.Reserva;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @EntityGraph(attributePaths = {"usuario", "espacio", "espacio.tipo", "estado"})
    Page<Reserva> findAllBy(Pageable pageable);

    @EntityGraph(attributePaths = {"usuario", "espacio", "espacio.tipo", "estado"})
    Page<Reserva> findByEstadoNombreIgnoreCaseAndFechaBetween(String estado, LocalDate fechaInicio,
                                                              LocalDate fechaFin, Pageable pageable);

    @EntityGraph(attributePaths = {"usuario", "espacio", "espacio.tipo", "estado"})
    Page<Reserva> findByEspacioIdAndEstadoNombreIgnoreCaseAndFechaBetween(Long espacioId, String estado,
                                                                          LocalDate fechaInicio, LocalDate fechaFin,
                                                                          Pageable pageable);

    long countByEstadoNombreIgnoreCaseAndFechaBetween(String estado, LocalDate fechaInicio, LocalDate fechaFin);

    long countByEspacioIdAndEstadoNombreIgnoreCaseAndFechaBetween(Long espacioId, String estado, LocalDate fechaInicio,
                                                                  LocalDate fechaFin);

    @Query("""
            select count(distinct r.espacio.id)
            from Reserva r
            join r.estado er
            where upper(er.nombre) = upper(:estado)
              and r.fecha between :fechaInicio and :fechaFin
            """)
    long countEspaciosUnicosByEstadoYFecha(@Param("estado") String estado,
                                           @Param("fechaInicio") LocalDate fechaInicio,
                                           @Param("fechaFin") LocalDate fechaFin);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update Reserva r
            set r.estado = :estadoFinalizada
            where r.estado.id <> :estadoCanceladaId
              and r.estado.id <> :estadoFinalizadaId
              and (r.fecha < :fechaActual or (r.fecha = :fechaActual and r.horaFin <= :horaActual))
            """)
    int marcarReservasComoFinalizadas(@Param("estadoFinalizada") EstadoReserva estadoFinalizada,
                                      @Param("estadoCanceladaId") Long estadoCanceladaId,
                                      @Param("estadoFinalizadaId") Long estadoFinalizadaId,
                                      @Param("fechaActual") LocalDate fechaActual,
                                      @Param("horaActual") LocalTime horaActual);

    @Query("""
            select r
            from Reserva r
            join fetch r.estado er
            where r.espacio.id = :espacioId
              and r.fecha = :fecha
              and upper(er.nombre) <> 'CANCELADA'
            order by r.horaInicio asc
            """)
    List<Reserva> findHorariosOcupadosByEspacioAndFecha(@Param("espacioId") Long espacioId,
                                                        @Param("fecha") LocalDate fecha);

    @Query("""
            select r
            from Reserva r
            join fetch r.estado er
            where r.espacio.id = :espacioId
              and r.fecha = :fecha
              and upper(er.nombre) <> 'CANCELADA'
              and :horaInicio < r.horaFin
              and :horaFin > r.horaInicio
            """)
    List<Reserva> findConflictosByEspacioFechaYHorario(@Param("espacioId") Long espacioId,
                                                       @Param("fecha") LocalDate fecha,
                                                       @Param("horaInicio") LocalTime horaInicio,
                                                       @Param("horaFin") LocalTime horaFin);

    @EntityGraph(attributePaths = {"espacio", "espacio.tipo", "estado"})
    Page<Reserva> findByUsuarioId(Long usuarioId, Pageable pageable);

    @Query("""
            select count(r)
            from Reserva r
            join r.estado er
            where r.usuario.id = :usuarioId
              and upper(er.nombre) not in ('CANCELADA', 'FINALIZADA')
            """)
    long countReservasActivasByUsuarioId(@Param("usuarioId") Long usuarioId);

    @Query("""
            select count(r)
            from Reserva r
            join r.estado er
            where r.usuario.id = :usuarioId
              and upper(er.nombre) not in ('CANCELADA', 'FINALIZADA')
              and (r.fecha > :fechaLimite or (r.fecha = :fechaLimite and r.horaInicio >= :horaLimite))
            """)
    long countReservasCancelablesByUsuarioId(@Param("usuarioId") Long usuarioId,
                                             @Param("fechaLimite") LocalDate fechaLimite,
                                             @Param("horaLimite") LocalTime horaLimite);

    @Query("""
            select count(r)
            from Reserva r
            join r.estado er
            where upper(er.nombre) not in ('CANCELADA', 'FINALIZADA')
            """)
    long countReservasActivas();

    @Query("""
            select count(r)
            from Reserva r
            join r.estado er
            where upper(er.nombre) = 'CANCELADA'
            """)
    long countReservasCanceladas();

    @Query("""
            select r
            from Reserva r
            join fetch r.espacio e
            join fetch e.tipo t
            join fetch r.estado er
            join fetch r.usuario u
            where r.id = :reservaId
            """)
    Optional<Reserva> findDetalleById(@Param("reservaId") Long reservaId);
}

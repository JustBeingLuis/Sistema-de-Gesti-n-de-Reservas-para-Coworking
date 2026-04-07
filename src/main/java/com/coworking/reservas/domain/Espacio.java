package com.coworking.reservas.domain;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "espacios")
public class Espacio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "capacidad", nullable = false)
    private Integer capacidad;

    @Column(name = "precio_por_hora", nullable = false, precision = 10, scale = 2)
    private BigDecimal precioPorHora;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tipo_id", nullable = false)
    private TipoEspacio tipo;

    public Espacio() {
    }

    public Espacio(Long id, String nombre, Integer capacidad, BigDecimal precioPorHora,
                   Boolean activo, TipoEspacio tipo) {
        this.id = id;
        this.nombre = nombre;
        this.capacidad = capacidad;
        this.precioPorHora = precioPorHora;
        this.activo = activo;
        this.tipo = tipo;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(Integer capacidad) {
        this.capacidad = capacidad;
    }

    public BigDecimal getPrecioPorHora() {
        return precioPorHora;
    }

    public void setPrecioPorHora(BigDecimal precioPorHora) {
        this.precioPorHora = precioPorHora;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public TipoEspacio getTipo() {
        return tipo;
    }

    public void setTipo(TipoEspacio tipo) {
        this.tipo = tipo;
    }
}

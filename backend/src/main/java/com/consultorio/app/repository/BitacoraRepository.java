package com.consultorio.app.repository;

import com.consultorio.app.model.Bitacora;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio JPA para la entidad Bitacora.
 * Solo permite insercion; no se exponen metodos de actualizacion ni borrado en la API.
 */
@Repository
public interface BitacoraRepository extends JpaRepository<Bitacora, Long> {
}

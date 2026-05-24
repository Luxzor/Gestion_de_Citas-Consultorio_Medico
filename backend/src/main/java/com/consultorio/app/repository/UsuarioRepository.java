package com.consultorio.app.repository;

import com.consultorio.app.model.Usuario;
import com.consultorio.app.model.enums.EstadoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Repositorio JPA para la entidad Usuario.
 * Todas las consultas usan parametros vinculados (no concatenacion SQL).
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    boolean existsByNombreUsuario(String nombreUsuario);

    Optional<Usuario> findByNombreUsuarioAndEstado(String nombreUsuario, EstadoUsuario estado);
}

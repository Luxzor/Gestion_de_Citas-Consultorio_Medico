package com.consultorio.app.service;

import com.consultorio.app.model.Bitacora;
import com.consultorio.app.model.Usuario;
import com.consultorio.app.repository.BitacoraRepository;
import com.consultorio.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Servicio de auditoria. Registra todas las operaciones criticas
 * de forma asincrona para no impactar el tiempo de respuesta de la API.
 * La bitacora es de solo insercion: no se expone ningun metodo de borrado.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BitacoraService {

    private final BitacoraRepository bitacoraRepository;
    private final UsuarioRepository  usuarioRepository;

    /** Registra una accion de auditoria de forma asincrona. */
    @Async
    public void registrar(Long idUsuario, String accion, String detalle, String ip) {
        try {
            Usuario usuario = (idUsuario != null)
                    ? usuarioRepository.findById(idUsuario).orElse(null)
                    : null;

            Bitacora entrada = Bitacora.builder()
                    .usuario(usuario)
                    .accion(accion)
                    .detalle(detalle)
                    .ip(ip)
                    .build();
            bitacoraRepository.save(entrada);
        } catch (Exception e) {
            log.error("Error al registrar en bitacora: {}", e.getMessage());
        }
    }
}

package com.consultorio.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Habilita el procesamiento asincrono para el servicio de bitacora.
 * Los registros de auditoria se escriben en un hilo separado para no
 * impactar el tiempo de respuesta de los endpoints principales.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}

package com.consultorio.app.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Servicio de control de concurrencia para la reserva de citas medicas.
 *
 * Implementa el algoritmo Redlock sobre Redis para garantizar la exclusion
 * mutua distribuida. La clave de bloqueo identifica univocamente la
 * combinacion medico + fecha + hora_inicio, de modo que dos solicitudes
 * concurrentes sobre el mismo horario compiten por exactamente el mismo
 * recurso Redis.
 *
 * Si Redis no esta disponible, el servicio captura la excepcion y permite
 * continuar; la restriccion UNIQUE de la BD actua como segunda linea de defensa.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConcurrenciaService {

    private final RedisTemplate<String, String> redisTemplate;

    @Value("${app.lock.ttl-ms:5000}")
    private long ttlMs;

    @Value("${app.lock.wait-ms:100}")
    private long waitMs;

    @Value("${app.lock.retry-attempts:3}")
    private int retryAttempts;

    /**
     * Construye la clave de bloqueo para un horario especifico.
     * Ejemplo: "lock:medico:1:fecha:2026-05-25:hora:10:00"
     */
    public String construirClave(Long idMedico, LocalDate fecha, LocalTime horaInicio) {
        return String.format("lock:medico:%d:fecha:%s:hora:%s",
                idMedico, fecha.toString(), horaInicio.toString());
    }

    /**
     * Intenta adquirir el bloqueo distribuido en Redis con reintentos.
     *
     * @param clave     Clave del recurso a bloquear
     * @param propietario Identificador unico del hilo que solicita el bloqueo
     * @return true si se adquirio el bloqueo, false en caso contrario
     */
    public boolean adquirirBloqueo(String clave, String propietario) {
        for (int intento = 0; intento < retryAttempts; intento++) {
            try {
                Boolean adquirido = redisTemplate.opsForValue()
                        .setIfAbsent(clave, propietario, ttlMs, TimeUnit.MILLISECONDS);
                if (Boolean.TRUE.equals(adquirido)) {
                    log.debug("Bloqueo adquirido: clave={}, propietario={}", clave, propietario);
                    return true;
                }
                if (intento < retryAttempts - 1) {
                    Thread.sleep(waitMs);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                return false;
            } catch (Exception e) {
                log.warn("Redis no disponible, continuando sin bloqueo Redis: {}", e.getMessage());
                return true; // La restriccion UNIQUE de BD actuara como fallback
            }
        }
        log.debug("No se pudo adquirir el bloqueo despues de {} intentos: {}", retryAttempts, clave);
        return false;
    }

    /**
     * Libera el bloqueo Redis solo si el propietario coincide.
     * Esto evita que un proceso libere un bloqueo que ya fue tomado por otro.
     */
    public void liberarBloqueo(String clave, String propietario) {
        try {
            String valorActual = redisTemplate.opsForValue().get(clave);
            if (propietario.equals(valorActual)) {
                redisTemplate.delete(clave);
                log.debug("Bloqueo liberado: clave={}", clave);
            }
        } catch (Exception e) {
            log.warn("Error al liberar bloqueo Redis: {}", e.getMessage());
        }
    }

    /** Genera un identificador unico para el propietario del bloqueo. */
    public String generarIdPropietario() {
        return UUID.randomUUID().toString();
    }
}

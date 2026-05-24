package com.consultorio.app.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

/**
 * Utilidad para generar, validar e invalidar JSON Web Tokens.
 * Los tokens se firman con HMAC-SHA256 (HS256) y tienen una
 * duracion configurable (por defecto 8 horas).
 */
@Component
@Slf4j
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    /** Lista negra de tokens invalidados (logout). En produccion usar Redis. */
    private final Set<String> tokenBlacklist = new HashSet<>();

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        byte[] keyBytes = Base64.getDecoder().decode(secret);
        this.secretKey   = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    /**
     * Genera un JWT firmado con los claims del usuario.
     *
     * @param idUsuario  Identificador unico del usuario
     * @param rol        Rol del usuario (paciente o medico)
     * @return Token JWT como cadena de texto
     */
    public String generarToken(Long idUsuario, String rol) {
        Instant ahora      = Instant.now();
        Instant expiracion = ahora.plus(expirationMs, ChronoUnit.MILLIS);
        return Jwts.builder()
                .subject(String.valueOf(idUsuario))
                .claim("rol", rol)
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(expiracion))
                .signWith(secretKey)
                .compact();
    }

    /** Extrae el id de usuario del claim 'sub'. */
    public Long extraerIdUsuario(String token) {
        return Long.parseLong(parsearClaims(token).getSubject());
    }

    /** Extrae el rol del claim personalizado. */
    public String extraerRol(String token) {
        return parsearClaims(token).get("rol", String.class);
    }

    /** Valida firma, estructura y vigencia del token. */
    public boolean esTokenValido(String token) {
        if (tokenBlacklist.contains(token)) return false;
        try {
            parsearClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("Token JWT invalido: {}", e.getMessage());
            return false;
        }
    }

    /** Agrega el token a la lista negra (logout). */
    public void invalidarToken(String token) {
        tokenBlacklist.add(token);
    }

    private Claims parsearClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

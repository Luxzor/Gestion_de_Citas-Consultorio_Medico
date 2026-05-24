package com.consultorio.app.controller;

import com.consultorio.app.dto.request.LoginRequest;
import com.consultorio.app.dto.request.RegistroRequest;
import com.consultorio.app.dto.response.AuthResponse;
import com.consultorio.app.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador REST para autenticacion y registro.
 * Expone endpoints publicos para login y registro de pacientes.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/registro
     * Registra un nuevo paciente y devuelve el JWT de sesion.
     */
    @PostMapping("/registro")
    public ResponseEntity<AuthResponse> registro(
            @Valid @RequestBody RegistroRequest req,
            HttpServletRequest httpReq) {
        AuthResponse resp = authService.registrar(req, httpReq.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    /**
     * POST /api/auth/login
     * Autentica un usuario y devuelve un JWT valido por 8 horas.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest httpReq) {
        AuthResponse resp = authService.login(req, httpReq.getRemoteAddr());
        return ResponseEntity.ok(resp);
    }

    /**
     * POST /api/auth/logout
     * Invalida el token JWT del usuario (lista negra).
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest httpReq,
            @AuthenticationPrincipal Long idUsuario) {
        String token = httpReq.getHeader("Authorization").substring(7);
        authService.logout(token, idUsuario, httpReq.getRemoteAddr());
        return ResponseEntity.ok(Map.of("mensaje", "Sesion cerrada exitosamente"));
    }
}

package com.consultorio.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Filtro que intercepta cada peticion HTTP para validar el JWT.
 * Si el token es valido, establece el contexto de seguridad con
 * el id de usuario y el rol correspondiente.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            if (jwtUtil.esTokenValido(token)) {
                Long   idUsuario = jwtUtil.extraerIdUsuario(token);
                String rol       = jwtUtil.extraerRol(token);

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                idUsuario,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + rol.toUpperCase()))
                        );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                log.debug("Token JWT invalido o expirado en peticion a {}", request.getRequestURI());
            }
        }

        chain.doFilter(request, response);
    }
}

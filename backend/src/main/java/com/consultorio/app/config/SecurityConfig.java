package com.consultorio.app.config;

import com.consultorio.app.security.JwtFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Configuracion central de Spring Security.
 * Aplica JWT stateless, CORS, CSRF deshabilitado para API REST,
 * y reglas de acceso por rol para cada endpoint.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints publicos (sin token)
                .requestMatchers("/api/auth/login", "/api/auth/registro").permitAll()
                // Gestion de pacientes
                .requestMatchers(HttpMethod.GET,    "/api/pacientes")    .hasRole("MEDICO")
                .requestMatchers(HttpMethod.DELETE, "/api/pacientes/**") .hasRole("MEDICO")
                .requestMatchers(HttpMethod.GET,    "/api/pacientes/**") .authenticated()
                .requestMatchers(HttpMethod.PUT,    "/api/pacientes/**") .authenticated()
                // Citas
                .requestMatchers("/api/citas/**").authenticated()
                // Historia clinica
                .requestMatchers(HttpMethod.POST, "/api/consultas").hasRole("MEDICO")
                .requestMatchers("/api/consultas/**").authenticated()
                // Reportes
                .requestMatchers("/api/reportes/pacientes")  .hasRole("MEDICO")
                .requestMatchers("/api/reportes/calendario") .hasRole("MEDICO")
                .requestMatchers("/api/reportes/historial/**").authenticated()
                // Notificaciones
                .requestMatchers("/api/notificaciones/**").authenticated()
                // Cualquier otra ruta requiere autenticacion
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Factor de costo 12 segun especificacion de seguridad
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigins.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}

package com.consultorio.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la aplicacion Spring Boot.
 * Sistema Distribuido para la Gestion de Citas de un Consultorio Medico.
 */
@SpringBootApplication
public class ConsultorioApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConsultorioApplication.class, args);
    }
}

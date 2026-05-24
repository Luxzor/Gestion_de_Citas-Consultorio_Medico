package com.consultorio.app.exception;

/** Lanzada cuando el horario solicitado para una cita ya esta ocupado. */
public class HorarioNoDisponibleException extends RuntimeException {
    public HorarioNoDisponibleException(String mensaje) {
        super(mensaje);
    }
}

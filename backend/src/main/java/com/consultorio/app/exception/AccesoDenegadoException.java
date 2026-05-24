package com.consultorio.app.exception;

/** Lanzada cuando el usuario no tiene permiso para la operacion solicitada. */
public class AccesoDenegadoException extends RuntimeException {
    public AccesoDenegadoException(String mensaje) {
        super(mensaje);
    }
}

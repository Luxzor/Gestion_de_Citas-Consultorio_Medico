package com.consultorio.app.exception;

/** Lanzada cuando un recurso solicitado no existe en la base de datos. */
public class RecursoNoEncontradoException extends RuntimeException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}

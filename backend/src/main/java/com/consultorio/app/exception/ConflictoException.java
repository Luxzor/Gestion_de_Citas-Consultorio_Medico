package com.consultorio.app.exception;

/** Lanzada cuando se intenta crear un recurso que ya existe (conflicto de unicidad). */
public class ConflictoException extends RuntimeException {
    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}

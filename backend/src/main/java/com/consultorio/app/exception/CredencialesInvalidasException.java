package com.consultorio.app.exception;

/** Lanzada cuando las credenciales de autenticacion son incorrectas. */
public class CredencialesInvalidasException extends RuntimeException {
    public CredencialesInvalidasException(String mensaje) {
        super(mensaje);
    }
}

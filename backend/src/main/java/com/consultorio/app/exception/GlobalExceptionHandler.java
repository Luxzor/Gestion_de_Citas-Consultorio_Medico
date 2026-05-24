package com.consultorio.app.exception;

import com.consultorio.app.dto.response.ErrorResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Manejador centralizado de excepciones para la API REST.
 * Convierte excepciones de dominio en respuestas HTTP con estructura uniforme.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(RecursoNoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.builder()
                        .codigo("RECURSO_NO_ENCONTRADO")
                        .mensaje(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(HorarioNoDisponibleException.class)
    public ResponseEntity<ErrorResponse> handleConflict(HorarioNoDisponibleException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.builder()
                        .codigo("HORARIO_NO_DISPONIBLE")
                        .mensaje(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<ErrorResponse> handleForbidden(AccesoDenegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.builder()
                        .codigo("ACCESO_DENEGADO")
                        .mensaje(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(CredencialesInvalidasException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(CredencialesInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.builder()
                        .codigo("CREDENCIALES_INVALIDAS")
                        .mensaje(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(ConflictoException.class)
    public ResponseEntity<ErrorResponse> handleConflict(ConflictoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ErrorResponse.builder()
                        .codigo("CONFLICTO")
                        .mensaje(ex.getMessage())
                        .build());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        String detalle = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.builder()
                        .codigo("DATOS_INVALIDOS")
                        .mensaje("Los datos de entrada no son validos")
                        .detalle(detalle)
                        .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
        log.error("Error no controlado: {}", ex.getMessage(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.builder()
                        .codigo("ERROR_INTERNO")
                        .mensaje("Error interno del servidor")
                        .build());
    }
}

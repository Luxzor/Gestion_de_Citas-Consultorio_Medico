package com.consultorio.app.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/** Estado posible de una cita medica. */
public enum EstadoCita {
    programada,
    atendida,
    cancelada;

    @JsonCreator
    public static EstadoCita fromString(String value) {
        if (value == null) return null;
        for (EstadoCita e : values()) {
            if (e.name().equalsIgnoreCase(value)) return e;
        }
        throw new IllegalArgumentException("EstadoCita invalido: " + value);
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}

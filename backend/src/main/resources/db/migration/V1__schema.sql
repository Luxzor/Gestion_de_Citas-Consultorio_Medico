-- ====================================================================
-- Esquema de base de datos - Sistema de Citas Medicas
-- Version: 1
-- ====================================================================

-- Tabla: usuario
-- Almacena las credenciales de acceso de todos los usuarios del sistema
CREATE TABLE usuario (
    id_usuario        BIGINT          NOT NULL AUTO_INCREMENT,
    nombre_usuario    VARCHAR(80)     NOT NULL,
    contrasena_hash   VARCHAR(255)    NOT NULL,
    rol               ENUM('paciente','medico') NOT NULL,
    fecha_alta        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado            ENUM('activo','inactivo') NOT NULL DEFAULT 'activo',
    intentos_fallidos TINYINT         NOT NULL DEFAULT 0,
    bloqueado_hasta   DATETIME        NULL,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_nombre_usuario (nombre_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: medico
-- Extiende a usuario con datos propios del profesional medico
CREATE TABLE medico (
    id_medico     BIGINT          NOT NULL AUTO_INCREMENT,
    id_usuario    BIGINT          NOT NULL,
    nombre        VARCHAR(150)    NOT NULL,
    especialidad  VARCHAR(100)    NOT NULL,
    cedula        VARCHAR(30)     NOT NULL,
    PRIMARY KEY (id_medico),
    UNIQUE KEY uq_medico_usuario (id_usuario),
    CONSTRAINT fk_medico_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: paciente
-- Almacena los datos demograficos del paciente vinculados a su cuenta
CREATE TABLE paciente (
    id_paciente   BIGINT          NOT NULL AUTO_INCREMENT,
    id_usuario    BIGINT          NOT NULL,
    nombre        VARCHAR(150)    NOT NULL,
    direccion     VARCHAR(300)    NOT NULL,
    correo        VARCHAR(150)    NOT NULL,
    telefono      VARCHAR(20)     NOT NULL,
    edad          TINYINT         NOT NULL,
    sexo          ENUM('M','F','Otro') NOT NULL,
    PRIMARY KEY (id_paciente),
    UNIQUE KEY uq_paciente_usuario (id_usuario),
    CONSTRAINT fk_paciente_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: cita
-- Registro de citas medicas con restriccion de unicidad para exclusion mutua
CREATE TABLE cita (
    id_cita         BIGINT      NOT NULL AUTO_INCREMENT,
    id_paciente     BIGINT      NOT NULL,
    id_medico       BIGINT      NOT NULL,
    fecha           DATE        NOT NULL,
    hora_inicio     TIME        NOT NULL,
    hora_fin        TIME        NOT NULL,
    estado          ENUM('programada','atendida','cancelada') NOT NULL DEFAULT 'programada',
    creada_por      BIGINT      NOT NULL,
    fecha_creacion  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_cita),
    -- Restriccion de unicidad: un medico no puede tener dos citas en el mismo horario
    UNIQUE KEY uq_cita_medico_horario (id_medico, fecha, hora_inicio),
    CONSTRAINT fk_cita_paciente FOREIGN KEY (id_paciente)
        REFERENCES paciente (id_paciente),
    CONSTRAINT fk_cita_medico FOREIGN KEY (id_medico)
        REFERENCES medico (id_medico),
    CONSTRAINT fk_cita_creada_por FOREIGN KEY (creada_por)
        REFERENCES usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: consulta
-- Historia clinica con datos cifrados con AES-256-GCM
CREATE TABLE consulta (
    id_consulta       BIGINT      NOT NULL AUTO_INCREMENT,
    id_cita           BIGINT      NOT NULL,
    temperatura_cif   BLOB        NOT NULL COMMENT 'Temperatura cifrada: IV(12b)+ciphertext+tag(16b)',
    peso_cif          BLOB        NOT NULL COMMENT 'Peso cifrado',
    altura_cif        BLOB        NOT NULL COMMENT 'Altura cifrada',
    presion_cif       BLOB        NOT NULL COMMENT 'Presion arterial cifrada',
    relatoria_cif     BLOB        NOT NULL COMMENT 'Relatoria medica cifrada',
    diagnostico_cif   BLOB        NOT NULL COMMENT 'Diagnostico cifrado',
    prescripcion_cif  BLOB        NOT NULL COMMENT 'Prescripcion cifrada',
    resultados_cif    BLOB        NULL     COMMENT 'Resultados de analisis cifrados (opcional)',
    fecha_consulta    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_consulta),
    UNIQUE KEY uq_consulta_cita (id_cita),
    CONSTRAINT fk_consulta_cita FOREIGN KEY (id_cita)
        REFERENCES cita (id_cita)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: notificacion
-- Avisos generados automaticamente para los usuarios
CREATE TABLE notificacion (
    id_notificacion      BIGINT          NOT NULL AUTO_INCREMENT,
    id_usuario_destino   BIGINT          NOT NULL,
    mensaje              VARCHAR(500)    NOT NULL,
    leida                BOOLEAN         NOT NULL DEFAULT FALSE,
    fecha                DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_notificacion),
    CONSTRAINT fk_notif_usuario FOREIGN KEY (id_usuario_destino)
        REFERENCES usuario (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: bloqueo
-- Coordinador de exclusion mutua basado en SGBD (alternativa a Redis)
CREATE TABLE bloqueo (
    recurso                VARCHAR(150)    NOT NULL,
    id_propietario         VARCHAR(100)    NOT NULL,
    timestamp_expiracion   DATETIME        NOT NULL,
    PRIMARY KEY (recurso)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla: bitacora
-- Registro de auditoria de operaciones criticas (solo insercion)
CREATE TABLE bitacora (
    id_bitacora   BIGINT          NOT NULL AUTO_INCREMENT,
    id_usuario    BIGINT          NULL,
    accion        VARCHAR(60)     NOT NULL,
    detalle       VARCHAR(500)    NULL,
    ip            VARCHAR(45)     NOT NULL,
    fecha         DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_bitacora),
    CONSTRAINT fk_bitacora_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario) ON DELETE SET NULL,
    INDEX idx_bitacora_fecha (fecha),
    INDEX idx_bitacora_usuario (id_usuario)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- Datos iniciales: cuenta del medico administrador
-- Contrasena: Admin2026! (hash bcrypt factor 12)
-- ====================================================================
INSERT INTO usuario (nombre_usuario, contrasena_hash, rol, estado)
VALUES ('medico_admin',
        '$2b$12$DyDMnPs7CPNulLAAxnE9j.RAF.nF.7.CjQLV8SK6hZvTGbIX5B.8e',
        'medico', 'activo');

INSERT INTO medico (id_usuario, nombre, especialidad, cedula)
VALUES (LAST_INSERT_ID(), 'Dr. Juan Perez Garcia', 'Medicina General', 'MED-2024-001');

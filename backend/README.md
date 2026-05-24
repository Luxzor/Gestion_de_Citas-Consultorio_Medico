# Backend — Capa de Lógica de Negocio

API REST construida con **Spring Boot 3 / Java 21** que centraliza todas las reglas de dominio del sistema de citas. Ningún cliente puede modificar datos sin pasar por esta capa.

---

## Arquitectura interna

```
com.consultorio.app/
├── config/         Configuración de seguridad (Spring Security + JWT), Redis y async
├── controller/     Controladores REST — reciben HTTP, delegan a servicios, devuelven JSON
├── dto/            Request y Response (sin exponer entidades JPA directamente)
├── exception/      Excepciones de dominio y manejador global (@ControllerAdvice)
├── model/          Entidades JPA + enums (Rol, Sexo, EstadoUsuario)
├── repository/     Repositorios Spring Data JPA (uno por entidad)
├── security/       Filtro JWT, JwtUtil, UserDetailsServiceImpl
└── service/        Servicios de dominio (uno por agregado principal)
```

### Servicios de dominio

| Servicio              | Responsabilidad                                                          |
|-----------------------|--------------------------------------------------------------------------|
| `CitaService`         | Reserva con control de concurrencia, disponibilidad, cancelación         |
| `ConsultaService`     | Captura y recuperación de historia clínica cifrada                       |
| `PacienteService`     | CRUD de pacientes con verificación de propiedad del recurso              |
| `ReporteService`      | Generación de reportes: lista de pacientes, calendario e historial       |
| `NotificacionService` | Creación y consulta de notificaciones; marcado de leída                  |
| `ConcurrenciaService` | Bloqueos distribuidos Redlock sobre Redis                                |
| `CifradoService`      | Cifrado/descifrado AES-256-GCM de datos clínicos                        |
| `BitacoraService`     | Registro de auditoría de operaciones críticas                            |

---

## API REST

Base path: `/api`  
Autenticación requerida: `Authorization: Bearer <token_JWT>` (excepto `/auth/*`)

### Autenticación

| Método | Ruta               | Descripción                          |
|--------|--------------------|--------------------------------------|
| POST   | `/auth/registro`   | Registra nuevo paciente y emite JWT  |
| POST   | `/auth/login`      | Valida credenciales y emite JWT      |
| POST   | `/auth/logout`     | Invalida el token en lista negra     |

### Pacientes

| Método | Ruta               | Rol requerido              |
|--------|--------------------|----------------------------|
| GET    | `/pacientes`       | `MEDICO`                   |
| GET    | `/pacientes/{id}`  | `MEDICO` o paciente propio |
| PUT    | `/pacientes/{id}`  | Paciente propio            |
| DELETE | `/pacientes/{id}`  | `MEDICO`                   |

### Citas

| Método | Ruta                      | Descripción                                               |
|--------|---------------------------|-----------------------------------------------------------|
| POST   | `/citas`                  | Reserva con exclusión mutua Redlock — puede devolver 409  |
| GET    | `/citas`                  | Lista con filtros: `id_paciente`, `id_medico`, `desde`, `hasta` |
| GET    | `/citas/{id}`             | Detalle de una cita                                       |
| PUT    | `/citas/{id}`             | Modifica fecha, hora o estado                             |
| DELETE | `/citas/{id}`             | Cancela (genera notificación si la cancela el médico)     |
| GET    | `/citas/disponibilidad`   | Bloques libres de 30 min de 8:00 a 17:00                  |

### Historia clínica

| Método | Ruta                              | Rol requerido              |
|--------|-----------------------------------|----------------------------|
| POST   | `/consultas`                      | `MEDICO`                   |
| GET    | `/consultas/{id}`                 | `MEDICO` o paciente propio |
| GET    | `/consultas/paciente/{id_paciente}` | `MEDICO` o paciente propio |

### Reportes

| Método | Ruta                              | Rol requerido              |
|--------|-----------------------------------|----------------------------|
| GET    | `/reportes/pacientes`             | `MEDICO`                   |
| GET    | `/reportes/calendario`            | `MEDICO`                   |
| GET    | `/reportes/historial/{id_paciente}` | `MEDICO` o paciente propio |

### Notificaciones

| Método | Ruta                          | Descripción                        |
|--------|-------------------------------|------------------------------------|
| GET    | `/notificaciones`             | Notificaciones del usuario autenticado |
| PUT    | `/notificaciones/{id}/leida`  | Marca una notificación como leída  |

### Códigos de respuesta

| Código | Significado                                             |
|--------|---------------------------------------------------------|
| 200    | Operación exitosa                                       |
| 201    | Recurso creado                                          |
| 400    | Datos de entrada inválidos                              |
| 401    | Token ausente, inválido o expirado                      |
| 403    | Sin permiso para el recurso                             |
| 404    | Recurso no encontrado                                   |
| 409    | Conflicto (horario ya reservado)                        |
| 500    | Error interno no controlado                             |

---

## Control de concurrencia — Redlock sobre Redis

La reserva de citas es una condición de carrera clásica: dos solicitudes simultáneas pueden superar la verificación de disponibilidad al mismo tiempo y generar un doble registro.

**Algoritmo implementado en `ConcurrenciaService`:**

1. El cliente envía `POST /api/citas` con `{id_medico, fecha, hora_inicio, ...}`
2. El servicio construye la clave: `lock:medico:{id}:fecha:{f}:hora:{h}`
3. Se intenta adquirir el bloqueo en Redis con `SET NX PX 5000` (TTL = 5 s, hasta 3 reintentos cada 100 ms)
4. **Bloqueo adquirido →** verificar disponibilidad en BD → `INSERT` en transacción → liberar bloqueo → responder `201 Created`
5. **Bloqueo no adquirido →** responder `409 Conflict`

**Fallback:** si Redis no está disponible, el servicio permite continuar y la restricción `UNIQUE (id_medico, fecha, hora_inicio)` de la BD actúa como segunda línea de defensa.

---

## Seguridad

### JWT (autenticación)

- Firmado con **HS256**; expiración configurable (por defecto 8 horas)
- Claims: `sub` (id_usuario), `rol`, `iat`, `exp`
- `JwtFilter` valida firma y vigencia en cada petición antes del controlador
- Logout agrega el token a una lista negra en memoria (`Set<String>` en `JwtUtil`)

### Autorización por roles

`SecurityConfig` define las reglas por endpoint:

- `MEDICO`: gestión de pacientes, reportes completos, captura de historia clínica
- `PACIENTE`: perfil propio, citas propias, historial clínico propio
- Ambos roles: reservar citas, leer notificaciones

La verificación de propiedad del recurso (¿es *este* paciente el dueño del historial?) se hace en la capa de servicio, no solo en Spring Security.

### Cifrado en reposo — AES-256-GCM

`CifradoService` cifra todos los campos clínicos antes de persistirlos:

```
Formato BLOB: [ IV (12 bytes) ][ Ciphertext ][ GCM Tag (16 bytes) ]
```

- La clave maestra se inyecta vía variable de entorno `APP_ENCRYPTION_KEY` (32 bytes en Base64)
- La etiqueta GCM garantiza integridad: si el BLOB fue alterado, el descifrado falla y se registra en bitácora
- La clave nunca se almacena en la BD ni en el repositorio

### Contraseñas

Hashed con **BCrypt**, factor de costo 12 (`BCryptPasswordEncoder`).

### Defensa frente a ataques comunes

| Amenaza           | Contramedida                                                              |
|-------------------|---------------------------------------------------------------------------|
| Inyección SQL     | Consultas parametrizadas vía JPA/Hibernate; sin concatenación de strings  |
| XSS               | Escape automático en React (frontend); cabeceras CSP en servidor           |
| CSRF              | JWT en cabecera `Authorization` mitiga el riesgo; sin cookies de sesión   |
| Fuerza bruta      | Bloqueo temporal tras 5 fallos consecutivos con espera exponencial        |
| Acceso no autorizado | Filtro JWT + verificación de propiedad de recurso en capa de servicio  |

### Bitácora de auditoría

Toda operación crítica se registra en la tabla `bitacora` (solo inserción, sin API de borrado):

- Inicio de sesión exitoso y fallido
- Creación y cancelación de citas
- Acceso y modificación de historia clínica
- Modificación de datos de paciente
- Intentos de acceso no autorizado

---

## Diseño de la base de datos

Ocho tablas principales; esquema gestionado con **Flyway** (migración `V1__schema.sql`).

| Tabla          | Descripción                                                        |
|----------------|--------------------------------------------------------------------|
| `usuario`      | Credenciales de acceso (hash bcrypt) y rol                        |
| `paciente`     | Datos demográficos; relación 1:1 con `usuario`                    |
| `medico`       | Especialidad y cédula; relación 1:1 con `usuario`                 |
| `cita`         | Relación paciente-médico con fecha/hora; índice UNIQUE `(id_medico, fecha, hora_inicio)` |
| `consulta`     | Historia clínica cifrada (8 columnas BLOB con sufijo `_cif`)      |
| `notificacion` | Avisos generados por el sistema; flag `leida`                     |
| `bloqueo`      | Exclusión mutua basada en SGBD (alternativa a Redis)              |
| `bitacora`     | Registro de auditoría inmutable                                   |

---

## Pila tecnológica

| Componente      | Tecnología                                              |
|-----------------|---------------------------------------------------------|
| Lenguaje        | Java 21                                                 |
| Framework       | Spring Boot 3.2 (Web MVC, Security, Data JPA, Validation) |
| Base de datos   | MySQL 8 (JDBC) + Flyway para migraciones               |
| Caché/bloqueos  | Redis 7 (`spring-boot-starter-data-redis`)              |
| JWT             | jjwt 0.12.5 (HS256)                                    |
| Cifrado         | AES-256-GCM (`javax.crypto`)                           |
| Hash contraseñas| BCrypt factor 12 (Spring Security)                     |
| Build           | Maven 3.9                                              |
| Contenedor      | Docker (imagen multi-stage; ver `Dockerfile`)          |

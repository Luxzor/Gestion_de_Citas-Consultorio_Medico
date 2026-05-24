# Sistema Distribuido de Citas Medicas - Instrucciones de Arranque

## Prerrequisitos

- Docker Desktop 24+ y Docker Compose v2
- (Alternativa sin Docker) Java 21, Maven 3.9, Node.js 20, MySQL 8, Redis 7

---

## Arranque con Docker Compose (recomendado)

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Edite el archivo `.env` y reemplace todos los valores de ejemplo por claves seguras.
Para generar claves seguras:

```bash
# Clave JWT (256 bits en Base64)
openssl rand -base64 32

# Clave AES-256 (exactamente 32 bytes en Base64)
openssl rand -base64 32
```

### 2. Construir e iniciar todos los servicios

```bash
docker compose up --build -d
```

Esto levanta cuatro contenedores:
- `consultorio_mysql`   en el puerto 3306
- `consultorio_redis`   en el puerto 6379
- `consultorio_backend` en el puerto 8080
- `consultorio_frontend` en el puerto 3000

### 3. Verificar que los servicios estan en ejecucion

```bash
docker compose ps
docker compose logs backend --follow
```

### 4. Acceder a la aplicacion

Abra el navegador en: http://localhost:3000

### Cuenta inicial del medico

- Usuario: `medico_admin`
- Contrasena: `Admin2026!`

### 5. Detener los servicios

```bash
docker compose down
```

Para borrar tambien los datos de la base de datos:
```bash
docker compose down -v
```

---

## Arranque sin Docker (desarrollo local)

### Base de datos

```bash
mysql -u root -p < backend/src/main/resources/db/migration/V1__schema.sql
```

### Backend Spring Boot

```bash
cd backend
export DB_URL="jdbc:mysql://localhost:3306/consultorio_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
export DB_USERNAME=root
export DB_PASSWORD=su_password
export REDIS_HOST=localhost
export REDIS_PASSWORD=
export JWT_SECRET=Y29uc3VsdG9yaW9NZWRpY29TZWNyZXRLZXkyMDI2U2VjdXJl
export APP_ENCRYPTION_KEY=Q29uc3VsdG9yaW9BRVMyNTZLZXlTZWN1cmUyMDI2
mvn spring-boot:run
```

El backend estara disponible en http://localhost:8080

### Frontend React

```bash
cd frontend
npm install
npm start
```

El frontend estara disponible en http://localhost:3000

---

## Estructura del codigo fuente

```
codigo-fuente/
├── backend/                          Capa de logica de negocio (Spring Boot 3 / Java 21)
│   ├── src/main/java/com/consultorio/app/
│   │   ├── config/                   Configuracion de seguridad, Redis y async
│   │   ├── controller/               Controladores REST (6 controladores)
│   │   ├── dto/                      Objetos de transferencia de datos
│   │   ├── exception/                Excepciones de dominio y manejador global
│   │   ├── model/                    Entidades JPA y enums
│   │   ├── repository/               Repositorios Spring Data JPA
│   │   ├── security/                 JWT: filtro, utilidad y UserDetailsService
│   │   └── service/                  Servicios de dominio (8 servicios)
│   └── src/main/resources/
│       ├── application.properties    Configuracion de la aplicacion
│       └── db/migration/             Esquema SQL con Flyway
│
├── frontend/                         Capa de presentacion (React 18)
│   └── src/
│       ├── api/                      Modulos de llamada a la API REST
│       ├── components/               Componentes React por modulo funcional
│       │   ├── auth/                 Login, Registro, Dashboard
│       │   ├── citas/                Lista de citas, nueva cita
│       │   ├── consultas/            Formulario de consulta, historial clinico
│       │   ├── notificaciones/       Panel de notificaciones
│       │   ├── pacientes/            Lista y detalle de paciente
│       │   ├── reportes/             Reportes con tres pestanas
│       │   └── common/               Navbar, alertas, spinner, rutas protegidas
│       └── context/                  Contexto de autenticacion (JWT)
│
├── docker-compose.yml                Orquestacion de los cuatro servicios
├── .env.example                      Plantilla de variables de entorno
└── INSTRUCCIONES.md                  Este archivo
```

---

## Pruebas de concurrencia

Para verificar el mecanismo de exclusion mutua ejecute el script de prueba:

```bash
# Con k6 (instale desde https://k6.io)
k6 run pruebas/concurrencia.js

# Con curl en paralelo (prueba rapida, 20 peticiones simultaneas)
for i in $(seq 1 20); do
  curl -s -X POST http://localhost:8080/api/citas \
    -H "Authorization: Bearer TOKEN_MEDICO" \
    -H "Content-Type: application/json" \
    -d '{"idPaciente":1,"idMedico":1,"fecha":"2026-06-01","horaInicio":"10:00","horaFin":"10:30"}' &
done
wait
```

El resultado esperado es exactamente una respuesta HTTP 201 y todas las demas con HTTP 409.

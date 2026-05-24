# Sistema Distribuido de Gestión de Citas Médicas

Sistema distribuido de tres capas para la gestión integral de un consultorio médico: reserva de citas con exclusión mutua, historia clínica encriptada, notificaciones en tiempo real y generación de reportes.

**Stack:** React 18 · Spring Boot 3 · MySQL 8 · Redis 7 · Docker Compose

---

## Prerrequisitos

- Docker Desktop 24+ y Docker Compose v2
- *(Alternativa sin Docker)* Java 21, Maven 3.9, Node.js 20, MySQL 8, Redis 7

---

## Arranque con Docker Compose (recomendado)

### 1. Configurar variables de entorno

```bash
cp .env.example .env
```

Edite `.env` y reemplace los valores de ejemplo por claves seguras. Para generarlas:

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

Levanta cuatro contenedores:

| Contenedor              | Puerto |
|-------------------------|--------|
| `consultorio_mysql`     | 3306   |
| `consultorio_redis`     | 6379   |
| `consultorio_backend`   | 8080   |
| `consultorio_frontend`  | 3000   |

### 3. Verificar que los servicios están en ejecución

```bash
docker compose ps
docker compose logs backend --follow
```

### 4. Acceder a la aplicación

Abra el navegador en: **http://localhost:3000**

**Cuenta del médico (administrador):**

| Campo     | Valor         |
|-----------|---------------|
| Usuario   | `medico_admin` |
| Contraseña | `Admin2026!`  |

### 5. Detener los servicios

```bash
docker compose down

# Para borrar también los datos de la base de datos:
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

El backend estará disponible en **http://localhost:8080**

### Frontend React

```bash
cd frontend
npm install
npm start
```

El frontend estará disponible en **http://localhost:3000**

---

## Estructura del código fuente

```
codigo-fuente/
├── backend/                          Capa de lógica de negocio (Spring Boot 3 / Java 21)
│   ├── src/main/java/com/consultorio/app/
│   │   ├── config/                   Configuración de seguridad, Redis y async
│   │   ├── controller/               Controladores REST (6 controladores)
│   │   ├── dto/                      Objetos de transferencia de datos
│   │   ├── exception/                Excepciones de dominio y manejador global
│   │   ├── model/                    Entidades JPA y enums
│   │   ├── repository/               Repositorios Spring Data JPA
│   │   ├── security/                 JWT: filtro, utilidad y UserDetailsService
│   │   └── service/                  Servicios de dominio (8 servicios)
│   └── src/main/resources/
│       ├── application.properties    Configuración de la aplicación
│       └── db/migration/             Esquema SQL con Flyway
│
├── frontend/                         Capa de presentación (React 18)
│   └── src/
│       ├── api/                      Módulos de llamada a la API REST
│       ├── styles/
│       │   └── global.css            Sistema de diseño global (variables CSS, animaciones,
│       │                             clases utilitarias: .card, .btn-*, .badge-*, etc.)
│       ├── utils/
│       │   └── styles.js             Tokens de diseño para estilos inline (paleta, fuentes)
│       ├── components/               Componentes React por módulo funcional
│       │   ├── auth/                 Login (split panel), Registro, Dashboard con stat-cards
│       │   ├── citas/                Lista con filtros pill, wizard de reserva con step indicator
│       │   ├── consultas/            Formulario clínico por secciones, historial en timeline
│       │   ├── notificaciones/       Panel de notificaciones con bordes de color por estado
│       │   ├── pacientes/            Lista con avatares de iniciales, perfil con header degradado
│       │   ├── reportes/             Dashboard de 3 pestañas: pacientes, calendario, historial
│       │   └── common/               Navbar, AlertMsg, Spinner, ProtectedRoute
│       └── context/                  Contexto de autenticación (JWT en sessionStorage)
│
├── docker-compose.yml                Orquestación de los cuatro servicios
├── .env.example                      Plantilla de variables de entorno
└── README.md                         Este archivo
```

---

## Diseño del Frontend

El frontend utiliza el sistema de diseño **"Verdure Clínica"**, implementado en `frontend/src/styles/global.css` y `frontend/public/index.html`.

### Tipografía (Google Fonts)

| Fuente       | Uso                                          |
|--------------|----------------------------------------------|
| **Fraunces** | Títulos de página, nombres, valores numéricos en stat-cards |
| **Outfit**   | Todo el texto de cuerpo, labels, botones     |

### Paleta de colores

| Token              | Valor     | Uso                                  |
|--------------------|-----------|--------------------------------------|
| Primary            | `#15423a` | Navbar, botones primarios, acentos   |
| Primary light      | `#e8f2ef` | Fondos de sección de signos vitales  |
| Accent             | `#c8945a` | Badges de notificaciones nuevas      |
| Background         | `#f0f5f2` | Fondo general de la aplicación       |
| Text               | `#0f2b24` | Texto principal                      |
| Text muted         | `#4d7a6e` | Labels, texto secundario             |

### Características visuales

- **Login:** panel dividido 50/50 — branding oscuro a la izquierda, formulario a la derecha
- **Dashboard:** stat-cards con contadores en `Fraunces` + acciones rápidas con íconos SVG
- **Citas:** tarjetas con borde izquierdo coloreado según estado (azul / verde / rojo) y animación escalonada
- **Nueva cita:** indicador de pasos visual (círculos numerados con línea conectora)
- **Pacientes:** lista con avatares de iniciales generados automáticamente desde el nombre
- **Historial clínico:** timeline vertical con entradas expandibles; valores vitales destacados
- **Notificaciones:** borde ámbar dorado en avisos no leídos
- **Animaciones CSS:** `fadeIn`, `slideUp` con `animation-delay` escalonado en listas

---

## Pruebas de concurrencia

Para verificar el mecanismo de exclusión mutua ejecute el script de prueba:

```bash
# Con k6 (instale desde https://k6.io)
k6 run pruebas/concurrencia.js

# Con curl en paralelo (prueba rápida, 20 peticiones simultáneas)
for i in $(seq 1 20); do
  curl -s -X POST http://localhost:8080/api/citas \
    -H "Authorization: Bearer TOKEN_MEDICO" \
    -H "Content-Type: application/json" \
    -d '{"idPaciente":1,"idMedico":1,"fecha":"2026-06-01","horaInicio":"10:00","horaFin":"10:30"}' &
done
wait
```

El resultado esperado es exactamente **una respuesta HTTP 201** y todas las demás con **HTTP 409**.

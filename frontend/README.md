# Frontend — Capa de Presentación

Aplicación web SPA construida con **React 18** que consume la API REST del backend mediante peticiones autenticadas con JWT.

---

## Módulos funcionales

| Módulo             | Descripción                                                                                   |
|--------------------|-----------------------------------------------------------------------------------------------|
| **Autenticación**  | Inicio de sesión, registro de nuevo paciente y cierre de sesión                               |
| **Pacientes**      | Alta, consulta, modificación y eliminación de datos del paciente                              |
| **Citas**          | Calendario de disponibilidad, reserva, modificación y cancelación de citas                    |
| **Consulta médica**| Captura de historia clínica: signos vitales, diagnóstico, prescripción y resultados           |
| **Reportes**       | Lista de pacientes, calendario de citas e historial clínico; con opción de impresión          |
| **Notificaciones** | Indicador visual de avisos pendientes cargados al iniciar sesión                              |

---

## Estructura de archivos

```
frontend/src/
├── api/                      Módulos de llamada a la API REST
├── styles/
│   └── global.css            Sistema de diseño global (variables CSS, animaciones,
│                             clases utilitarias: .card, .btn-*, .badge-*, etc.)
├── utils/
│   └── styles.js             Tokens de diseño para estilos inline (paleta, fuentes)
├── components/               Componentes React por módulo funcional
│   ├── auth/                 Login (split panel), Registro, Dashboard con stat-cards
│   ├── citas/                Lista con filtros pill, wizard de reserva con step indicator
│   ├── consultas/            Formulario clínico por secciones, historial en timeline
│   ├── notificaciones/       Panel de notificaciones con bordes de color por estado
│   ├── pacientes/            Lista con avatares de iniciales, perfil con header degradado
│   ├── reportes/             Dashboard de 3 pestañas: pacientes, calendario, historial
│   └── common/               Navbar, AlertMsg, Spinner, ProtectedRoute
└── context/                  Contexto de autenticación (JWT en sessionStorage)
```

---

## Sistema de diseño — "Verdure Clínica"

Implementado en `src/styles/global.css` y referenciado desde `public/index.html`.

### Tipografía (Google Fonts)

| Fuente       | Uso                                                         |
|--------------|-------------------------------------------------------------|
| **Fraunces** | Títulos de página, nombres, valores numéricos en stat-cards |
| **Outfit**   | Todo el texto de cuerpo, labels, botones                    |

### Paleta de colores

| Token         | Valor     | Uso                                 |
|---------------|-----------|-------------------------------------|
| Primary       | `#15423a` | Navbar, botones primarios, acentos  |
| Primary light | `#e8f2ef` | Fondos de sección de signos vitales |
| Accent        | `#c8945a` | Badges de notificaciones nuevas     |
| Background    | `#f0f5f2` | Fondo general de la aplicación      |
| Text          | `#0f2b24` | Texto principal                     |
| Text muted    | `#4d7a6e` | Labels, texto secundario            |

### Características visuales por pantalla

- **Login:** panel dividido 50/50 — branding oscuro a la izquierda, formulario a la derecha
- **Dashboard:** stat-cards con contadores en `Fraunces` + acciones rápidas con íconos SVG
- **Citas:** tarjetas con borde izquierdo coloreado según estado (azul / verde / rojo) y animación escalonada
- **Nueva cita:** indicador de pasos visual (círculos numerados con línea conectora); verifica disponibilidad en tiempo real vía `GET /api/citas/disponibilidad` antes de confirmar
- **Pacientes:** lista con avatares de iniciales generados automáticamente desde el nombre
- **Historial clínico:** timeline vertical con entradas expandibles; valores vitales destacados
- **Notificaciones:** borde ámbar dorado en avisos no leídos
- **Animaciones CSS:** `fadeIn`, `slideUp` con `animation-delay` escalonado en listas

### Principios de diseño

- Paleta institucional neutra sin colores estridentes
- Mensajes claros de éxito y error con validación en tiempo real
- Accesibilidad básica: contraste suficiente, etiquetas en formularios, navegación por teclado
- Diseño responsivo para escritorio y tableta mediante CSS Grid y Flexbox

---

## Seguridad en el cliente

El token JWT se almacena en `sessionStorage` (memoria de sesión) y nunca en `localStorage` ni en cookies persistentes. Se incluye en la cabecera `Authorization: Bearer <token>` de cada petición autenticada. Al cerrar sesión el token se elimina del almacenamiento y el servidor lo agrega a su lista negra.

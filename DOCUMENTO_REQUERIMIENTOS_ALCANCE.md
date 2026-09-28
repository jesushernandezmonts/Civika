# ACTA DE DEFINICIÓN DE ALCANCE Y MATRIZ DE REQUERIMIENTOS DEL SISTEMA
## PROYECTO: SISTEMA DE GESTIÓN INTEGRAL "TLAPALLI" (CENTRO CULTURAL HUAMANTLA)

---

### 1. DATOS GENERALES Y CONTROL DE ALCANCE

* **Nombre del Proyecto:** Sistema Web de Gestión Integral "Tlapalli"
* **Organización / Beneficiario:** Centro Cultural Tlapalli (Huamantla, Tlaxcala)
* **Estudiante / Desarrollador:** [Nombre del Alumno(a)]
* **Docente / Asesor(a) Revisor(a):** [Nombre de la Maestra / Asesora]
* **Materia / Modalidad:** Proyecto de Estadía / Residencia Profesional / Proyecto Terminal
* **Fecha de Emisión y Aprobación:** [Fecha actual, ej. 25 de Septiembre de 2026]
* **Versión del Documento:** 1.0 (Alcance Congelado / Baseline)

> **PROPÓSITO DEL DOCUMENTO:**  
> El presente documento establece de manera formal, explícita y vinculante las funcionalidades, entregables, criterios de aceptación y fechas límite pactadas para el desarrollo del software. Cualquier requerimiento no contemplado expresamente en esta matriz será considerado un cambio de alcance y se gestionará mediante el protocolo de control de cambios (Sección 6), protegiendo el calendario de entrega acordado.

---

### 2. OBJETIVO DEL SISTEMA Y DELIMITACIÓN (QUÉ SÍ Y QUÉ NO INCLUYE)

#### 2.1 Objetivo General
Desarrollar e implementar una plataforma web centralizada para el Centro Cultural Tlapalli que automatice los procesos de registro de alumnos, administración de talleres, asignación de instructores, control de asistencias, registro de pagos de colegiaturas, gestión de actividades culturales y seguimiento de horas de servicio social.

#### 2.2 Delimitación Estricta (Fuera de Alcance / Out of Scope)
Para evitar retrabajos y desfases en el cronograma, se define que el proyecto **NO** incluye:
1. **Pasarelas de cobro bancario en línea con dispersión automática (ej. Stripe/Openpay):** Los pagos se manejan mediante registro administrativo (efectivo y transferencia con folio/comprobante).
2. **Aplicación móvil nativa (iOS/Android):** El sistema es una aplicación Web Progresiva y Responsiva adaptable a navegadores de escritorio y móviles.
3. **Módulo de facturación electrónica CFDI / SAT:** La plataforma emite comprobantes internos de pago en PDF, no timbrado fiscal.
4. **Hardware especializado de control de acceso:** El pase de lista se realiza mediante la interfaz web por el instructor/administrador, sin torniquetes biométricos físicos.

---

### 3. MATRIZ DE REQUERIMIENTOS FUNCIONALES (RF) CON FECHAS DE ENTREGA

| ID | Módulo | Requerimiento Funcional | Criterio de Aceptación (Demostrable) | Fecha Entrega |
|:---|:---|:---|:---|:---:|
| **RF-01** | Autenticación y Seguridad | Inicio de sesión multi-rol (Admin, Profesor/Instructor, Alumno) con JWT y soporte Google OAuth. | Bloqueo por intentos fallidos, recuperación de contraseña por token y control de acceso por roles. | [Fecha 1] |
| **RF-02** | Gestión de Alumnos | Registro y expediente digital del alumno con CURP, teléfono, datos de salud (padecimientos) y localidad. | Formulario validado, subida de documentos digitales (acta, CURP, comprobante) y consulta de historial. | [Fecha 1] |
| **RF-03** | Gestión de Talleres | Catálogo de talleres con asignación de cupo máximo, costos mensuales y horarios. | CRUD funcional con validación de no duplicidad y cálculo automático de cupos disponibles. | [Fecha 2] |
| **RF-04** | Gestión de Instructores | Perfil del docente, asignación a talleres, subida de temario y currículum digital. | Visualización de talleres asignados por instructor y control de estatus (Pendiente/Activo/Inactivo). | [Fecha 2] |
| **RF-05** | Inscripciones | Asignación de alumnos a talleres por periodos (ordinario o verano) y grupos. | Validación de cupo antes de inscribir y cambio de estatus de inscripción. | [Fecha 3] |
| **RF-06** | Control de Asistencias | Pase de lista digital por grupo/taller con estados (Asistencia, Falta, Justificada). | Registro de fecha y observaciones; opción de adjuntar comprobante para justificaciones. | [Fecha 3] |
| **RF-07** | Control de Pagos | Registro de mensualidades por alumno, método de pago (efectivo/transferencia) y estatus financiero. | Historial financiero por alumno, estatus (al corriente / deudor) y generación de recibo/comprobante imprimible. | [Fecha 4] |
| **RF-08** | Justificaciones de Instructores | Módulo para que los instructores reporten ausencias con fecha, motivo y justificante. | Panel del administrador para revisar, aprobar o rechazar justificaciones con comentarios. | [Fecha 4] |
| **RF-09** | Gestión de Actividades y Espacios | Calendario de eventos y reserva de espacios (Galería, Audioteca, Auditorio). | Aprobación de actividades internas/externas por el administrador con prevención de cruce de fechas. | [Fecha 5] |
| **RF-10** | Servicio Social | Registro de prestadores de servicio social con meta de 480 horas y bitácora de actividades. | Registro de horas acumuladas, carga de evidencias fotográficas/documentales y validación de estatus. | [Fecha 5] |
| **RF-11** | Portal del Alumno | Vista exclusiva para el estudiante con consulta de sus talleres, estado de pagos y avance de servicio social. | Acceso autenticado independiente donde el alumno solo visualiza su propia información. | [Fecha 6] |
| **RF-12** | Reportes y Exportación | Generación de reportes administrativos y estadísticos (general, financiero, alumnos y talleres). | Exportación o visualización clara de totales, alumnos activos y corte de ingresos mensuales. | [Fecha 6] |

---

### 4. REQUERIMIENTOS NO FUNCIONALES (RNF)

* **RNF-01 (Seguridad):** Contraseñas cifradas mediante algoritmo seguro (Bcrypt), tokens de sesión protegidos contra ataques XSS y CSRF, y cabeceras de protección (Helmet).
* **RNF-02 (Rendimiento):** Tiempo de respuesta menor a 2 segundos en consultas estándar bajo condiciones normales de red.
* **RNF-03 (Responsividad):** Diseño adaptable (Responsive Design) operable en computadoras de escritorio, laptops, tablets y smartphones.
* **RNF-04 (Arquitectura y Persistencia):** Backend desacoplado en NestJS + TypeScript, base de datos relacional PostgreSQL con Prisma ORM, y Frontend modular en React con Vite.
* **RNF-05 (Disponibilidad y Despliegue):** Configuración lista para despliegue en la nube (Koyeb para backend y Vercel para frontend).

---

### 5. CRONOGRAMA DE ENTREGAS PARCIALES Y REVISIONES

| Hito / Entrega | Módulos Involucrados | Evidencia a Entregar | Fecha Pactada | Firma de Aceptación Parcial |
|:---|:---|:---|:---:|:---:|
| **Hito 1: Cimientos y Catálogos Base** | RF-01, RF-02, RF-03 | Demo funcional: Login, creación de alumnos con expediente y catálogo de talleres. | ___ / ___ / 2026 | __________________ |
| **Hito 2: Operación Académica** | RF-04, RF-05, RF-06 | Demo funcional: Instructores, inscripciones a grupos y pase de lista digital. | ___ / ___ / 2026 | __________________ |
| **Hito 3: Finanzas y Justificaciones** | RF-07, RF-08 | Demo funcional: Cobro de colegiaturas, estatus de deudor y justificaciones docentes. | ___ / ___ / 2026 | __________________ |
| **Hito 4: Espacios y Servicio Social** | RF-09, RF-10 | Demo funcional: Reservas de galería/auditorio y acumulado de 480 hrs de servicio. | ___ / ___ / 2026 | __________________ |
| **Hito 5: Portal Alumno y Reportes** | RF-11, RF-12 | Demo funcional: Portal alumno y módulo de exportación de estadísticas. | ___ / ___ / 2026 | __________________ |
| **Hito 6: Pruebas Finales y Despliegue** | RNF-01 a RNF-05 | Sistema en producción (Koyeb/Vercel), manual de usuario y código fuente en Git. | ___ / ___ / 2026 | __________________ |

---

### 6. POLÍTICA DE CONTROL DE CAMBIOS Y BLINDAJE DE ALCANCE

Con el fin de garantizar la culminación en tiempo y forma del proyecto:
1. **Solicitud de Nuevas Funcionalidades:** Toda solicitud que modifique o agregue funciones no listadas en la Sección 3 requerirá un formato escrito de "Solicitud de Cambio de Alcance".
2. **Evaluación de Impacto:** Por cada nueva función solicitada, el desarrollador presentará el impacto estimado en días adicionales de trabajo.
3. **Ajuste de Calendario:** Si se aprueba una nueva función, la fecha de entrega final se prorrogará proporcionalmente o se sustituirá un requerimiento existente de igual peso para mantener la fecha original.

---

### 7. FORMALIZACIÓN Y FIRMAS DE CONFORMIDAD

Las partes manifiestan que han revisado a detalle los requerimientos, los criterios de aceptación y el cronograma estipulado en este documento, estando de acuerdo en que el cumplimiento de los mismos acredita la entrega satisfactoria del proyecto de software.

<br><br><br>

| __________________________________________ | __________________________________________ |
| :---: | :---: |
| **[Nombre del Alumno / Desarrollador]** | **[Nombre de la Maestra / Asesora]** |
| Alumno Desarrollador | Docente Asesora / Revisora |
| Fecha: ____ / ____ / 2026 | Fecha: ____ / ____ / 2026 |

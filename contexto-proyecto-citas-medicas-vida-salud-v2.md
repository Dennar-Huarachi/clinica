---
name: proyecto-citas-medicas-vida-salud
description: Contexto base del proyecto "Sistema Web de Gestión de Citas Médicas" para la Clínica Vida Salud (Examen Parcial II, Ing. de Requisitos). Incluye el enunciado escrito, las aclaraciones de la docente en clase (19/10/2026) y, en la sección 12, las decisiones del equipo con los RF14–RF22 y RN15–RN22 derivados. Los casos de uso están en el archivo aparte casos-de-uso-citas-medicas-vida-salud-v3.md. Usar como referencia al analizar, diseñar, programar, probar o documentar el sistema.
---

# Sistema Web de Gestión de Citas Médicas — Clínica Vida Salud

> **Cómo usar este archivo:** es el contexto base del proyecto. Antes de responder, lee todo el documento. Los requisitos (RF01–RF13 del enunciado y RF14–RF22 derivados en 12.6), las reglas de negocio (RN01–RN14 del enunciado y RN15–RN22 derivadas en 12.7), los roles, los estados y las restricciones técnicas son la fuente de verdad. Los casos de uso están en el archivo aparte `casos-de-uso-citas-medicas-vida-salud-v3.md`. Si una petición contradice algo de aquí, avísalo antes de continuar. Si algo no está definido, pregunta o propón una opción marcándola como suposición.
>
> **Orden de prioridad cuando haya conflicto entre fuentes:**
> 1. **Sección 12 — Decisiones y notas del equipo** (lo que decidió el grupo).
> 2. **Sección 11 — Aclaraciones de la docente** (explicación en clase del 19/10/2026).
> 3. **Secciones 0 a 10 — Enunciado escrito del examen.**

## 0. Datos generales

| Dato | Valor |
|---|---|
| Materia | Ingeniería de Requisitos (SC) — Segundo Examen Parcial |
| Docente | MSc. Ing. Angélica Gazón Cuéllar |
| Proyecto | Sistema web para la gestión de citas médicas en una clínica privada (ficticia) |
| Stack | PHP (backend), PostgreSQL, HTML5, CSS3, JavaScript opcional |
| Duración | 4 semanas |
| Modalidad de trabajo | Parejas (2 estudiantes por grupo); el grupo se asigna por número en la plataforma |
| Tipo de sistema | Aplicación web (no app móvil), *responsive*: debe poder usarse desde el celular |
| Metodología / documentación | PUDS-UML (flujos de trabajo: captura de requisitos, análisis, diseño, implementación y pruebas) |
| Enunciado original | https://presencial.uagrm.edu.bo/draftfile.php/878/user/draft/945347100/SegundoExamenParcial%20Sistemas%20de%20Informacion%20I%20SA.pdf |

---

## 1. Descripción del caso de estudio

### 1.1. Nombre del proyecto
Desarrollo de un sistema web para la gestión de citas médicas en una clínica privada.

### 1.2. Antecedentes
La Clínica Vida Salud es un establecimiento médico ficticio que brinda atención en medicina general, pediatría, ginecología y odontología.

Actualmente administra sus citas con cuadernos, llamadas telefónicas y hojas de cálculo, lo que dificulta organizar los horarios de los médicos, controlar las citas programadas y mantener actualizada la información de los pacientes.

La **recepción** registra pacientes, consulta la disponibilidad de los médicos, programa las citas y comunica a los pacientes la fecha y hora de atención.

**Problemas actuales (por el registro manual):**
- Duplicación de citas para un mismo médico y horario.
- Pérdida o registro incorrecto de datos de pacientes.
- Dificultad para conocer los horarios disponibles de los médicos.
- Falta de control sobre citas canceladas e inasistencias.
- Demoras en la búsqueda del historial de citas de un paciente.
- Dificultad para obtener reportes de las atenciones programadas.
- Falta de información actualizada para la administración de la clínica.

La dirección decidió implementar un sistema web que centralice la información y automatice los principales procesos de gestión de citas.

### 1.3. Planteamiento del problema
¿Cómo desarrollar un sistema web con PHP y PostgreSQL que permita administrar pacientes, médicos, especialidades y citas médicas, evitando conflictos de horarios y facilitando el control de las atenciones de la Clínica Vida Salud?

### 1.4. Objetivo general
Desarrollar un sistema web de gestión de citas médicas con PHP (servidor) y PostgreSQL (SGBD), para mejorar el registro, la programación, el seguimiento y el control de las citas médicas.

### 1.5. Objetivos específicos
- Analizar los procesos de registro y programación de citas de una clínica.
- Diseñar una base de datos relacional con tablas relacionadas mediante claves primarias y foráneas.
- Implementar formularios para registro, consulta, modificación y desactivación de pacientes y médicos.
- Gestionar las especialidades médicas y los horarios de atención.
- Programar citas verificando la disponibilidad del médico.
- Controlar los estados de las citas médicas.
- Generar reportes de citas por fecha, médico, especialidad y estado.
- Aplicar validaciones de datos y mecanismos básicos de seguridad.
- Realizar pruebas para verificar el correcto funcionamiento del sistema.

---

## 2. Alcance del sistema

Aplicación web accesible desde navegador, desarrollada con PHP, PostgreSQL, HTML y CSS. Puede usar JavaScript para mejorar la interacción de los formularios. Está destinada **principalmente al personal administrativo** de la clínica.

> ⚠️ **Matiz de la docente (sección 11):** en clase explicó que el **paciente** es el usuario que más interactúa con la aplicación y que tiene login propio (reserva, cancela, ve su historial). Implementar también el acceso del paciente.

**El sistema SÍ deberá permitir:**
- Registrar y consultar pacientes.
- Registrar médicos y sus especialidades.
- Definir horarios de atención.
- Consultar disponibilidad de citas.
- Registrar, reprogramar y cancelar citas.
- Registrar la asistencia o inasistencia del paciente.
- Consultar el historial de citas.
- Generar reportes administrativos.
- Administrar usuarios y permisos básicos.

> La delimitación busca que se logre una aplicación funcional en cuatro semanas sin funcionalidades que excedan el nivel esperado.

---

## 3. Usuarios del sistema (roles)

Los cuatro roles principales son **Administrador, Recepcionista, Médico y Paciente** (el paciente se describe en 3.4; la docente detalló sus funciones en clase, ver sección 11.7).

Cada usuario inicia sesión con **nombre de usuario o correo electrónico y contraseña**. Las opciones disponibles dependen de su rol.

### 3.1. Administrador
Configura y supervisa el sistema.
- Registrar y administrar usuarios.
- Asignar roles.
- Registrar médicos y especialidades.
- Consultar los reportes generales.
- Activar o desactivar registros.

### 3.2. Recepcionista
Gestiona las citas de los pacientes.
- Registrar nuevos pacientes.
- Buscar pacientes existentes.
- Consultar médicos y horarios disponibles.
- Programar, reprogramar y cancelar citas.
- Registrar asistencia e inasistencia.
- Consultar citas por fecha y estado.

### 3.3. Médico
Consulta su agenda de atención.
- Consultar las citas asignadas.
- Visualizar los datos básicos necesarios del paciente.
- Consultar la fecha y hora de cada cita.
- Identificar citas pendientes, atendidas y canceladas.
- Marcar una cita como atendida, si ese permiso le ha sido asignado.

### 3.4. Perfil de pacientes (app de citas médicas)
El perfil del paciente es el espacio donde cada usuario registra sus datos personales, administra su información médica y gestiona sus citas desde la aplicación.

| Sección | Campos principales |
|---|---|
| Datos personales | Nombre completo, documento de identidad, fecha de nacimiento y sexo (si es necesario) |
| Contacto | Teléfono, correo electrónico y dirección |
| Información médica | Tipo de sangre, alergias, enfermedades crónicas, medicamentos y antecedentes relevantes |
| Contacto de emergencia | Nombre, parentesco y teléfono |
| Gestión de citas | Especialidad, médico, fecha, hora, modalidad y estado de la cita |
| Cuenta | Contraseña, notificaciones y preferencias de privacidad |

### 3.5. Funcionalidades principales (lado paciente)
- **Registro e inicio de sesión:** acceso seguro para cada paciente.
- **Edición del perfil:** actualización de datos personales y de contacto.
- **Reserva de citas:** búsqueda de médicos por especialidad, ubicación y disponibilidad.
- **Seguimiento de citas:** pendientes, confirmadas, completadas y canceladas.
- **Recordatorios automáticos:** avisos de próximas consultas.
- **Historial médico:** acceso autorizado a información clínica relevante.
- **Seguridad:** protección de datos sensibles y control de acceso.

---

## 4. Requerimientos funcionales

### RF01. Inicio de sesión y control de acceso
Permitir que los usuarios autorizados ingresen con sus credenciales.

Funciones:
- Validar usuario y contraseña.
- Iniciar una sesión segura.
- Identificar el rol del usuario.
- Mostrar un menú según los permisos correspondientes.
- Cerrar la sesión.
- Impedir el acceso a páginas internas cuando no exista una sesión válida.

Las contraseñas se almacenan con un hash seguro de PHP (`password_hash()`) y se verifican con `password_verify()`.

### RF02. Gestión de pacientes

| Campo | Descripción |
|---|---|
| Código | Identificador único del paciente |
| CI | Documento de identidad, único cuando corresponda |
| Nombres | Nombres del paciente |
| Apellidos | Apellidos del paciente |
| Fecha de nacimiento | Fecha de nacimiento |
| Sexo | Dato demográfico, según el formulario definido |
| Teléfono | Número de contacto |
| Correo electrónico | Correo de contacto, opcional |
| Dirección | Domicilio, opcional |
| Estado | Activo o inactivo |

Operaciones requeridas:
- Registrar un paciente.
- Listar los pacientes.
- Buscar por CI, nombre o apellido.
- Modificar sus datos.
- Consultar sus citas anteriores.
- Desactivar un registro sin eliminar el historial asociado.

**Regla:** no se permite registrar dos pacientes con el mismo documento de identidad cuando este sea el identificador proporcionado.

### RF03. Gestión de médicos

Campos mínimos:
- Código del médico.
- Número de registro profesional.
- Nombres y apellidos.
- Teléfono.
- Correo electrónico.
- Especialidad o especialidades.
- Estado: activo o inactivo.

Operaciones:
- Registrar médicos.
- Consultar el listado de médicos.
- Buscar por nombre o especialidad.
- Modificar sus datos.
- Consultar su agenda.
- Activar o desactivar médicos.

Un médico inactivo **no** puede recibir nuevas citas, pero sus citas históricas se conservan.

### RF04. Gestión de especialidades médicas
Administrar las especialidades que ofrece la clínica. Ejemplos: Medicina general, Pediatría, Ginecología, Odontología, Cardiología.

Cada especialidad tiene identificador, nombre, descripción opcional y estado. No se permite registrar dos especialidades con el mismo nombre normalizado.

### RF05. Gestión de horarios de atención
El administrador registra los horarios de disponibilidad de cada médico.

| Médico | Día | Hora inicial | Hora final |
|---|---|---|---|
| Médico A | Lunes | 08:00 | 12:00 |
| Médico A | Miércoles | 14:00 | 18:00 |
| Médico B | Martes | 09:00 | 13:00 |

Debe permitir definir la duración de cada cita (por ejemplo, 30 minutos) y calcular los horarios disponibles.

> Nota de la docente (sección 11.3): el tiempo típico por paciente es de **15 minutos** y puede variar según la especialidad, por lo que la duración debe ser configurable.

Reglas:
- La hora final debe ser posterior a la hora inicial.
- No se permiten horarios inválidos.
- No se ofrecen citas fuera del horario de atención.
- No se ofrecen citas en fechas pasadas.
- Las citas deben respetar los intervalos configurados.
- Los feriados o bloqueos pueden excluirse de la agenda si el tiempo de desarrollo lo permite (opcional).

### RF06. Registro de citas médicas
**Módulo principal del proyecto.**

Para registrar una cita, la recepcionista selecciona:
- El paciente.
- La especialidad.
- El médico.
- La fecha de la cita.
- La hora disponible.
- Un motivo breve de la consulta (opcional).

El sistema genera un **código único de cita** y registra la fecha de creación. Tras elegir médico y fecha, se muestran **únicamente los horarios disponibles**. Al guardar, el sistema **comprueba de nuevo la disponibilidad** antes de confirmar.

Ejemplo (ficticio) de formato de registro:

```
Cita médica CM-0001 — Programada
Paciente:      María López
Especialidad:  Medicina general
Médico:        Dr. Juan Pérez
Fecha:         15/11/2026
Horario:       09:00–09:30
Motivo:        Consulta general
```

### RF07. Prevención de citas duplicadas
Impedir que un médico tenga dos citas incompatibles en el mismo horario.

Ejemplo:
- El médico tiene una cita de 09:00 a 09:30.
- Otro usuario intenta programar otra para el mismo médico de 09:00 a 09:30.
- El sistema rechaza la segunda operación y muestra un mensaje explicativo.

También debe evitar que una cita exceda el horario de atención. Para un alcance básico se pueden usar bloques fijos (30 minutos en el enunciado; la docente habló de 15 minutos típicos, ver 11.3); si se permiten duraciones variables, se debe comprobar que los intervalos no se superpongan.

La validación se hace **en el servidor** y, de ser posible, se protege también con **transacciones y restricciones de base de datos** apropiadas.

### RF08. Reprogramación de citas
La recepcionista puede cambiar la fecha y hora de una cita programada. El sistema debe:
- Recuperar los datos de la cita.
- Mostrar las nuevas fechas y horas disponibles.
- Verificar que el médico pueda atender en el nuevo horario.
- Evitar conflictos con otras citas.
- Guardar la modificación.
- Mantener la integridad de la información.

Una cita atendida o cancelada no puede reprogramarse directamente; se aplica una política definida por el sistema.

### RF09. Cancelación de citas
Permitir cancelar citas programadas. Al cancelar, registrar el estado y, preferiblemente, el motivo de cancelación.

Reglas:
- No se elimina físicamente el registro de la cita.
- Una cita cancelada deja de ocupar el horario.
- La cita permanece disponible para consultas históricas.
- Una cita atendida no puede cancelarse como si nunca hubiera ocurrido.

### RF10. Control de asistencia (estados de la cita)

| Estado | Significado |
|---|---|
| Programada | La cita está reservada |
| Confirmada | Se ha confirmado la asistencia |
| Atendida | La consulta se realizó |
| Cancelada | La cita fue cancelada |
| Inasistencia | El paciente no se presentó |

Se deben implementar las **transiciones de estado** y controlar qué acciones son válidas en cada situación. Ejemplo: una cita cancelada no puede marcarse como atendida sin un procedimiento autorizado.

### RF11. Consulta de agenda médica
Consultar la agenda de un médico para una fecha específica. Información mostrada:
- Hora de la cita.
- Código de cita.
- Nombre del paciente.
- Especialidad.
- Estado.
- Motivo breve, si corresponde y si el usuario tiene permiso para verlo.

Debe permitir filtrar por médico, fecha y estado.

### RF12. Historial de citas por paciente
Al consultar un paciente, mostrar el historial de sus citas:
- Fecha y hora.
- Médico asignado.
- Especialidad.
- Estado de la cita.
- Fecha de registro.

Debe incluir citas pasadas y canceladas sin perder la trazabilidad.

### RF13. Reportes
Como mínimo:
- Citas programadas para una fecha.
- Citas por médico.
- Citas por especialidad.
- Citas por estado.
- Pacientes registrados.
- Cantidad de citas atendidas, canceladas e inasistencias dentro de un período.
- Agenda diaria de cada médico.

Los reportes deben permitir filtrar por fecha o rango de fechas y mostrar totales cuando corresponda. **Mejora opcional:** exportar un reporte a CSV o PDF.

---

## 5. Reglas del negocio

Se aplican independientemente de lo que el usuario escriba en los formularios.

| ID | Regla |
|---|---|
| RN01 | Cada paciente tendrá un identificador único. |
| RN02 | Cada médico tendrá un identificador único. |
| RN03 | Una cita deberá estar asociada a un paciente y a un médico válidos. |
| RN04 | El médico deberá estar activo para recibir nuevas citas. |
| RN05 | La cita deberá pertenecer al horario de atención del médico. |
| RN06 | No se podrán registrar citas en fechas pasadas. |
| RN07 | Un médico no podrá tener citas superpuestas. |
| RN08 | La duración de la cita deberá respetar la configuración del sistema. |
| RN09 | Las citas canceladas no ocuparán disponibilidad. |
| RN10 | Las citas atendidas conservarán su registro histórico. |
| RN11 | No se eliminarán pacientes o médicos con citas históricas asociadas; se desactivarán. |
| RN12 | Solo los usuarios autorizados podrán realizar cada operación. |
| RN13 | Las operaciones de programación y reprogramación deberán verificar la disponibilidad en el servidor. |
| RN14 | Los datos se almacenarán de forma persistente en PostgreSQL. |

---

## 6. Diseño preliminar de la base de datos

Se debe diseñar un **diagrama de clases** y luego implementarlo en PostgreSQL.

Relaciones principales:
- Un paciente puede tener muchas citas.
- Un médico puede atender muchas citas.
- Un médico puede tener una o varias especialidades.
- Una especialidad puede estar asociada a varios médicos.
- Un médico puede tener varios horarios de atención.
- Un usuario inicia sesión y accede a las operaciones permitidas por su rol.

---

## 7. Requerimientos técnicos

- **Backend:** PHP.
- **Base de datos:** PostgreSQL.
- **Conexión:** PDO con el controlador `pdo_pgsql` (o alternativa aprobada por el docente).
- **Frontend:** HTML5 y CSS3.
- **JavaScript:** opcional, para validaciones de interfaz y usabilidad.
- **Servidor local:** Apache mediante XAMPP compatible con la configuración elegida, o entorno PHP equivalente.
- Consultas SQL **parametrizadas** (evitar inyección SQL).
- Validación de datos **en cliente y en servidor**.
- **Sesiones** para controlar el acceso.
- Manejo de errores **sin mostrar credenciales ni detalles internos** al usuario.
- Base de datos **normalizada**, evitando duplicaciones innecesarias.
- Separación razonable entre interfaz, lógica de negocio y acceso a datos.

---

## 8. Pruebas mínimas a demostrar

| N.º | Prueba | Resultado esperado |
|---|---|---|
| 1 | Registrar un paciente nuevo | El paciente queda guardado |
| 2 | Registrar un paciente con CI duplicado | El sistema rechaza el duplicado |
| 3 | Programar una cita en horario disponible | La cita queda registrada |
| 4 | Programar otra cita superpuesta para el mismo médico | El sistema impide el conflicto |
| 5 | Intentar reservar fuera del horario médico | El sistema rechaza la cita |
| 6 | Cancelar una cita | Cambia a estado cancelado y conserva el historial |
| 7 | Consultar el historial de un paciente | Aparecen sus citas registradas |
| 8 | Buscar las citas de un médico por fecha | Se muestran los resultados correctos |
| 9 | Ingresar a una página interna sin iniciar sesión | El acceso es denegado |
| 10 | Intentar ejecutar una operación con datos inválidos | El servidor valida y rechaza la operación |

**Criterios de calidad del sistema:**
- Diseño profesional.
- Validaciones en JavaScript y PHP.
- Manejo correcto de errores.
- Comentarios en el código.
- Buenas prácticas de programación.

---

## 9. Documentación a entregar

**Carátula:** título de la app web, n.º de grupo, integrantes, etc.

**Tabla de contenido** (índice actualizado en cada presentación).

1. **Perfil**
   - 1.1 Introducción
   - 1.2 Objetivos (general y específicos)
   - 1.3 Descripción del problema
   - 1.4 Alcance
2. **Marco teórico**
3. **Modelo de negocio**
4. **FT Captura de requisitos**
5. **FT Análisis**
6. **FT Diseño**
   - 6.1 Diseño de arquitectura (física y lógica)
   - 6.2 Diseño de casos de uso (diagrama de secuencia)
   - 6.3 Diseño de datos (lógico y físico)
7. **FT Implementación**
   - 7.1 Herramientas de desarrollo de la aplicación web
   - 7.2 Implementación de la arquitectura del sistema
   - 7.3 Implementación de la arquitectura de subsistemas
8. **FT Pruebas**

Cierre: **Conclusión**, **Recomendación**, **Bibliografía**, **Anexos**.

**Código fuente:** organizado y comentado, publicado en GitHub. Entregar **URL + código QR** del repositorio.

---

## 10. Cronograma y entregas

| Hito | Fecha | Condición |
|---|---|---|
| Inicio del examen | Miércoles 14/10/2026 | — |
| **Presentación 1** | Sábado 24/10/2026, 23:59 | Avance ≥ 50 % (Ciclo #1) |
| **Presentación 2** | Domingo 07/11/2026, 23:59 | Completo 100 % (Ciclo #2) |
| **Defensa** | Lunes 09/11/2026, 7:00 AM | — |

- Las **dos presentaciones son obligatorias**: son requisito para ser habilitado a la defensa.
- Enviar a la plataforma el documento **PUDS-UML** (FT: captura de requisitos, análisis, diseño, implementación y pruebas).

---

## 11. Aclaraciones de la docente (clase del 19/10/2026)

> **Fuente:** transcripción automática del audio de la explicación de la docente (puede contener errores de palabras). La transcripción empieza y termina cortada: cubre el contexto general, el alcance, los roles y hasta el RF06 (registro de citas). **Lo dicho sobre RF07–RF13, requisitos técnicos, pruebas y documentación no está incluido.** Estas aclaraciones tienen prioridad sobre el enunciado escrito; el equipo puede decidir otra cosa en la sección 12.

### 11.1. Organización y entrega
- Se trabaja en **parejas** (2 estudiantes). La plataforma habilita la asignación al grupo con el número correspondiente.
- La **Presentación 1** es ese mismo fin de semana (sábado 24/10/2026).
- El nombre de la clínica es libre: la docente usó "Vida Salud", pero el grupo puede ponerle otro.
- Lo del enunciado es el **mínimo**. Cada grupo personaliza y agrega aportes propios (más especialidades, más funcionalidades), siempre dentro del contexto del caso de estudio.
- Es un **sistema web, no móvil**, pero *responsive*, para poder navegarlo desde el celular (como se presentó en el Ciclo 2). **PHP** en backend y frontend, **PostgreSQL** como base de datos, aproximadamente **4 semanas**.

### 11.2. Enfoque del proyecto
- El sector es salud; el centro de atención son las **citas médicas** entre paciente, médico, especialidades y horarios. Tratamiento e historia clínica están relacionados ("si quieren verlo").
- La docente reconoce que una clínica completa es muy grande; el foco es el módulo de citas.
- Las interacciones principales con el usuario son **formularios, consultas y reportes**.
- La base de datos se diseña según el tamaño de las funcionalidades que se implementen.

### 11.3. Médicos, especialidades y horarios
- **Cada médico debe tener especialidad** (muy importante) y puede tener más de una (ejemplo: médico general y también cardiólogo).
- Las más típicas: **pediatría** (niños), **medicina general** (adultos) y **geriatría** (adulto mayor). Cada grupo puede agregar más.
- Cada médico tiene un **horario de atención establecido**.
- **Duración típica por paciente: 15 minutos** → 4 pacientes por hora. Ejemplo: de 10:00 a 12:00 son 2 horas = **8 fichas**.
- Si una consulta dura 30 minutos o más, ya no caben 4 por hora: depende del tipo de especialidad. La duración debe ser **configurable**.
- Al sacar ficha, **solo deben aparecer los horarios disponibles**.

### 11.4. Concurrencia y validaciones
- Si varios pacientes piden el mismo horario a la vez, **queda registrado el primero en ser recibido**. Al siguiente se le informa que ya no hay cupo y debe elegir otro horario libre. Si ya no queda ninguno, no se puede sacar ficha ese día para ese médico.
- Estas verificaciones se hacen **en el backend**; sin ellas no se puede evitar fichas duplicadas ni dos pacientes en el mismo horario.
- Al programar una cita se verifica la disponibilidad del médico.
- Frase de la docente: sin validaciones el sistema dejaría de ser un software y sería solo una planilla de Excel; las validaciones dan la confiabilidad.

### 11.5. Cancelación, reprogramación y contingencias del médico
- El **paciente puede cancelar su cita desde el sistema**. Al cancelar, el horario **queda libre de inmediato** para otro paciente que lo necesite.
- Si el paciente no puede hacerlo en línea, va a **recepción** y la recepcionista **reprograma**.
- **Emergencias o cirugías del médico:** el sistema debe **avisar al paciente por anticipado** (notificación push, correo u otro medio) que se cancelaron las citas de ese horario (ejemplo: martes de 10 a 12 con el doctor tal) y a qué nueva fecha queda (ejemplo: jueves de 10 a 12). Así el paciente no va a la clínica para enterarse allá.
- Cuando se suspende el horario de un día, las citas quedan **pendientes** y no se reciben más pacientes para ese día. La docente indicó que normalmente esto se va habilitando en **24 o 48 horas** por posibles inconvenientes (interpretación a confirmar).

### 11.6. Estados y asistencia
- Ejemplos de estados mencionados por la docente: **libre, ocupado, reservado, postergado** ("como ustedes lo quieran manejar"). El enunciado define los estados de la cita en RF10.
- **Tener una cita registrada no significa que fue atendido.** Ejemplo: de 8 citas del médico, 6 se atendieron y 2 no asistieron. Los reportes deben mostrar de todos los pacientes registrados quiénes asistieron y quiénes no.
- El **historial de citas** es lo más importante: de él salen cuántos médicos, horarios y especialidades hay, y alimenta los reportes.
- **Pacientes activos/inactivos** ("pasivos"): un paciente puede dejar de ser atendido porque se mudó de ciudad o cambió de médico.

### 11.7. Roles según la docente
- **Administrador:** superusuario, el único con visibilidad de todo el sistema. Crea perfiles, asigna privilegios y define las restricciones. Registra y administra usuarios, médicos, especialidades; consulta reportes.
- **Recepcionista:** atiende lo que **no se puede hacer desde la web**. Algunos médicos o especialidades no están habilitados para reservar en línea (ejemplos de la docente: endocrinología, fisioterapia); el paciente va a la clínica y la recepcionista ve la disponibilidad, programa o reprograma. Funciones: registrar pacientes nuevos o existentes, consultar médicos, programar, reprogramar y cancelar citas, registrar asistencia, consultar citas por fecha y estado.
- **Médico:** tiene un **kardex digital** con sus pacientes asignados. Solo ve **sus propios pacientes** y su historial clínico, no los de otros médicos. Consulta fecha y hora de cada cita, identifica pendientes, atendidas y canceladas, y marca una cita como atendida.
- **Paciente:** es quien más interactúa con la app. Se asigna a la ficha o especialidad que necesita. Su perfil incluye datos personales, contacto, información básica, contacto de emergencia, gestión de citas y su cuenta. Puede reservar citas, hacer seguimiento, recibir recordatorios y ver su **historial clínico** (es suyo).
- **Todos los roles inician sesión** con nombre de usuario (o correo) y contraseña.

### 11.8. Historia clínica y resultados de laboratorio (ejemplo de la docente)
- Los laboratorios envían los resultados de los estudios al **paciente y al médico**; esa información debe quedar **enlazada** con ambos y dentro del historial del paciente en la clínica.
- Así el paciente no lleva papeles físicos a la consulta y el médico puede indicar el tratamiento o las vitaminas necesarias.
- Alcance a confirmar (ver 12.4): el enunciado escrito no tiene un RF específico para esto.

### 11.9. Seguridad, reportes y pruebas
- Seguridad mínima obligatoria: las **contraseñas deben estar hasheadas/encriptadas** para que nadie pueda alterarlas.
- Reportes: **por cita, fecha, médico, especialidad y estado**, incluyendo asistencia vs. inasistencia.
- Cada requisito funcional debe verificarse con pruebas.

### 11.10. Diferencias entre el enunciado escrito y la explicación de la docente

| Tema | Enunciado escrito | Docente (clase) | Cómo tratarlo |
|---|---|---|---|
| Usuario principal | Personal administrativo | El paciente es quien más interactúa, con login propio | Implementar acceso de paciente |
| Duración de la cita | Ejemplo de 30 min, bloques fijos de 30 min | Típico 15 min; depende de la especialidad | Duración configurable por médico o especialidad |
| Especialidades de ejemplo | Medicina general, pediatría, ginecología, odontología, cardiología | Pediatría, medicina general, geriatría (más las que agregue el grupo) | Lista libre, personalizable |
| Estados | Programada, Confirmada, Atendida, Cancelada, Inasistencia | Libre, ocupado, reservado, postergado (a criterio del grupo) | Decidido en 12.2 (D2): 6 estados de cita; libre/ocupado/reservado son estados del turno, derivados |
| Aviso por suspensión del médico | No hay RF | El sistema debe avisar al paciente por anticipado | Agregar como funcionalidad |
| Reserva en línea | Todo vía recepción | Algunas especialidades solo presenciales (recepción) | Marcar especialidades reservables en línea (ver 12.2, D4) |
| Historia clínica y laboratorio | Solo se menciona "historial médico" | Resultados enlazados a paciente y médico | Opcional (RF19); alcance a confirmar en 12.4 |

---

## 12. Decisiones y notas del equipo

> Esta sección tiene prioridad sobre el enunciado y las aclaraciones. Las secciones 0 a 11 se conservan tal como vienen de las fuentes; todo lo nuevo se agrega aquí. Las decisiones marcadas **(suposición)** se propusieron para poder avanzar y deben confirmarse con tu pareja de grupo y, si corresponde, con la docente.
>
> Los casos de uso se mantienen en un archivo aparte (`casos-de-uso-citas-medicas-vida-salud-v3.md`): este archivo es la fuente (enunciado, docente y decisiones) y aquel es el catálogo derivado, con su propio ciclo de cambios.

### 12.1. Datos del equipo
- Grupo n.º: _
- Integrantes: _
- Repositorio GitHub: _

### 12.2. Decisiones de diseño tomadas

| ID | Decisión | Estado |
|---|---|---|
| D1 | **Modelo híbrido:** el sistema se usa por dos vías, la ventanilla (recepción) y el portal web del paciente. La frase de la sección 2 ("principalmente al personal administrativo") se lee con este matiz. | Adoptada (11.7) |
| D2 | **Estados de la cita:** seis, **Programada, Confirmada, Atendida, Cancelada, Inasistencia y Postergada**. Los estados que mencionó la docente (libre, ocupado, reservado) no son estados de la cita: describen el turno y se derivan al calcular la disponibilidad, no se guardan. | Suposición |
| D3 | **Duración del turno:** configurable. Cada especialidad tiene una duración por defecto (por ejemplo, 15 min) que se puede ajustar por médico u horario. | Adoptada (11.3) |
| D4 | **Canal de reserva:** cada especialidad tiene la marca "reservable en línea". Recepción puede gestionar todas las especialidades. La marca por médico queda como mejora opcional. | Adoptada (11.7) |
| D5 | **Cancelación en línea del paciente:** exige una anticipación mínima configurable (por defecto 2 horas, ver RN15). Recepción cancela sin límite. | Suposición |
| D6 | **Citas cerradas** (Atendida, Cancelada, Inasistencia): no vuelven a un estado activo (RN16). La única corrección es Atendida ⇄ Inasistencia, hecha por el Administrador con motivo y bitácora. Una cita Cancelada no se reactiva: se programa una nueva. Este es el "procedimiento autorizado" de RF10. | Suposición |
| D7 | **Citas postergadas:** tienen prioridad de reubicación sobre la reserva pública (RN17), durante una ventana configurable (por defecto 48 h, a partir de la regla de 24 o 48 h que mencionó la docente). | Suposición |
| D8 | **Vincular cuenta con ficha existente** (CU-03): el CI no basta. Deben coincidir también la fecha de nacimiento y el teléfono registrados; si no coinciden, el paciente acude a recepción y el sistema no revela qué dato falló. | Suposición |
| D9 | **Consulta de disponibilidad:** requiere sesión iniciada. No hay consulta pública para visitantes sin cuenta. | Suposición |
| D10 | **Feriados y bloqueos de la clínica:** opcionales, dentro de CU-09 (RN20). Las citas ya registradas en esas fechas se resuelven con CU-11. | Adoptada (RF05, opcional) |
| D11 | **Notificaciones:** como mínimo, un mensaje dentro del sistema visible al iniciar sesión. Correo o push solo si alcanza el tiempo. | Adoptada como mínimo |
| D12 | **Bloqueo por inasistencias reiteradas:** descartado por ahora. No viene del enunciado ni de la docente y agrega contador, bloqueo y desbloqueo. Queda como mejora futura. | Descartada |
| D13 | **Casos de uso:** 26 casos (19 base y 7 opcionales), en 2 ciclos y 6 paquetes (archivo de casos de uso v3). El Ciclo 1 reúne 13 casos y es el que va en la Presentación 1. | Adoptada |
| D14 | **Casos propios opcionales:** CU-24 (bitácora de auditoría), CU-25 (dashboard administrativo) y CU-26 (copias de seguridad). No vienen del enunciado ni de la docente: son aportes del grupo (11.1) y no cambian el mínimo de 19 casos base y 1 opcional. | Suposición |

### 12.3. Estado de avance
- Catálogo de casos de uso v3 definido (26 casos: 19 base y 7 opcionales).
- Contexto y decisiones de diseño actualizados en esta sección.
- **Presentación 1 (24/10/2026, Ciclo 1):** CU-01 a CU-05, CU-07 a CU-10 y CU-12 a CU-15 (13 casos: el 56 % de los 23 casos sin los aportes propios, el 50 % de los 26).
- **Presentación 2 (07/11/2026, Ciclo 2):** CU-06, CU-11, CU-16 a CU-26.
- Diseño de base de datos, implementación y documento PUDS: _ (completar con el avance real)

### 12.4. Pendientes por definir
- **Confirmar las suposiciones** de 12.2 con tu pareja y, si se puede, con la docente. Las que más pesan en el diseño son D2 (estados), D5 (cancelación en línea), D6 (citas cerradas) y D7 (prioridad de postergadas).
- **Valores finales de los parámetros:** anticipación mínima para cancelar en línea (RN15, hoy 2 horas) y ventana de prioridad de las postergadas (RN17, hoy 48 horas).
- **Historia clínica y resultados de laboratorio** (RF19): definir hasta dónde se implementa. CU-17 (kardex) es base; CU-18 a CU-20 son opcionales.
- **Cuál será el caso opcional que completa los 20:** recomendación, CU-23 (exportar reportes), porque es el más barato y no depende de la historia clínica. Alternativas baratas porque usan datos que ya existen: CU-24 (bitácora) y CU-25 (dashboard). CU-18 y CU-20 si sobra tiempo.
- **Avance del 50 % en la Presentación 1:** con 26 casos, el Ciclo 1 queda en 13 de 26. Confirmar si el avance se mide por casos o de forma general; si fuera por casos, mover CU-24 al Ciclo 1 sube el avance a 14 de 26.
- **Notificaciones:** si se implementa algún canal además del mensaje dentro del sistema (correo o push).
- **Reprogramación en línea por el paciente:** hoy solo la hace recepción.
- **Marca "reservable en línea" por médico:** hoy solo existe por especialidad (D4). La docente habló de "médicos o especialidades".
- **Modalidad de cita** (presencial/virtual) y búsqueda por ubicación: aparecen en 3.4–3.5 pero no en los RF.
- **Duraciones variables** dentro de un mismo horario (opcional).
- La transcripción del audio está incompleta (llega solo hasta RF06); si hay más explicación de la docente, agregarla a la sección 11.

### 12.5. Convenciones del proyecto
- Nombres de tablas y campos de la base de datos **en español** (definido en el catálogo de casos de uso).
- Nombres en minúsculas, con guion bajo y sin tildes ni eñes, por ejemplo `fecha_nacimiento` (suposición).
- Los estados de la cita se guardan como valores controlados (catálogo o tipo enumerado) e incluyen `postergada` desde el primer esquema, aunque se use recién en el Ciclo 2 (suposición).
- Código de cita con el formato del ejemplo de RF06: `CM-0001`.
- Usar los mismos identificadores CU, RF y RN en el documento PUDS, los diagramas, el código y las pruebas.
- Estructura de carpetas y estilo de código: _ (pendiente)

### 12.6. Requisitos derivados (RF14–RF22)
Completan los RF01–RF13. RF14–RF19 salen de lo que la docente agregó en clase. RF20–RF22 son aportes propios del grupo (opcionales). No cambian la numeración original.

| ID | Requisito | Casos de uso | Origen | Alcance |
|---|---|---|---|---|
| RF14 | **Cuenta y perfil del paciente:** registro propio, vinculación con una ficha creada antes en recepción, edición de contacto, información médica declarada, contacto de emergencia y preferencias. | CU-03, CU-05, CU-06 | 3.4, 3.5, 11.7 | Base |
| RF15 | **Reserva y cancelación en línea por el paciente**, solo en especialidades habilitadas para ese canal y solo sobre sus propias citas. | CU-07, CU-10, CU-12 | 11.5, 11.7 | Base |
| RF16 | **Suspensión de horario y reubicación de citas afectadas:** al suspender un horario las citas quedan Postergadas y se reubican con prioridad. | CU-11 (con CU-10 y CU-16) | 11.5 | Base |
| RF17 | **Notificaciones y recordatorios** al paciente (suspensiones, reubicaciones, cancelaciones hechas por el personal, próximas citas). | CU-16 | 3.5, 11.5 | Base |
| RF18 | **Kardex digital del médico:** listado de sus pacientes asignados con sus datos básicos y sus citas. | CU-17 | 11.7 | Base |
| RF19 | **Historia clínica y resultados de laboratorio:** registro de la atención y de los resultados, vinculados al paciente y al médico, y consulta autorizada. | CU-18, CU-19, CU-20 | 11.2, 11.8 | Opcional |
| RF20 | **Bitácora de auditoría:** consulta, por parte del Administrador, de los eventos relevantes del sistema (sesiones, usuarios y roles, cambios de estado de citas, suspensiones, respaldos). | CU-24 | Aporte propio (apoya 11.6, trazabilidad) | Opcional |
| RF21 | **Dashboard administrativo:** indicadores de citas, asistencia y ocupación de turnos para un período, con acceso a los reportes detallados. | CU-25 | Aporte propio (se alimenta de RF13) | Opcional |
| RF22 | **Copias de seguridad:** generar y restaurar copias de la base de datos, solo por el Administrador. | CU-26 | Aporte propio (apoya RN14) | Opcional |

### 12.7. Reglas de negocio derivadas (RN15–RN22)
Completan las RN01–RN14. Los valores marcados como suposición se confirman en 12.4.

| ID | Regla |
|---|---|
| RN15 | **Cancelación en línea con anticipación.** El paciente solo puede cancelar en línea una cita Programada o Confirmada si faltan al menos N horas para el turno (N configurable, por defecto 2; suposición). Si falta menos, debe acudir o llamar a recepción, que puede cancelar siempre. Las citas Postergadas pueden cancelarse en línea sin límite. |
| RN16 | **Citas cerradas.** Una cita Atendida, Cancelada o con Inasistencia no vuelve a un estado activo. La única corrección permitida es Atendida ⇄ Inasistencia, hecha por el Administrador con motivo obligatorio y bitácora (usuario, fecha, estado anterior y nuevo). Una cita Cancelada no se reactiva: se programa una nueva. Sobre una cita Atendida solo se agregan notas clínicas (CU-18). |
| RN17 | **Prioridad de las citas postergadas.** Los turnos que se liberen o habiliten tras una suspensión quedan reservados para reubicar citas Postergadas durante una ventana configurable (por defecto 48 horas; suposición basada en lo que dijo la docente). Vencida la ventana, pasan a la disponibilidad general. |
| RN18 | **Canal de reserva.** El paciente solo reserva en línea en las especialidades marcadas como reservables en línea. Recepción puede gestionar todas. |
| RN19 | **Acceso a la información.** El paciente solo ve y modifica sus propios datos, citas e historial. El médico solo ve su agenda y a los pacientes con los que tiene citas. (Detalla RN12.) |
| RN20 | **Feriados y bloqueos** (opcional). No se ofrecen turnos en las fechas de feriado o bloqueo de la clínica. |
| RN21 | **Bitácora de auditoría.** El sistema registra los eventos relevantes: inicio y cierre de sesión (incluidos los intentos fallidos), cambios en usuarios y roles, cambios de estado de citas (incluidas las correcciones de RN16), suspensiones de horario y operaciones de respaldo. Cada registro guarda usuario, fecha y hora, evento y, si corresponde, estado anterior, estado nuevo y motivo. Los registros no se modifican ni se eliminan (suposición). |
| RN22 | **Copias de seguridad.** Solo el Administrador genera o restaura copias de la base de datos. La restauración exige confirmación explícita, funciona de forma "todo o nada" y queda registrada en la bitácora (suposición). |

### 12.8. Pruebas adicionales sugeridas
El enunciado exige las 10 pruebas de la sección 8. Estas cubren las reglas nuevas.

| N.º | Prueba | Resultado esperado |
|---|---|---|
| 11 | El paciente cancela en línea una cita a menos de N horas | Se rechaza y se indica acudir a recepción (RN15) |
| 12 | El paciente busca turno en una especialidad solo presencial | No se ofrece en línea (RN18) |
| 13 | Intentar marcar como Atendida una cita Cancelada | Se rechaza (RN16) |
| 14 | El Administrador corrige una cita de Atendida a Inasistencia con motivo | Se permite y queda registrada en la bitácora (RN16) |
| 15 | Suspender el horario de un médico con citas | Las citas pasan a Postergada y no se ofrecen turnos en el período (CU-11) |
| 16 | Un paciente intenta abrir la cita de otro paciente | Acceso denegado (RN19) |
| 17 | Registro de paciente con el CI de una ficha existente y datos que no coinciden | No se vincula la cuenta y se indica acudir a recepción (CU-03) |
| 18 | Iniciar sesión con contraseña incorrecta y luego consultar la bitácora como Administrador | Se rechaza el ingreso y el intento aparece en la bitácora (RN21, CU-24) |
| 19 | Un usuario que no es Administrador intenta abrir la bitácora o restaurar una copia | Acceso denegado (RN22) |
| 20 | Generar una copia de seguridad y restaurarla en una base de pruebas | La base restaurada conserva pacientes, médicos y citas (CU-26) |

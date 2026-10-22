---
name: casos-de-uso-citas-medicas-vida-salud
description: Catálogo final (v3) de 26 casos de uso del Sistema Web de Gestión de Citas Médicas (Clínica Vida Salud), con actores, matriz, relaciones UML, estados de la cita, especificación de cada caso, cobertura de RF y RN, decisiones adoptadas y pendientes, ciclos de desarrollo y paquetes de diagramas.
---

# Casos de uso — Sistema de Gestión de Citas Médicas

**Proyecto:** Clínica Vida Salud · **Materia:** Ingeniería de Requisitos — Segundo Examen Parcial

> **Cómo usar este archivo:** complementa a `contexto-proyecto-citas-medicas-vida-salud-v2.md` (enunciado, RF01–RF13, RN01–RN14, aclaraciones de la docente y, en su sección 12, las decisiones del equipo, RF14–RF22 y RN15–RN22). Esta es la lista **definitiva** de casos de uso: no agregues, quites ni renumeres casos sin avisar. Úsala para redactar especificaciones, diagramas (UML), código y pruebas con el mismo identificador CU. Si algo no está definido, pregunta o propón una opción marcándola como suposición.
>
> **Cambios de la v3 respecto de la v2:** estado Postergada adoptado y estados del turno derivados (sección 6); procedimiento de corrección de citas cerradas (RN16, CU-13); prioridad de reubicación de citas postergadas (RN17, CU-10, CU-11); anticipación mínima para cancelar en línea (RN15, CU-12); verificación de identidad al vincular cuenta (CU-03); feriados en la disponibilidad (CU-09, CU-10); disponibilidad solo con sesión (CU-10); reactivación explícita (CU-04, CU-05, CU-07, CU-08); cobertura por RF14–RF22 y RN15–RN22 (sección 8); decisiones adoptadas y pendientes reordenadas (sección 9). No se quitaron ni renumeraron casos; se agregaron tres casos opcionales propios al final: CU-24 (bitácora de auditoría), CU-25 (dashboard administrativo) y CU-26 (copias de seguridad).

## 1. Resumen

- **26 casos de uso:** 19 base y 7 opcionales. CU-24 a CU-26 son aportes propios del grupo: no vienen del enunciado ni de la docente.
- El rango pedido es de 20 a 40 casos. Para cumplirlo hay que especificar y diagramar **los 19 base y al menos 1 opcional**.
- Operaciones que persiguen el mismo objetivo se unieron en un solo caso (por ejemplo, Gestionar citas agrupa programar, reprogramar, cancelar y confirmar).
- La validación de disponibilidad y conflictos **no es un caso aparte**: es un paso obligatorio dentro de Gestionar citas (CU-12) y de la reubicación en CU-11, ejecutado en el servidor.
- Los nombres de tablas y campos de la base de datos deben estar **en español**.
- Los 26 casos se organizan de dos formas: en **2 ciclos de desarrollo** (sección 11, orden de implementación) y en **6 paquetes** (sección 12, agrupación para los diagramas). Ambas agrupaciones usan los mismos identificadores CU.

## 2. Actores

- **Administrador:** superusuario con visibilidad general; administra usuarios, catálogos, horarios y reportes.
- **Recepcionista:** registra pacientes y gestiona las citas que requieren atención presencial.
- **Médico:** consulta su propia agenda y a sus pacientes asignados; marca asistencia y atención.
- **Paciente:** administra su cuenta y perfil, reserva y cancela sus propias citas en línea cuando la especialidad lo permite, y consulta su información.
- **Sistema:** controla permisos, valida operaciones, envía avisos y registra la bitácora.

## 3. Catálogo de casos de uso

| ID | Caso de uso | Actor principal | Alcance |
|---|---|---|---|
| **Acceso y cuentas** | | | |
| CU-01 | Iniciar y cerrar sesión | Todos los usuarios | Base |
| CU-02 | Cambiar contraseña | Todos los usuarios | Base |
| CU-03 | Registrarse como paciente | Paciente | Base |
| CU-04 | Administrar usuarios y roles | Administrador | Base |
| **Pacientes y perfil** | | | |
| CU-05 | Gestionar pacientes | Recepcionista / Administrador | Base |
| CU-06 | Gestionar mi perfil | Paciente | Base |
| **Catálogos** | | | |
| CU-07 | Gestionar especialidades | Administrador | Base |
| CU-08 | Gestionar médicos | Administrador | Base |
| **Horarios** | | | |
| CU-09 | Gestionar horarios de atención | Administrador | Base |
| CU-10 | Consultar disponibilidad | Recepcionista / Paciente | Base |
| CU-11 | Suspender horario y gestionar citas afectadas | Administrador / Recepcionista | Base |
| **Citas** | | | |
| CU-12 | Gestionar citas (programar, reprogramar, cancelar y confirmar) | Recepcionista / Paciente | Base |
| CU-13 | Registrar asistencia, inasistencia o atención | Recepcionista / Médico | Base |
| CU-14 | Consultar agenda de citas | Médico / Recepcionista | Base |
| CU-15 | Consultar historial y seguimiento de citas | Recepcionista / Médico / Paciente | Base |
| **Notificaciones** | | | |
| CU-16 | Enviar notificaciones y recordatorios | Sistema | Base |
| **Historia clínica** | | | |
| CU-17 | Consultar mis pacientes (kardex digital) | Médico | Base |
| CU-18 | Registrar atención clínica | Médico | Opcional |
| CU-19 | Registrar resultados de laboratorio | Médico | Opcional |
| CU-20 | Consultar historial clínico | Paciente / Médico | Opcional |
| **Reportes** | | | |
| CU-21 | Consultar reportes de citas | Administrador / Recepcionista | Base |
| CU-22 | Consultar reporte de asistencia y pacientes registrados | Administrador | Base |
| CU-23 | Exportar reportes (CSV/PDF) | Administrador | Opcional |
| **Auditoría y administración (aportes propios)** | | | |
| CU-24 | Consultar bitácora de auditoría | Administrador | Opcional |
| CU-25 | Visualizar dashboard administrativo | Administrador | Opcional |
| CU-26 | Generar y restaurar copias de seguridad | Administrador | Opcional |

## 4. Matriz actor–caso de uso

● = inicia el caso · ○ = participa

| Caso | Administrador | Recepcionista | Médico | Paciente | Sistema |
|---|:-:|:-:|:-:|:-:|:-:|
| CU-01 | ● | ● | ● | ● | |
| CU-02 | ● | ● | ● | ● | |
| CU-03 | | | | ● | |
| CU-04 | ● | | | | |
| CU-05 | ● | ● | | | |
| CU-06 | | | | ● | |
| CU-07 | ● | | | | |
| CU-08 | ● | ○ | | ○ | |
| CU-09 | ● | | | | |
| CU-10 | | ● | | ● | |
| CU-11 | ● | ● | | | ○ |
| CU-12 | | ● | | ● | ○ |
| CU-13 | ○ | ● | ● | | |
| CU-14 | | ● | ● | | |
| CU-15 | | ● | ● | ● | |
| CU-16 | | | | | ● |
| CU-17 | | | ● | | |
| CU-18 | | | ● | | |
| CU-19 | | | ● | | |
| CU-20 | | | ● | ● | |
| CU-21 | ● | ● | | | |
| CU-22 | ● | | | | |
| CU-23 | ● | | | | |
| CU-24 | ● | | | | ○ |
| CU-25 | ● | | | | |
| CU-26 | ● | | | | |

## 5. Relaciones sugeridas para los diagramas

| Caso base | Relación | Caso relacionado | Condición |
|---|---|---|---|
| CU-12 Gestionar citas | `<<include>>` | CU-10 Consultar disponibilidad | Al programar y reprogramar |
| CU-11 Suspender horario | `<<include>>` | CU-10 Consultar disponibilidad | Al reubicar citas afectadas |
| CU-11 Suspender horario | `<<include>>` | CU-16 Enviar notificaciones | Siempre (si no hay citas afectadas, no hay destinatarios) |
| CU-12 Gestionar citas | `<<extend>>` desde CU-16 | CU-16 Enviar notificaciones | Cuando el personal reprograma o cancela y afecta al paciente |
| CU-21 y CU-22 | `<<extend>>` desde CU-23 | CU-23 Exportar reportes | Si el usuario elige exportar |
| CU-01 | Prerrequisito | Todos, salvo CU-03 | No se dibuja en cada caso |

Notas:
- En `<<extend>>` la flecha va del caso que extiende (CU-16, CU-23) hacia el caso base.
- La validación de disponibilidad y conflictos es un paso dentro de CU-12 y CU-11, no un caso con diagrama propio.
- Si un paciente cancela su propia cita, no hace falta aviso; sí se avisa cuando cancela o reprograma el personal.
- CU-13 solo cambia el estado de la cita. El registro clínico (diagnóstico, tratamiento) es CU-18.
- El registro de eventos en la bitácora (RN21) lo hace el sistema dentro de cada caso (CU-01, CU-04, CU-11, CU-12, CU-13, CU-26) y no se dibuja como `<<include>>` en cada uno. CU-24 solo consulta la bitácora; el Sistema aparece como participante porque la alimenta.
- CU-25 no se relaciona con `<<include>>` ni `<<extend>>`: usa las mismas consultas que CU-21 y CU-22 y enlaza a ellos desde sus indicadores. CU-26 es independiente.

## 6. Estados de la cita y transiciones

Estados del enunciado (RF10): Programada, Confirmada, Atendida, Cancelada, Inasistencia. Se agrega **Postergada** (ejemplo de la docente) para las citas afectadas por una suspensión de horario. Decisión D2 del contexto (suposición por confirmar): son seis estados de cita.

| Desde | Hacia | Caso | Condición |
|---|---|---|---|
| (nueva) | Programada | CU-12 (programar) | Turno validado en el servidor |
| Programada | Confirmada | CU-12 (confirmar) | — |
| Programada / Confirmada | Misma, con nueva fecha y hora | CU-12 (reprogramar) | Se conserva el código; se guarda la fecha anterior |
| Programada / Confirmada | Cancelada | CU-12 (cancelar) | Libera el turno; no se elimina el registro |
| Programada / Confirmada | Postergada | CU-11 | Suspensión del horario del médico |
| Postergada | Programada | CU-11 (reubicar) | Nueva fecha y hora validadas |
| Postergada | Cancelada | CU-11 / CU-12 | Con motivo |
| Programada / Confirmada | Atendida | CU-13 | No antes del inicio del turno |
| Programada / Confirmada | Inasistencia | CU-13 | No antes del inicio del turno |
| Atendida | Inasistencia | CU-13 (corrección autorizada) | Solo el Administrador, con motivo y bitácora (RN16) |
| Inasistencia | Atendida | CU-13 (corrección autorizada) | Solo el Administrador, con motivo y bitácora (RN16) |
| Cancelada | (ninguno) | — | No se reactiva: se programa una cita nueva con CU-12 (RN16) |

Cualquier otra transición desde Atendida, Cancelada o Inasistencia no está permitida. Sobre una cita Atendida solo se agregan notas clínicas (CU-18).

### Estado del turno (derivado, no se guarda)

La docente mencionó libre, ocupado y reservado. No son estados de la cita: describen el turno y se calculan al consultar la disponibilidad.

| Estado del turno | Cuándo |
|---|---|
| Libre | Dentro del horario, sin cita vigente, sin bloqueo y sin reserva para postergadas |
| Ocupado | Tiene una cita Programada o Confirmada (o Atendida / con Inasistencia, si ya pasó) |
| Bloqueado | Cae en una suspensión del médico (CU-11) o en un feriado de la clínica (RN20) |
| Reservado para postergadas | Se liberó o habilitó tras una suspensión y está dentro de la ventana de prioridad (RN17); solo lo ve el personal que reubica |

Una cita Cancelada libera su turno (RN09).

## 7. Especificación de los casos de uso

### Acceso y cuentas

#### CU-01 — Iniciar y cerrar sesión
- **Actores:** administrador, recepcionista, médico, paciente · **Alcance:** Base
- **Precondición:** el usuario tiene una cuenta activa.
- **Flujo principal:** 1) Ingresa nombre de usuario o correo y contraseña. 2) El sistema valida las credenciales, identifica el rol y muestra el menú permitido. 3) Al salir, el sistema invalida la sesión y vuelve a la pantalla de acceso.
- **Alternativas:** credenciales incorrectas o cuenta inactiva: mensaje genérico sin revelar datos. Sesión expirada o acceso a una página interna sin sesión: se redirige al inicio de sesión.
- **Postcondición:** sesión iniciada con permisos del rol, o sesión cerrada.
- **Referencia:** RF01, RN12; contraseñas con hash (`password_hash()` / `password_verify()`), aclaración 11.9.

#### CU-02 — Cambiar contraseña
- **Actores:** cualquier usuario con sesión · **Alcance:** Base
- **Precondición:** sesión iniciada.
- **Flujo principal:** 1) Ingresa la contraseña actual, la nueva y su confirmación. 2) El sistema valida la política de contraseña. 3) Guarda la nueva contraseña con hash.
- **Alternativas:** contraseña actual incorrecta, nueva débil o igual a la actual: se rechaza. **Contraseña olvidada (sin envío de correos):** el personal la restablece con el Administrador desde CU-04; el paciente la restablece en recepción desde CU-05, previa verificación de identidad (suposición por confirmar).
- **Postcondición:** contraseña actualizada sin guardarse en texto plano.
- **Referencia:** RF01; aclaración 11.9.

#### CU-03 — Registrarse como paciente
- **Actores:** paciente (visitante sin sesión) · **Alcance:** Base
- **Precondición:** el visitante no tiene cuenta.
- **Flujo principal:** 1) Ingresa CI, nombres, apellidos, fecha de nacimiento, teléfono, correo (si aplica) y credenciales. 2) El sistema valida los datos y busca una ficha existente por CI. 3) Si no existe, crea la ficha activa y la cuenta con rol Paciente. 4) Guarda la contraseña con hash.
- **Alternativas:** si ya existe la ficha sin cuenta (por ejemplo, registrada antes en recepción), el sistema verifica la identidad comparando, además del CI, la fecha de nacimiento y el teléfono ingresados con los de la ficha; si coinciden, vincula la cuenta a esa ficha sin duplicar al paciente; si no coinciden, no vincula, no revela qué dato falló e indica acudir a recepción. CI o correo con cuenta existente: se rechaza y se indica acudir a recepción. Datos inválidos: se indican los campos a corregir.
- **Postcondición:** cuenta de paciente creada y vinculada a una única ficha.
- **Referencia:** RF01, RF02, RF14, RN01; secciones 3.4–3.5; aclaraciones 11.7 y 11.9. La verificación de identidad es la decisión D8 del contexto (suposición por confirmar).

#### CU-04 — Administrar usuarios y roles
- **Actores:** administrador · **Alcance:** Base
- **Precondición:** sesión de administrador.
- **Flujo principal:** 1) Busca un usuario del personal o elige crear uno. 2) Registra o modifica nombre, correo, nombre de usuario y estado. 3) Asigna rol y permisos (por ejemplo, el permiso de un médico para marcar citas como atendidas). 4) El sistema valida y guarda.
- **Alternativas:** usuario o correo duplicado o datos incompletos: no se guarda. Usuarios con actividad histórica se desactivan, no se eliminan; un usuario inactivo puede reactivarse, y reactivar a un usuario de rol Médico exige que su ficha (CU-08) esté activa. No se permite desactivar al último administrador ni la propia cuenta. **Restablecer contraseña del personal:** el sistema genera una temporal y exige cambiarla al ingresar (CU-02).
- **Postcondición:** usuario creado o actualizado con sus permisos.
- **Relaciones:** un usuario de rol Médico se vincula a la ficha de CU-08.
- **Referencia:** RF01, RN12; sección 3.1; aclaración 11.7.

### Pacientes y perfil

#### CU-05 — Gestionar pacientes
- **Actores:** recepcionista, administrador · **Alcance:** Base
- **Precondición:** sesión y permiso de gestión de pacientes.
- **Flujo principal:** 1) Registra un paciente (atención presencial) o lo busca por CI, nombre o apellido. 2) Consulta la ficha, modifica datos personales y de contacto, o cambia el estado activo/inactivo. 3) El sistema valida los datos y la unicidad del CI. 4) Guarda conservando las citas relacionadas.
- **Alternativas:** CI duplicado o datos inválidos: no se guarda. Paciente con historial: se desactiva, no se elimina; un paciente inactivo puede reactivarse desde su ficha y conserva su historial y su cuenta, si la tiene. Sin coincidencias: se permite iniciar un registro nuevo. **Acceso del paciente:** recepción puede crear su cuenta o restablecer su contraseña con una temporal, previa verificación de identidad. Desde la ficha se accede al historial de citas (CU-15).
- **Postcondición:** paciente registrado, actualizado, consultado o desactivado sin perder historial.
- **Referencia:** RF02, RF14, RN01, RN11; aclaraciones 11.6 y 11.7.

#### CU-06 — Gestionar mi perfil
- **Actores:** paciente · **Alcance:** Base
- **Precondición:** paciente autenticado y activo.
- **Flujo principal:** 1) Abre su perfil. 2) Consulta y edita datos de contacto, información médica declarada (tipo de sangre, alergias, enfermedades crónicas, medicamentos, antecedentes), contacto de emergencia y preferencias de notificación y privacidad. 3) El sistema valida y guarda.
- **Alternativas:** CI y fecha de nacimiento no se editan directamente: se corrigen en recepción, previa verificación de identidad. Datos inválidos: se rechazan. El cambio de contraseña se hace en CU-02.
- **Postcondición:** perfil actualizado; el paciente solo ve y modifica su propia información.
- **Referencia:** RF14, RN19; sección 3.4; aclaración 11.7. La información médica declarada por el paciente es distinta de la historia clínica registrada por el médico (CU-18).

### Catálogos

#### CU-07 — Gestionar especialidades
- **Actores:** administrador · **Alcance:** Base
- **Precondición:** sesión de administrador.
- **Flujo principal:** 1) Registra, consulta, modifica, desactiva o reactiva una especialidad. 2) Define nombre, descripción opcional, duración por defecto de la cita y si es **reservable en línea** o solo por recepción. 3) El sistema valida que el nombre normalizado no se repita y guarda.
- **Alternativas:** nombre duplicado: se rechaza. Desactivar una especialidad con médicos asociados: el sistema advierte; deja de ofrecer nuevos turnos pero conserva las citas; al reactivarla vuelve a ofrecer los turnos de los médicos activos que la tengan. Deshabilitar la reserva en línea no afecta las citas ya registradas; recepción puede gestionarlas.
- **Postcondición:** catálogo actualizado y regla de canal aplicada a la disponibilidad (CU-10) y a las reservas (CU-12).
- **Referencia:** RF04, RF15, RN18; aclaraciones 11.3 y 11.7.

#### CU-08 — Gestionar médicos
- **Actores:** administrador (principal); recepcionista y paciente consultan · **Alcance:** Base
- **Precondición:** especialidades registradas.
- **Flujo principal:** 1) Registra un médico o busca uno existente. 2) Ingresa o modifica código, número de registro profesional, nombres, apellidos, teléfono y correo. 3) Asigna **una o varias especialidades** activas (un médico puede tener más de una; una especialidad puede tener varios médicos). 4) Activa, desactiva o reactiva al médico. 5) El sistema valida y guarda.
- **Alternativas:** registro profesional duplicado o dato inválido: no se guarda. Médico sin especialidad: no se activa (tampoco al reactivarlo: debe tener al menos una especialidad activa); sus horarios se conservan al reactivarlo y conviene revisarlos (CU-09). Desactivar un médico con citas futuras: el sistema advierte y propone suspender su horario (CU-11). **Buscar médicos:** recepcionista y paciente buscan por nombre o especialidad y ven solo datos públicos.
- **Postcondición:** ficha del médico actualizada; si está inactivo no recibe nuevas citas y sus citas históricas se conservan.
- **Referencia:** RF03, RN02, RN04, RN11; aclaración 11.3.

### Horarios

#### CU-09 — Gestionar horarios de atención
- **Actores:** administrador · **Alcance:** Base
- **Precondición:** médico registrado y activo.
- **Flujo principal:** 1) Selecciona médico y día. 2) Registra hora inicial, hora final y duración del turno, **configurable según la especialidad o el médico** (por defecto la de la especialidad). 3) El sistema valida el intervalo y calcula los turnos (por ejemplo, 10:00 a 12:00 con turnos de 15 minutos son 8). 4) Guarda.
- **Alternativas:** hora final anterior a la inicial, bloques solapados del mismo médico o duración que no encaja en el intervalo: se rechaza. Cambiar un horario con citas futuras: el sistema advierte y no modifica las citas; se resuelven con CU-11. **Opcional (RN20):** registrar feriados o bloqueos de la clínica (fecha o rango y motivo) que excluyen esas fechas para todos los médicos; si ya hay citas registradas en esas fechas, el sistema advierte y se resuelven con CU-11.
- **Postcondición:** el sistema puede calcular turnos disponibles respetando el horario.
- **Referencia:** RF05, RN05, RN08, RN20; aclaración 11.3.

#### CU-10 — Consultar disponibilidad
- **Actores:** recepcionista, paciente · **Alcance:** Base
- **Precondición:** sesión iniciada (no hay consulta pública para visitantes sin cuenta); médico activo con especialidad y horario; el paciente solo ve especialidades reservables en línea.
- **Flujo principal:** 1) Elige especialidad, médico y fecha. 2) El sistema consulta horarios, citas vigentes, suspensiones y feriados de la clínica. 3) Muestra **únicamente los turnos libres**.
- **Alternativas:** fecha pasada, médico inactivo, sin horario o sin turnos: informa que no hay disponibilidad y sugiere próximas fechas con cupo. Las citas canceladas no ocupan turno. Los turnos reservados para citas postergadas (RN17) no se muestran al paciente ni en la reserva general; solo los ve el personal al reubicar desde CU-11.
- **Postcondición:** el actor puede elegir un turno disponible.
- **Referencia:** RF05–RF07, RF15, RN04–RN09, RN17, RN18, RN20; aclaraciones 11.3 y 11.4.

#### CU-11 — Suspender horario y gestionar citas afectadas
- **Actores:** administrador, recepcionista · **Alcance:** Base
- **Precondición:** médico con horario configurado.
- **Flujo principal:** 1) Selecciona médico, fecha o intervalo y motivo (emergencia, cirugía, etc.). 2) El sistema deja de ofrecer turnos en ese período e identifica las citas afectadas. 3) El usuario confirma y las citas pasan a **Postergada**. 4) El sistema avisa a los pacientes afectados (incluye CU-16). 5) Más tarde, el usuario reubica cada cita (o varias a la vez): elige nueva fecha y turno (incluye CU-10; los turnos reservados para postergadas, RN17, se ofrecen solo en este paso), el sistema valida en el servidor, pasa la cita a Programada con la nueva fecha y avisa al paciente.
- **Alternativas:** sin citas afectadas: solo se bloquea el período. El paciente no puede o no quiere la nueva fecha: se cancela con motivo "suspensión del horario". Sin turnos suficientes: la cita sigue Postergada. **Levantar la suspensión:** reabre el horario; los turnos liberados o habilitados quedan reservados para reubicar citas Postergadas durante la ventana de prioridad (RN17; por defecto 48 horas, a partir de la regla de 24 o 48 horas que mencionó la docente, por confirmar) y luego pasan a la disponibilidad general. Se conserva el código de la cita y la fecha original.
- **Postcondición:** no se reciben nuevas reservas en el período; cada cita afectada queda reubicada, cancelada o pendiente, con trazabilidad.
- **Referencia:** RF05, RF08, RF16, RN13, RN17; aclaración 11.5.

### Citas

#### CU-12 — Gestionar citas (programar, reprogramar, cancelar y confirmar)
- **Actores:** recepcionista; paciente (solo sus propias citas, en línea) · **Alcance:** Base
- **Precondición:** sesión iniciada; paciente activo; médico activo; para el paciente, la especialidad debe ser reservable en línea (CU-07).
- **Flujo principal A — Programar:** 1) Recepción busca al paciente (CU-05); si reserva el paciente, se usa su propia cuenta. 2) Elige especialidad, médico, fecha y turno libre (incluye CU-10). 3) Ingresa un motivo breve opcional y confirma. 4) El sistema **revalida en el servidor** (médico activo, dentro del horario, fecha no pasada, duración configurada, sin superposición, suspensión ni feriado) y reserva el turno de forma atómica (transacción y restricción en la base de datos). 5) Genera el código único (por ejemplo, CM-0001), fecha de creación, canal y usuario, y deja la cita en **Programada**. 6) Muestra el comprobante.
- **Flujo B — Reprogramar (recepcionista):** sobre una cita Programada o Confirmada, elige nueva fecha y turno libre (incluye CU-10), el sistema revalida, libera el turno anterior, conserva el código y registra la fecha y hora anteriores.
- **Flujo C — Cancelar (recepcionista; paciente sus propias citas):** sobre una cita Programada, Confirmada o Postergada, indica el motivo (obligatorio para recepción, opcional para el paciente). El sistema la pasa a **Cancelada**, no la elimina y **libera el turno de inmediato**. El paciente en línea solo puede cancelar una cita Programada o Confirmada si faltan al menos N horas para el turno (RN15; por defecto 2, por confirmar); si falta menos, acude o llama a recepción, que cancela sin límite. Una cita Postergada la puede cancelar sin límite.
- **Flujo D — Confirmar (paciente o recepcionista):** una cita Programada pasa a **Confirmada**, desde la cuenta del paciente o tras contactarlo. Es opcional: una cita Programada también puede atenderse.
- **Alternativas:** si dos solicitudes piden el mismo turno a la vez, **se acepta la primera**; la otra recibe "ya no hay cupo" y vuelve a elegir; si no quedan turnos, no se puede sacar ficha ese día con ese médico. Paciente o médico inactivo, fecha pasada o especialidad solo presencial: no se registra. Cita Atendida, Cancelada o con Inasistencia: no se reprograma ni cancela; solo aplica la corrección autorizada de CU-13 (RN16) o se programa una cita nueva. Cita de otro paciente: acceso denegado. Si el paciente no puede cancelar en línea, acude a recepción. Si el personal reprograma o cancela y afecta al paciente, se le avisa (CU-16).
- **Postcondición:** cita registrada, reprogramada, cancelada o confirmada, con turno ocupado o liberado y trazabilidad.
- **Relaciones:** incluye CU-10; CU-16 la extiende.
- **Referencia:** RF06–RF10, RF15, RN03–RN13, RN15, RN16, RN18; aclaraciones 11.4 y 11.5. Reprogramación en línea por el paciente: pendiente de política.

#### CU-13 — Registrar asistencia, inasistencia o atención
- **Actores:** recepcionista; médico (sus pacientes, si tiene el permiso); administrador (solo la corrección autorizada) · **Alcance:** Base
- **Precondición:** cita Programada o Confirmada y hora de la cita ya iniciada.
- **Flujo principal:** 1) Abre la cita desde la agenda (CU-14). 2) Marca **Atendida** o **Inasistencia**. 3) El sistema valida la transición y guarda el estado con usuario, fecha y hora.
- **Alternativas:** una cita Cancelada no se marca Atendida: no se reactiva, se programa una cita nueva con CU-12 (RN16). No se marca Atendida ni Inasistencia antes del inicio del turno. Médico sobre pacientes que no son suyos: denegado. Ejemplo de la docente: de 8 citas, 6 atendidas y 2 inasistencias.
- **Flujo alternativo — Corrección autorizada (RN16):** si una cita quedó mal marcada, solo el Administrador puede cambiarla de Atendida a Inasistencia o al revés. Indica el motivo (obligatorio) y el sistema guarda la bitácora con usuario, fecha, estado anterior y estado nuevo. Ningún otro cambio de estado es posible sobre citas cerradas.
- **Postcondición:** el estado queda disponible para historial y reportes.
- **Referencia:** RF10, RN10, RN12, RN16; aclaraciones 11.6 y 11.7. Este caso solo cambia el estado; el registro clínico es CU-18.

#### CU-14 — Consultar agenda de citas
- **Actores:** médico (la propia), recepcionista (cualquier médico) · **Alcance:** Base
- **Precondición:** sesión y permiso de consulta.
- **Flujo principal:** 1) Selecciona médico (si es recepcionista), fecha y, opcionalmente, estado. 2) El sistema muestra hora, código de cita, paciente, especialidad y estado. 3) Muestra el motivo breve solo si el actor tiene permiso.
- **Alternativas:** sin citas: agenda vacía. El médico solo ve su agenda y sus pacientes.
- **Postcondición:** se visualiza únicamente la agenda permitida.
- **Referencia:** RF11, RN12; aclaración 11.7.

#### CU-15 — Consultar historial y seguimiento de citas
- **Actores:** recepcionista (cualquier paciente), médico (sus pacientes), paciente (el propio) · **Alcance:** Base
- **Precondición:** el paciente existe y el actor tiene permiso.
- **Flujo principal:** 1) Selecciona al paciente (el paciente ve el suyo). 2) El sistema muestra fecha y hora, médico, especialidad, estado y fecha de registro, incluyendo citas pasadas y canceladas. 3) Permite filtrar por estado y rango de fechas. 4) El paciente ve además sus próximas citas pendientes y confirmadas.
- **Alternativas:** sin citas: historial vacío. Sin autorización: acceso denegado.
- **Postcondición:** se consulta la trazabilidad de citas sin modificarla.
- **Referencia:** RF12, RN10–RN12; sección 3.5; aclaración 11.6.

### Notificaciones

#### CU-16 — Enviar notificaciones y recordatorios
- **Actores:** sistema · **Alcance:** Base
- **Precondición:** hay una cita futura afectada por un evento, o próxima a ocurrir; existe un canal definido; se respetan las preferencias del paciente.
- **Flujo principal:** 1) El sistema detecta el evento (suspensión o reubicación por CU-11, cancelación o reprogramación hecha por el personal) o la cercanía de la cita. 2) Arma el aviso con fecha, hora, médico y, si aplica, la nueva fecha (ejemplo: martes de 10 a 12 cancelado, pasa al jueves). 3) Lo envía por el canal definido. 4) Registra el resultado.
- **Alternativas:** paciente sin datos de contacto o envío fallido: se registra la incidencia para que recepción lo contacte. No se envían recordatorios de citas canceladas.
- **Postcondición:** queda constancia del aviso sin cambiar por sí mismo el estado de la cita.
- **Referencia:** RF17; sección 3.5; aclaraciones 11.5 y 11.7. Canal: como mínimo, un mensaje dentro del sistema visible al iniciar sesión (D11 del contexto); correo o push si se implementa (pendiente 3 de la sección 9).

### Historia clínica

#### CU-17 — Consultar mis pacientes (kardex digital)
- **Actores:** médico · **Alcance:** Base
- **Precondición:** el médico tiene pacientes con citas asignadas.
- **Flujo principal:** 1) Abre su listado de pacientes y puede buscar. 2) Selecciona un paciente. 3) El sistema muestra sus datos básicos y sus citas con ese médico.
- **Alternativas:** sin pacientes asignados: lista vacía. Solo se ven los pacientes propios. Si se implementa CU-20, desde aquí se accede al historial clínico.
- **Postcondición:** consulta sin modificar datos.
- **Referencia:** RF18, RN19; aclaración 11.7.

#### CU-18 — Registrar atención clínica
- **Actores:** médico · **Alcance:** Opcional
- **Precondición:** paciente asignado al médico; cita del paciente con ese médico.
- **Flujo principal:** 1) Abre la cita del paciente. 2) Registra motivo, diagnóstico, tratamiento e indicaciones (medicamentos, vitaminas, observaciones). 3) El sistema guarda el registro vinculado a la cita y al paciente. 4) Ofrece marcar la cita como Atendida (CU-13).
- **Alternativas:** médico sin relación con el paciente: denegado. Los registros no se eliminan; las correcciones se hacen con una nota o una nueva versión para conservar trazabilidad.
- **Postcondición:** atención clínica registrada en el historial.
- **Referencia:** RF19; aclaraciones 11.2 y 11.8. El enunciado escrito no tiene RF para esto: el RF19 se derivó de las aclaraciones.

#### CU-19 — Registrar resultados de laboratorio
- **Actores:** médico · **Alcance:** Opcional
- **Precondición:** paciente con ficha; estudio solicitado por un médico.
- **Flujo principal:** 1) Registra o adjunta el resultado con tipo de estudio, laboratorio y fecha. 2) El sistema lo vincula al paciente y al médico solicitante. 3) Queda disponible para consulta del paciente y del médico (CU-20).
- **Alternativas:** archivo o datos inválidos: no se guarda. Paciente no encontrado: se rechaza.
- **Postcondición:** resultado dentro de la información del paciente con acceso controlado.
- **Referencia:** RF19; aclaración 11.8. Formatos, permisos y almacenamiento por definir; la docente indicó que los laboratorios envían los resultados (un actor Laboratorio podría agregarse más adelante).

#### CU-20 — Consultar historial clínico
- **Actores:** paciente (el propio), médico (sus pacientes asignados) · **Alcance:** Opcional
- **Precondición:** sesión y relación autorizada con el paciente.
- **Flujo principal:** 1) El actor abre el historial. 2) El sistema muestra atenciones, tratamientos y resultados de laboratorio ordenados por fecha. 3) Permite filtrar y registra el acceso.
- **Alternativas:** sin información: estado vacío. Información ajena o médico sin asignación: denegado.
- **Postcondición:** consulta sin modificar datos.
- **Referencia:** RF19, RN19; aclaraciones 11.7 y 11.8.

### Reportes

#### CU-21 — Consultar reportes de citas
- **Actores:** administrador (todos), recepcionista (los autorizados) · **Alcance:** Base
- **Precondición:** sesión y permiso de reportes.
- **Flujo principal:** 1) Elige el reporte: citas programadas para una fecha, por médico, por especialidad, por estado o agenda diaria de cada médico. 2) Define fecha o rango y filtros. 3) El sistema muestra resultados y totales.
- **Alternativas:** rango inválido: se pide corregir. Sin datos: cero resultados.
- **Postcondición:** reporte obtenido según los filtros autorizados.
- **Referencia:** RF11, RF13; aclaración 11.9.

#### CU-22 — Consultar reporte de asistencia y pacientes registrados
- **Actores:** administrador · **Alcance:** Base
- **Precondición:** sesión de administrador.
- **Flujo principal:** 1) Define período y, si quiere, médico o especialidad. 2) El sistema muestra cantidad de citas atendidas, canceladas e inasistencias, con totales. 3) Muestra también el listado de pacientes registrados, filtrable por estado activo/inactivo.
- **Alternativas:** rango inválido o sin datos: se informa.
- **Postcondición:** se conoce la asistencia real frente a las citas registradas.
- **Referencia:** RF13; aclaraciones 11.6 y 11.9.

#### CU-23 — Exportar reportes (CSV/PDF)
- **Actores:** administrador · **Alcance:** Opcional
- **Precondición:** reporte consultado (CU-21 o CU-22) y permiso de exportación.
- **Flujo principal:** 1) Elige el formato CSV o PDF. 2) El sistema genera el archivo con los mismos filtros. 3) El administrador lo descarga.
- **Alternativas:** sin resultados: informa o genera un archivo con solo encabezados. Un error se informa sin detalles internos.
- **Postcondición:** reporte exportado con los mismos criterios.
- **Referencia:** RF13 (mejora opcional).

### Auditoría y administración (aportes propios)

#### CU-24 — Consultar bitácora de auditoría
- **Actores:** administrador (el sistema alimenta la bitácora) · **Alcance:** Opcional (aporte propio)
- **Precondición:** sesión de administrador; hay eventos registrados.
- **Flujo principal:** 1) Elige filtros: rango de fechas, usuario, tipo de evento (sesión, usuarios y roles, citas, horarios, respaldos) y, si quiere, el código de una cita. 2) El sistema muestra los eventos del más reciente al más antiguo, con fecha y hora, usuario, evento, elemento afectado y, si corresponde, estado anterior, estado nuevo y motivo. 3) Puede abrir el detalle de un evento.
- **Alternativas:** sin eventos: lista vacía. Rango inválido: se pide corregir. Usuario que no es administrador: denegado. La bitácora es de solo lectura: no se edita ni se elimina.
- **Postcondición:** consulta sin modificar datos.
- **Relaciones:** el registro de eventos ocurre dentro de otros casos (CU-01, CU-04, CU-11, CU-12, CU-13, CU-26) y no es un caso aparte. Los eventos deben guardarse desde el Ciclo 1, aunque esta consulta llegue en el Ciclo 2.
- **Referencia:** RF20, RN16, RN21; aclaración 11.6 (trazabilidad).

#### CU-25 — Visualizar dashboard administrativo
- **Actores:** administrador · **Alcance:** Opcional (aporte propio)
- **Precondición:** sesión de administrador.
- **Flujo principal:** 1) Abre el panel. 2) Elige el período (hoy, semana, mes o rango de fechas). 3) El sistema muestra indicadores calculados con las citas y los pacientes registrados: citas del período por estado, porcentaje de asistencia (atendidas frente a atendidas más inasistencias), citas canceladas y postergadas, ocupación de turnos por médico y por especialidad, próximas citas sin confirmar y pacientes nuevos. 4) Desde un indicador puede pasar al reporte detallado (CU-21 o CU-22).
- **Alternativas:** sin datos: indicadores en cero. Rango inválido: se pide corregir. Usuario que no es administrador: denegado.
- **Postcondición:** consulta sin modificar datos.
- **Relaciones:** reutiliza las consultas de CU-21 y CU-22, por lo que se desarrolla junto con ellos.
- **Referencia:** RF21; RF13 y aclaraciones 11.6 y 11.9.

#### CU-26 — Generar y restaurar copias de seguridad
- **Actores:** administrador · **Alcance:** Opcional (aporte propio)
- **Precondición:** sesión de administrador.
- **Flujo A — Generar:** 1) Elige generar una copia. 2) El sistema exporta la base de datos de PostgreSQL a un archivo cuyo nombre incluye la fecha y la hora. 3) Registra el evento en la bitácora y ofrece el archivo para descargar.
- **Flujo B — Restaurar:** 1) Elige una copia (de la lista o subida desde su equipo). 2) El sistema comprueba que sea una copia válida y pide confirmación explícita, advirtiendo que reemplaza los datos actuales. 3) Restaura la base y registra el evento en la bitácora.
- **Alternativas:** copia inválida o corrupta: se rechaza sin tocar los datos. Error durante la restauración: se conservan los datos actuales (todo o nada) y se informa sin detalles internos. Usuario que no es administrador: denegado.
- **Postcondición:** copia generada o base restaurada, con constancia en la bitácora.
- **Referencia:** RF22, RN14, RN21, RN22; sección 7 del contexto (manejo de errores sin detalles internos). La restauración conviene probarla en una base de pruebas, no en la de trabajo.

## 8. Cobertura de requisitos funcionales y reglas derivadas

RF01–RF13 vienen del enunciado. RF14–RF19 y RN15–RN20 se derivaron de las aclaraciones de la docente. RF20–RF22 y RN21–RN22 corresponden a los casos propios CU-24 a CU-26. Todos están en la sección 12 del contexto (12.6 y 12.7).

| RF | Casos que lo cubren |
|---|---|
| RF01 Inicio de sesión y control de acceso | CU-01, CU-02, CU-03, CU-04 |
| RF02 Gestión de pacientes | CU-03, CU-05, CU-06 |
| RF03 Gestión de médicos | CU-08 |
| RF04 Gestión de especialidades | CU-07 |
| RF05 Horarios de atención | CU-09, CU-11 |
| RF06 Registro de citas | CU-12 |
| RF07 Prevención de citas duplicadas | CU-12 (validación en el servidor) |
| RF08 Reprogramación | CU-12, CU-11 |
| RF09 Cancelación | CU-12 |
| RF10 Control de asistencia y estados | CU-12 (confirmar), CU-13 |
| RF11 Agenda médica | CU-14 |
| RF12 Historial de citas | CU-15 |
| RF13 Reportes | CU-21, CU-22, CU-23 |
| RF14 Cuenta y perfil del paciente | CU-03, CU-05, CU-06 |
| RF15 Reserva y cancelación en línea por el paciente | CU-07, CU-10, CU-12 |
| RF16 Suspensión de horario y reubicación de citas afectadas | CU-11 (con CU-10 y CU-16) |
| RF17 Notificaciones y recordatorios | CU-16 |
| RF18 Kardex digital del médico | CU-17 |
| RF19 Historia clínica y resultados de laboratorio (opcional) | CU-18, CU-19, CU-20 |
| RF20 Bitácora de auditoría (opcional, aporte propio) | CU-24 |
| RF21 Dashboard administrativo (opcional, aporte propio) | CU-25 |
| RF22 Copias de seguridad (opcional, aporte propio) | CU-26 |

| Regla derivada | Casos que la aplican |
|---|---|
| RN15 Cancelación en línea con anticipación mínima | CU-12 (flujo C) |
| RN16 Citas cerradas y corrección autorizada | CU-13, CU-12 |
| RN17 Prioridad de las citas postergadas | CU-10, CU-11 |
| RN18 Canal de reserva por especialidad | CU-07, CU-10, CU-12 |
| RN19 Acceso del paciente y del médico a su propia información | CU-06, CU-12, CU-14, CU-15, CU-17, CU-20 |
| RN20 Feriados y bloqueos de la clínica (opcional) | CU-09, CU-10, CU-12 |
| RN21 Bitácora de auditoría | CU-24 (consulta); se registra desde CU-01, CU-04, CU-11, CU-12, CU-13 y CU-26 |
| RN22 Copias de seguridad solo por el Administrador | CU-26 |

## 9. Decisiones adoptadas y pendientes

### Adoptadas en esta versión
Detalle en la sección 12.2 del contexto. Las marcadas como suposición se confirman con la pareja de grupo y, si se puede, con la docente.

| Decisión | Dónde se refleja | Estado |
|---|---|---|
| Seis estados de cita; libre, ocupado y reservado son estados del turno, derivados (D2) | Sección 6, CU-11 | Suposición |
| Citas cerradas: solo corrección Atendida ⇄ Inasistencia por el Administrador, con motivo y bitácora; Cancelada no se reactiva (D6, RN16) | Sección 6, CU-13, CU-12 | Suposición |
| Cancelación en línea con anticipación mínima, por defecto 2 horas (D5, RN15) | CU-12 | Suposición |
| Prioridad de reubicación de citas postergadas, ventana por defecto de 48 horas (D7, RN17) | CU-10, CU-11 | Suposición |
| Verificación de identidad al vincular cuenta: CI, fecha de nacimiento y teléfono (D8) | CU-03; CU-02 y CU-05 para restablecer contraseña en recepción | Suposición |
| Disponibilidad solo con sesión iniciada (D9) | CU-10 | Suposición |
| Feriados y bloqueos de la clínica, opcionales y dentro de CU-09 (D10, RN20) | CU-09, CU-10 | Adoptada (opcional) |
| Notificaciones: como mínimo, mensaje dentro del sistema (D11) | CU-16 | Adoptada como mínimo |
| Duración del turno por defecto en la especialidad, con ajuste por médico u horario (D3) | CU-07, CU-09 | Adoptada |
| Nombres de tablas y campos en español | Contexto 12.5 | Adoptada |
| Pueden suspender un horario el administrador y la recepcionista | CU-11 | Adoptada |
| Tres casos opcionales propios: bitácora, dashboard y copias de seguridad (D14, RN21, RN22) | CU-24, CU-25, CU-26 | Suposición |

### Pendientes
1. **Confirmar las suposiciones** con la pareja y con la docente, en especial los estados (D2), la cancelación en línea (D5), las citas cerradas (D6) y la prioridad de las postergadas (D7).
2. **Valores finales** de la anticipación mínima para cancelar en línea (RN15) y de la ventana de prioridad de las postergadas (RN17).
3. **Canal de avisos y recordatorios** (CU-16): mensaje dentro del sistema como mínimo; correo o push si se implementa (si se agrega correo, CU-02 podría sumar recuperación de contraseña).
4. **Alcance de historia clínica y laboratorio** (CU-17 a CU-20): datos, formatos, permisos y si se incluye el actor Laboratorio.
5. **Reprogramación en línea** por el paciente: hoy solo la hace recepción.
6. **Opcional que completa los 20 casos:** recomendación, CU-23 (exportar reportes), por ser el más barato e independiente de la historia clínica. Alternativas baratas porque usan datos que ya existen: CU-24 (bitácora) y CU-25 (dashboard). CU-18 y CU-20 si sobra tiempo.
7. **Avance del 50 % en la Presentación 1:** con 26 casos, el Ciclo 1 queda en 13 de 26. Confirmar si el avance se mide por casos o de forma general; si fuera por casos, mover CU-24 al Ciclo 1 sube el avance a 14 de 26.
8. **Marca "reservable en línea" por médico** (hoy solo por especialidad) y **duraciones variables** dentro de un mismo horario.

## 10. Recomendación para los diagramas

- Usar el mismo identificador CU en los tres diagramas de cada caso.
- Hacer primero los 19 casos base; luego los opcionales. Recuerda que hay que presentar al menos 1 opcional para llegar a 20.
- Como CU-12 agrupa cuatro operaciones, el diagrama de secuencia puede mostrarlas como cuatro escenarios (programar, reprogramar, cancelar, confirmar) del mismo caso.
- En CU-12, CU-15 y CU-20 el paciente solo opera sobre sus propias citas o información (RN19); conviene indicarlo en la descripción del actor.
- CU-13 puede mostrarse como dos escenarios: marcar Atendida o Inasistencia, y corrección autorizada por el Administrador (RN16).
- En el diagrama del paquete 3, CU-11 y CU-10 comparten la regla de prioridad de las citas postergadas (RN17): CU-10 oculta esos turnos al público y CU-11 los ofrece al reubicar.
- CU-24, CU-25 y CU-26 son aportes propios. Especificarlos y diagramarlos solo después de cumplir el mínimo (los 19 base y al menos 1 opcional); no son obligatorios.

## 11. Ciclos de desarrollo

Los 26 casos se desarrollan en dos ciclos. El Ciclo 1 reúne el núcleo operativo del sistema (acceso, pacientes, catálogos, horarios y citas); el Ciclo 2 completa el sistema con perfil, suspensión de horarios, notificaciones, historia clínica y reportes.

### Ciclo 1 (13 casos: todos base)

| ID | Caso de uso | Alcance |
|---|---|---|
| CU-01 | Iniciar y cerrar sesión | Base |
| CU-02 | Cambiar contraseña | Base |
| CU-03 | Registrarse como paciente | Base |
| CU-04 | Administrar usuarios y roles | Base |
| CU-05 | Gestionar pacientes | Base |
| CU-07 | Gestionar especialidades | Base |
| CU-08 | Gestionar médicos | Base |
| CU-09 | Gestionar horarios de atención | Base |
| CU-10 | Consultar disponibilidad | Base |
| CU-12 | Gestionar citas (programar, reprogramar, cancelar y confirmar) | Base |
| CU-13 | Registrar asistencia, inasistencia o atención | Base |
| CU-14 | Consultar agenda de citas | Base |
| CU-15 | Consultar historial y seguimiento de citas | Base |

### Ciclo 2 (13 casos: 6 base y 7 opcionales)

| ID | Caso de uso | Alcance |
|---|---|---|
| CU-06 | Gestionar mi perfil | Base |
| CU-11 | Suspender horario y gestionar citas afectadas | Base |
| CU-16 | Enviar notificaciones y recordatorios | Base |
| CU-17 | Consultar mis pacientes (kardex digital) | Base |
| CU-18 | Registrar atención clínica | Opcional |
| CU-19 | Registrar resultados de laboratorio | Opcional |
| CU-20 | Consultar historial clínico | Opcional |
| CU-21 | Consultar reportes de citas | Base |
| CU-22 | Consultar reporte de asistencia y pacientes registrados | Base |
| CU-23 | Exportar reportes (CSV/PDF) | Opcional |
| CU-24 | Consultar bitácora de auditoría | Opcional |
| CU-25 | Visualizar dashboard administrativo | Opcional |
| CU-26 | Generar y restaurar copias de seguridad | Opcional |

### Dependencias entre ciclos

Según las relaciones de la sección 5 y las especificaciones de la sección 7, algunos casos del Ciclo 1 se conectan con casos del Ciclo 2:

- **CU-12 (Ciclo 1) ← CU-16 (Ciclo 2):** CU-16 extiende a CU-12. En el Ciclo 1, CU-12 funciona sin avisos; los avisos al paciente cuando el personal reprograma o cancela se activan al llegar CU-16.
- **CU-08 y CU-09 (Ciclo 1) → CU-11 (Ciclo 2):** ambos advierten y remiten a CU-11 cuando se desactiva un médico o se cambia un horario con citas futuras. En el Ciclo 1 queda solo la advertencia; la resolución de las citas afectadas llega con CU-11.
- **CU-11 (Ciclo 2) → CU-10 y CU-12 (Ciclo 1):** CU-11 incluye CU-10 al reubicar y reutiliza la validación en el servidor de CU-12, por lo que depende de que el Ciclo 1 esté completo.
- **CU-13 (Ciclo 1) → CU-18 (Ciclo 2, opcional):** CU-13 solo cambia el estado de la cita; el registro clínico es CU-18.
- **Estado Postergada (esquema en el Ciclo 1, uso en el Ciclo 2):** conviene incluir el valor `postergada` desde el primer esquema de la base de datos, aunque solo CU-11 lo use.
- **RN17 (Ciclo 2) sobre CU-10 (Ciclo 1):** las reservas para postergadas solo existen cuando hay suspensiones. En el Ciclo 1, CU-10 muestra todos los turnos libres; la regla se activa al llegar CU-11.
- **Corrección autorizada (Ciclo 1):** CU-13 incluye la corrección del Administrador, que necesita la bitácora de cambios de estado ya en el Ciclo 1.
- **CU-06 (Ciclo 2):** la información médica declarada se gestiona aquí, mientras que CU-03 (Ciclo 1) captura solo los datos básicos del registro.
- **CU-23 (Ciclo 2) → CU-21 y CU-22:** CU-23 extiende a ambos y queda dentro del mismo ciclo.
- **Bitácora (Ciclo 1) → CU-24 (Ciclo 2):** los eventos de RN21 deben guardarse desde el Ciclo 1 (sesiones, usuarios, estados de citas), así que conviene crear la tabla de bitácora en el primer esquema, aunque la consulta llegue después.
- **CU-25 (Ciclo 2) → CU-21 y CU-22:** el dashboard reutiliza sus consultas y se desarrolla con ellos.
- **CU-26 (Ciclo 2):** independiente del resto; registra sus operaciones en la bitácora.

Los 7 casos opcionales (CU-18, CU-19, CU-20, CU-23, CU-24, CU-25 y CU-26) están todos en el Ciclo 2. Recuerda que hay que especificar y diagramar al menos uno de ellos para llegar a 20 casos.

## 12. Paquetes de casos de uso

Agrupación de los 26 casos en 6 paquetes, útil para organizar los diagramas de casos de uso. Cada paquete indica en qué ciclo se desarrolla cada caso.

### Paquete 1: Acceso y cuentas

| ID | Caso de uso | Alcance | Ciclo |
|---|---|---|---|
| CU-01 | Iniciar y cerrar sesión | Base | 1 |
| CU-02 | Cambiar contraseña | Base | 1 |
| CU-03 | Registrarse como paciente | Base | 1 |
| CU-04 | Administrar usuarios y roles | Base | 1 |
| CU-26 | Generar y restaurar copias de seguridad | Opcional | 2 |

### Paquete 2: Pacientes y perfil

| ID | Caso de uso | Alcance | Ciclo |
|---|---|---|---|
| CU-05 | Gestionar pacientes | Base | 1 |
| CU-06 | Gestionar mi perfil | Base | 2 |

### Paquete 3: Catálogos y horarios

| ID | Caso de uso | Alcance | Ciclo |
|---|---|---|---|
| CU-07 | Gestionar especialidades | Base | 1 |
| CU-08 | Gestionar médicos | Base | 1 |
| CU-09 | Gestionar horarios de atención | Base | 1 |
| CU-10 | Consultar disponibilidad | Base | 1 |
| CU-11 | Suspender horario y gestionar citas afectadas | Base | 2 |

### Paquete 4: Citas y notificaciones

| ID | Caso de uso | Alcance | Ciclo |
|---|---|---|---|
| CU-12 | Gestionar citas (programar, reprogramar, cancelar y confirmar) | Base | 1 |
| CU-13 | Registrar asistencia, inasistencia o atención | Base | 1 |
| CU-14 | Consultar agenda de citas | Base | 1 |
| CU-15 | Consultar historial y seguimiento de citas | Base | 1 |
| CU-16 | Enviar notificaciones y recordatorios | Base | 2 |

### Paquete 5: Historia clínica

| ID | Caso de uso | Alcance | Ciclo |
|---|---|---|---|
| CU-17 | Consultar mis pacientes (kardex digital) | Base | 2 |
| CU-18 | Registrar atención clínica | Opcional | 2 |
| CU-19 | Registrar resultados de laboratorio | Opcional | 2 |
| CU-20 | Consultar historial clínico | Opcional | 2 |

### Paquete 6: Reportes

| ID | Caso de uso | Alcance | Ciclo |
|---|---|---|---|
| CU-21 | Consultar reportes de citas | Base | 2 |
| CU-22 | Consultar reporte de asistencia y pacientes registrados | Base | 2 |
| CU-23 | Exportar reportes (CSV/PDF) | Opcional | 2 |
| CU-24 | Consultar bitácora de auditoría | Opcional | 2 |
| CU-25 | Visualizar dashboard administrativo | Opcional | 2 |

Nota: los paquetes 3 y 4 unen categorías que en la sección 3 aparecen separadas (Catálogos + Horarios, y Citas + Notificaciones). Las relaciones `<<include>>` y `<<extend>>` entre paquetes (por ejemplo, CU-11 → CU-16 o CU-12 ← CU-16) se dibujan en el diagrama de cada paquete indicando el caso externo. CU-26 se ubica en el paquete 1 por ser administración del sistema; CU-24 y CU-25 van en el paquete 6 por ser consultas del Administrador.

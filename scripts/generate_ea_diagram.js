const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================================
// ENTERPRISE ARCHITECT COLOR PALETTE & DESIGN SYSTEM
// ============================================================================
const EA_COLORS = {
  canvasBg: '#FFFFFF',
  gridDot: '#E2E8F0',
  packageBorder: '#5B7C99',
  packageTabBg: '#EAF2F8',
  packageTabBorder: '#5B7C99',
  packageTabFont: '#16325C',
  packageBodyBg: '#FBFCFE',
  classBorder: '#234C73',
  classHeaderBgStart: '#EBF4FA',
  classHeaderBgEnd: '#D3E6F5',
  classHeaderFont: '#00264D',
  classStereotypeFont: '#4B6584',
  classBodyBg: '#FFFFFF',
  pkFont: '#0F4C81',
  pkIcon: '#D97706',
  attrFont: '#1F2937',
  relationLine: '#2B547E',
  verbBoxBg: '#FFFFFF',
  verbBoxBorder: '#94A3B8',
  verbFont: '#1E3A8A',
  cardinalityFont: '#0F172A',
  dividerLine: '#A5C4DF'
};

// ============================================================================
// ULTRA HIGH DEFINITION (8K / 300+ DPI EQUIVALENT) CANVAS CONFIGURATION
// Scale factor: 2x base coordinates -> 6900 x 4320 px (approx 30 Megapixels)
// ============================================================================
const SCALE = 2;
const BASE_WIDTH = 3450;
const BASE_HEIGHT = 2160;
const CANVAS_WIDTH = BASE_WIDTH * SCALE;   // 6900 px
const CANVAS_HEIGHT = BASE_HEIGHT * SCALE; // 4320 px

// Logical Packages Definition
const BASE_PACKAGES = [
  {
    id: 'pkg_acceso',
    name: 'Paquete: Acceso y Cuentas (Seguridad y Usuarios)',
    x: 40,
    y: 160,
    w: 780,
    h: 890
  },
  {
    id: 'pkg_pacientes',
    name: 'Paquete: Pacientes y Perfil (Datos del Paciente)',
    x: 860,
    y: 160,
    w: 1110,
    h: 890
  },
  {
    id: 'pkg_catalogos',
    name: 'Paquete: Catálogos y Horarios (Gestión Médica)',
    x: 2020,
    y: 160,
    w: 1390,
    h: 890
  },
  {
    id: 'pkg_admin',
    name: 'Paquete: Administración y Auditoría (Sistema y Resguardo)',
    x: 40,
    y: 1120,
    w: 780,
    h: 980
  },
  {
    id: 'pkg_citas',
    name: 'Paquete: Citas y Notificaciones (Atención Ambulatoria y Pagos)',
    x: 860,
    y: 1120,
    w: 1340,
    h: 980
  },
  {
    id: 'pkg_historia',
    name: 'Paquete: Historia Clínica (Atención Médica y Diagnóstico)',
    x: 2240,
    y: 1120,
    w: 1170,
    h: 980
  }
];

const PACKAGES = BASE_PACKAGES.map(pkg => ({
  id: pkg.id,
  name: pkg.name,
  x: pkg.x * SCALE,
  y: pkg.y * SCALE,
  w: pkg.w * SCALE,
  h: pkg.h * SCALE
}));

// ============================================================================
// ALL 23 DATABASE TABLES & ATTRIBUTES (INSPECTED FROM POSTGRESQL MIGRATIONS)
// Strictly adhering to Enterprise Architect modeling rules:
// - ONLY column names (NO data types)
// - NO foreign keys (FK) in attribute compartment (pure relations)
// - PK identified with + id_columna (PK)
// - Operations compartment completely empty
// ============================================================================
const BASE_TABLES = [
  // --- Paquete: Acceso y Cuentas ---
  {
    id: 'roles',
    name: 'roles',
    package: 'pkg_acceso',
    x: 70,
    y: 220,
    w: 240,
    pk: ['id_rol'],
    attributes: [
      'nombre',
      'descripcion',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'permisos',
    name: 'permisos',
    package: 'pkg_acceso',
    x: 480,
    y: 220,
    w: 260,
    pk: ['id_permiso'],
    attributes: [
      'modulo',
      'nombre',
      'slug',
      'descripcion',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'rol_permiso',
    name: 'rol_permiso',
    package: 'pkg_acceso',
    x: 280,
    y: 440,
    w: 230,
    pk: ['id_rol, id_permiso'],
    attributes: [
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'usuarios',
    name: 'usuarios',
    package: 'pkg_acceso',
    x: 70,
    y: 630,
    w: 270,
    pk: ['id_usuario'],
    attributes: [
      'nombre_usuario',
      'correo',
      'contrasena_hash',
      'debe_cambiar_contrasena',
      'estado',
      'ultimo_acceso',
      'token_sesion',
      'created_at',
      'updated_at'
    ]
  },

  // --- Paquete: Pacientes y Perfil ---
  {
    id: 'personas',
    name: 'personas',
    package: 'pkg_pacientes',
    x: 890,
    y: 220,
    w: 260,
    pk: ['id_persona'],
    attributes: [
      'ci',
      'nombres',
      'apellidos',
      'fecha_nacimiento',
      'sexo',
      'telefono',
      'correo',
      'direccion',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'pacientes',
    name: 'pacientes',
    package: 'pkg_pacientes',
    x: 1280,
    y: 220,
    w: 250,
    pk: ['id_paciente'],
    attributes: [
      'codigo_historia',
      'grupo_sanguineo',
      'estado',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'informacion_medica_paciente',
    name: 'informacion_medica_paciente',
    package: 'pkg_pacientes',
    x: 1650,
    y: 220,
    w: 290,
    pk: ['id_informacion_medica'],
    attributes: [
      'alergias',
      'enfermedades_cronicas',
      'medicamentos_actuales',
      'antecedentes_familiares',
      'observaciones',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'contactos_emergencia',
    name: 'contactos_emergencia',
    package: 'pkg_pacientes',
    x: 1280,
    y: 540,
    w: 260,
    pk: ['id_contacto_emergencia'],
    attributes: [
      'nombre_completo',
      'relacion',
      'telefono',
      'direccion',
      'es_principal',
      'created_at',
      'updated_at'
    ]
  },

  // --- Paquete: Catálogos y Horarios ---
  {
    id: 'medicos',
    name: 'medicos',
    package: 'pkg_catalogos',
    x: 2060,
    y: 220,
    w: 250,
    pk: ['id_medico'],
    attributes: [
      'nro_matricula',
      'biografia',
      'estado',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'especialidades',
    name: 'especialidades',
    package: 'pkg_catalogos',
    x: 2500,
    y: 220,
    w: 280,
    pk: ['id_especialidad'],
    attributes: [
      'nombre',
      'nombre_normalizado',
      'descripcion',
      'duracion_turno_minutos',
      'reservable_en_linea',
      'estado',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'medico_especialidad',
    name: 'medico_especialidad',
    package: 'pkg_catalogos',
    x: 2280,
    y: 490,
    w: 240,
    pk: ['id_medico_especialidad'],
    attributes: [
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'horarios_atencion',
    name: 'horarios_atencion',
    package: 'pkg_catalogos',
    x: 2630,
    y: 520,
    w: 270,
    pk: ['id_horario'],
    attributes: [
      'dia_semana',
      'hora_inicio',
      'hora_fin',
      'duracion_intervalo_minutos',
      'estado',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'suspensiones_horario',
    name: 'suspensiones_horario',
    package: 'pkg_catalogos',
    x: 2060,
    y: 770,
    w: 260,
    pk: ['id_suspension'],
    attributes: [
      'fecha_inicio',
      'fecha_fin',
      'motivo',
      'estado_citas_accion',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'bloqueos_clinica',
    name: 'bloqueos_clinica',
    package: 'pkg_catalogos',
    x: 2440,
    y: 770,
    w: 250,
    pk: ['id_bloqueo'],
    attributes: [
      'titulo',
      'motivo',
      'fecha_inicio',
      'fecha_fin',
      'aplica_a_todos',
      'estado',
      'created_at',
      'updated_at'
    ]
  },

  // --- Paquete: Citas y Notificaciones ---
  {
    id: 'estados_cita',
    name: 'estados_cita',
    package: 'pkg_citas',
    x: 890,
    y: 1200,
    w: 240,
    pk: ['id_estado_cita'],
    attributes: [
      'codigo',
      'nombre',
      'descripcion',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'citas',
    name: 'citas',
    package: 'pkg_citas',
    x: 1300,
    y: 1200,
    w: 290,
    pk: ['id_cita'],
    attributes: [
      'codigo_cita',
      'fecha_cita',
      'hora_inicio',
      'hora_fin',
      'motivo_consulta',
      'observaciones',
      'es_postergada',
      'fecha_expiracion_reserva',
      'pago_confirmado',
      'estado',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'pagos_cita',
    name: 'pagos_cita',
    package: 'pkg_citas',
    x: 1740,
    y: 1200,
    w: 270,
    pk: ['id_pago'],
    attributes: [
      'monto',
      'metodo_pago',
      'nro_transaccion',
      'estado_pago',
      'detalles_pasarela',
      'fecha_pago',
      'fecha_reembolso',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'notificaciones',
    name: 'notificaciones',
    package: 'pkg_citas',
    x: 890,
    y: 1520,
    w: 250,
    pk: ['id_notificacion'],
    attributes: [
      'tipo',
      'titulo',
      'mensaje',
      'leido',
      'fecha_leido',
      'metadata',
      'created_at',
      'updated_at'
    ]
  },

  // --- Paquete: Historia Clínica ---
  {
    id: 'atenciones_clinicas',
    name: 'atenciones_clinicas',
    package: 'pkg_historia',
    x: 2280,
    y: 1200,
    w: 280,
    pk: ['id_atencion'],
    attributes: [
      'motivo_atencion',
      'examen_fisico',
      'diagnostico',
      'tratamiento_indicaciones',
      'receta_medica',
      'fecha_atencion',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'resultados_laboratorio',
    name: 'resultados_laboratorio',
    package: 'pkg_historia',
    x: 2740,
    y: 1200,
    w: 270,
    pk: ['id_resultado'],
    attributes: [
      'tipo_estudio',
      'descripcion',
      'archivo_adjunto',
      'fecha_estudio',
      'created_at',
      'updated_at'
    ]
  },

  // --- Paquete: Administración y Auditoría ---
  {
    id: 'bitacora_auditoria',
    name: 'bitacora_auditoria',
    package: 'pkg_admin',
    x: 70,
    y: 1200,
    w: 270,
    pk: ['id_bitacora'],
    attributes: [
      'caso_uso',
      'accion',
      'tabla_afectada',
      'registro_id',
      'datos_anteriores',
      'datos_nuevos',
      'ip_origen',
      'user_agent',
      'fecha_hora',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'copias_seguridad',
    name: 'copias_seguridad',
    package: 'pkg_admin',
    x: 400,
    y: 1200,
    w: 250,
    pk: ['id_copia'],
    attributes: [
      'nombre_archivo',
      'ruta_almacenamiento',
      'tamano_bytes',
      'tipo',
      'estado',
      'created_at',
      'updated_at'
    ]
  },
  {
    id: 'parametros_sistema',
    name: 'parametros_sistema',
    package: 'pkg_admin',
    x: 400,
    y: 1530,
    w: 250,
    pk: ['id_parametro'],
    attributes: [
      'clave',
      'valor',
      'descripcion',
      'tipo_dato',
      'created_at',
      'updated_at'
    ]
  }
];

const TABLES = BASE_TABLES.map(table => {
  const scaledTable = {
    id: table.id,
    name: table.name,
    package: table.package,
    x: table.x * SCALE,
    y: table.y * SCALE,
    w: table.w * SCALE,
    pk: table.pk,
    attributes: table.attributes
  };

  const headerHeight = 44 * SCALE;
  const attrLineHeight = 22 * SCALE;
  const padding = 16 * SCALE;
  const totalAttrs = scaledTable.pk.length + scaledTable.attributes.length;
  scaledTable.h = headerHeight + (totalAttrs * attrLineHeight) + padding;
  return scaledTable;
});

// ============================================================================
// RELATIONSHIPS DEFINITION (ORTHOGONAL ROUTING, ZERO BOX INTERSECTIONS)
// Every relationship has:
// - Verbs: Descriptive action ("asigna rol a", "se registra como", "atiende", etc.)
// - Cardinalities: Multiplicities on both endpoints (1, 0..1, 1..*, 0..*)
// ============================================================================
const BASE_RELATIONS = [
  // 1. roles -> usuarios
  {
    from: 'roles',
    to: 'usuarios',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'asigna rol a',
    waypoints: [
      { x: 160, y: 370 },
      { x: 160, y: 630 }
    ],
    verbPos: { x: 160, y: 495 }
  },
  // 2. roles -> rol_permiso
  {
    from: 'roles',
    to: 'rol_permiso',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'posee',
    waypoints: [
      { x: 310, y: 290 },
      { x: 360, y: 290 },
      { x: 360, y: 440 }
    ],
    verbPos: { x: 360, y: 355 }
  },
  // 3. permisos -> rol_permiso
  {
    from: 'permisos',
    to: 'rol_permiso',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'concedido en',
    waypoints: [
      { x: 480, y: 330 },
      { x: 430, y: 330 },
      { x: 430, y: 440 }
    ],
    verbPos: { x: 430, y: 380 }
  },
  // 4. usuarios -> personas
  {
    from: 'usuarios',
    to: 'personas',
    cardFrom: '0..1',
    cardTo: '1',
    verb: 'accede como',
    waypoints: [
      { x: 340, y: 680 },
      { x: 840, y: 680 },
      { x: 840, y: 360 },
      { x: 890, y: 360 }
    ],
    verbPos: { x: 590, y: 680 }
  },
  // 5. personas -> pacientes
  {
    from: 'personas',
    to: 'pacientes',
    cardFrom: '1',
    cardTo: '0..1',
    verb: 'se registra como',
    waypoints: [
      { x: 1150, y: 300 },
      { x: 1280, y: 300 }
    ],
    verbPos: { x: 1215, y: 300 }
  },
  // 6. personas -> medicos
  {
    from: 'personas',
    to: 'medicos',
    cardFrom: '1',
    cardTo: '0..1',
    verb: 'se acredita como',
    waypoints: [
      { x: 1020, y: 220 },
      { x: 1020, y: 185 },
      { x: 2185, y: 185 },
      { x: 2185, y: 220 }
    ],
    verbPos: { x: 1600, y: 185 }
  },
  // 7. pacientes -> informacion_medica_paciente
  {
    from: 'pacientes',
    to: 'informacion_medica_paciente',
    cardFrom: '1',
    cardTo: '0..1',
    verb: 'posee ficha',
    waypoints: [
      { x: 1530, y: 290 },
      { x: 1650, y: 290 }
    ],
    verbPos: { x: 1590, y: 290 }
  },
  // 8. pacientes -> contactos_emergencia
  {
    from: 'pacientes',
    to: 'contactos_emergencia',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'registra',
    waypoints: [
      { x: 1410, y: 391 },
      { x: 1410, y: 540 }
    ],
    verbPos: { x: 1410, y: 465 }
  },
  // 9. medicos -> medico_especialidad
  {
    from: 'medicos',
    to: 'medico_especialidad',
    cardFrom: '1',
    cardTo: '1..*',
    verb: 'ejerce',
    waypoints: [
      { x: 2250, y: 391 },
      { x: 2250, y: 440 },
      { x: 2340, y: 440 },
      { x: 2340, y: 490 }
    ],
    verbPos: { x: 2340, y: 440 }
  },
  // 10. especialidades -> medico_especialidad
  {
    from: 'especialidades',
    to: 'medico_especialidad',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'agrupa',
    waypoints: [
      { x: 2540, y: 454 },
      { x: 2540, y: 470 },
      { x: 2460, y: 470 },
      { x: 2460, y: 490 }
    ],
    verbPos: { x: 2500, y: 470 }
  },
  // 11. medicos -> horarios_atencion
  {
    from: 'medicos',
    to: 'horarios_atencion',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'cumple',
    waypoints: [
      { x: 2200, y: 391 },
      { x: 2200, y: 465 },
      { x: 2720, y: 465 },
      { x: 2720, y: 520 }
    ],
    verbPos: { x: 2600, y: 465 }
  },
  // 12. especialidades -> horarios_atencion
  {
    from: 'especialidades',
    to: 'horarios_atencion',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'se programa en',
    waypoints: [
      { x: 2760, y: 454 },
      { x: 2760, y: 520 }
    ],
    verbPos: { x: 2760, y: 485 }
  },
  // 13. medicos -> suspensiones_horario
  {
    from: 'medicos',
    to: 'suspensiones_horario',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'declara',
    waypoints: [
      { x: 2140, y: 391 },
      { x: 2140, y: 770 }
    ],
    verbPos: { x: 2140, y: 580 }
  },
  // 14. medicos -> bloqueos_clinica
  {
    from: 'medicos',
    to: 'bloqueos_clinica',
    cardFrom: '0..1',
    cardTo: '0..*',
    verb: 'afectado por',
    waypoints: [
      { x: 2220, y: 391 },
      { x: 2220, y: 670 },
      { x: 2520, y: 670 },
      { x: 2520, y: 770 }
    ],
    verbPos: { x: 2370, y: 670 }
  },
  // 15. pacientes -> citas (Rerouted around contactos_emergencia)
  {
    from: 'pacientes',
    to: 'citas',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'solicita',
    waypoints: [
      { x: 1310, y: 391 },
      { x: 1310, y: 460 },
      { x: 1220, y: 460 },
      { x: 1220, y: 1050 },
      { x: 1350, y: 1050 },
      { x: 1350, y: 1200 }
    ],
    verbPos: { x: 1220, y: 800 }
  },
  // 16. medicos -> citas (Routed via open vertical alley x=2010)
  {
    from: 'medicos',
    to: 'citas',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'atiende',
    waypoints: [
      { x: 2060, y: 320 },
      { x: 2010, y: 320 },
      { x: 2010, y: 1080 },
      { x: 1470, y: 1080 },
      { x: 1470, y: 1200 }
    ],
    verbPos: { x: 2010, y: 680 }
  },
  // 17. especialidades -> citas (Routed via top open lane y=170)
  {
    from: 'especialidades',
    to: 'citas',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'corresponde a',
    waypoints: [
      { x: 2640, y: 220 },
      { x: 2640, y: 170 },
      { x: 1980, y: 170 },
      { x: 1980, y: 1100 },
      { x: 1530, y: 1100 },
      { x: 1530, y: 1200 }
    ],
    verbPos: { x: 1980, y: 550 }
  },
  // 18. estados_cita -> citas
  {
    from: 'estados_cita',
    to: 'citas',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'clasifica',
    waypoints: [
      { x: 1130, y: 1260 },
      { x: 1300, y: 1260 }
    ],
    verbPos: { x: 1215, y: 1260 }
  },
  // 19. usuarios -> citas (creado_por_usuario)
  {
    from: 'usuarios',
    to: 'citas',
    cardFrom: '0..1',
    cardTo: '0..*',
    verb: 'agenda / reserva',
    waypoints: [
      { x: 340, y: 840 },
      { x: 840, y: 840 },
      { x: 840, y: 1060 },
      { x: 1390, y: 1060 },
      { x: 1390, y: 1200 }
    ],
    verbPos: { x: 1100, y: 1060 }
  },
  // 20. citas -> pagos_cita
  {
    from: 'citas',
    to: 'pagos_cita',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'liquida mediante',
    waypoints: [
      { x: 1590, y: 1280 },
      { x: 1740, y: 1280 }
    ],
    verbPos: { x: 1665, y: 1280 }
  },
  // 21. usuarios -> notificaciones
  {
    from: 'usuarios',
    to: 'notificaciones',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'recibe',
    waypoints: [
      { x: 200, y: 896 },
      { x: 200, y: 1020 },
      { x: 850, y: 1020 },
      { x: 850, y: 1580 },
      { x: 890, y: 1580 }
    ],
    verbPos: { x: 850, y: 1340 }
  },
  // 22. citas -> atenciones_clinicas (Routed above pagos_cita at y=1150)
  {
    from: 'citas',
    to: 'atenciones_clinicas',
    cardFrom: '1',
    cardTo: '0..1',
    verb: 'origina',
    waypoints: [
      { x: 1560, y: 1200 },
      { x: 1560, y: 1150 },
      { x: 2350, y: 1150 },
      { x: 2350, y: 1200 }
    ],
    verbPos: { x: 1950, y: 1150 }
  },
  // 23. pacientes -> atenciones_clinicas (Routed via horizontal lane y=1000)
  {
    from: 'pacientes',
    to: 'atenciones_clinicas',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'recibe atención',
    waypoints: [
      { x: 1530, y: 360 },
      { x: 1590, y: 360 },
      { x: 1590, y: 1000 },
      { x: 2420, y: 1000 },
      { x: 2420, y: 1200 }
    ],
    verbPos: { x: 2015, y: 1000 }
  },
  // 24. medicos -> atenciones_clinicas (Routed around right border lane x=2930)
  {
    from: 'medicos',
    to: 'atenciones_clinicas',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'registra consulta',
    waypoints: [
      { x: 2310, y: 270 },
      { x: 2930, y: 270 },
      { x: 2930, y: 1130 },
      { x: 2500, y: 1130 },
      { x: 2500, y: 1200 }
    ],
    verbPos: { x: 2930, y: 800 }
  },
  // 25. pacientes -> resultados_laboratorio (Routed via horizontal lane y=960)
  {
    from: 'pacientes',
    to: 'resultados_laboratorio',
    cardFrom: '1',
    cardTo: '0..*',
    verb: 'pertenece a',
    waypoints: [
      { x: 1530, y: 330 },
      { x: 1610, y: 330 },
      { x: 1610, y: 960 },
      { x: 2840, y: 960 },
      { x: 2840, y: 1200 }
    ],
    verbPos: { x: 2220, y: 960 }
  },
  // 26. atenciones_clinicas -> resultados_laboratorio
  {
    from: 'atenciones_clinicas',
    to: 'resultados_laboratorio',
    cardFrom: '0..1',
    cardTo: '0..*',
    verb: 'deriva en',
    waypoints: [
      { x: 2560, y: 1280 },
      { x: 2740, y: 1280 }
    ],
    verbPos: { x: 2650, y: 1280 }
  },
  // 27. usuarios -> bitacora_auditoria
  {
    from: 'usuarios',
    to: 'bitacora_auditoria',
    cardFrom: '0..1',
    cardTo: '0..*',
    verb: 'genera traza',
    waypoints: [
      { x: 120, y: 896 },
      { x: 120, y: 1200 }
    ],
    verbPos: { x: 120, y: 1050 }
  },
  // 28. usuarios -> copias_seguridad
  {
    from: 'usuarios',
    to: 'copias_seguridad',
    cardFrom: '0..1',
    cardTo: '0..*',
    verb: 'ejecuta respaldo',
    waypoints: [
      { x: 280, y: 896 },
      { x: 280, y: 1070 },
      { x: 480, y: 1070 },
      { x: 480, y: 1200 }
    ],
    verbPos: { x: 380, y: 1070 }
  }
];

const RELATIONS = BASE_RELATIONS.map(rel => ({
  from: rel.from,
  to: rel.to,
  cardFrom: rel.cardFrom,
  cardTo: rel.cardTo,
  verb: rel.verb,
  waypoints: rel.waypoints.map(pt => ({ x: pt.x * SCALE, y: pt.y * SCALE })),
  verbPos: { x: rel.verbPos.x * SCALE, y: rel.verbPos.y * SCALE }
}));

// ============================================================================
// SVG GENERATOR WITH 100% STRICT XML 1.0 COMPLIANCE
// All XML entities strictly escaped:
// - No HTML named entities like &bull;, &laquo;, &raquo;
// - Uses standard numeric character references: &#8226; (bullet), &#171; («), &#187; (»)
// - All ampersands & in text escaped as &amp;
// ============================================================================
function generateSvg() {
  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}" 
     width="${CANVAS_WIDTH}" 
     height="${CANVAS_HEIGHT}"
     style="background-color: ${EA_COLORS.canvasBg}; font-family: 'Segoe UI', Arial, sans-serif;">

  <defs>
    <!-- Background grid pattern -->
    <pattern id="eaGrid" width="${20 * SCALE}" height="${20 * SCALE}" patternUnits="userSpaceOnUse">
      <circle cx="${2 * SCALE}" cy="${2 * SCALE}" r="${0.8 * SCALE}" fill="${EA_COLORS.gridDot}" />
    </pattern>

    <!-- Header Gradient for EA Class Boxes -->
    <linearGradient id="eaHeaderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${EA_COLORS.classHeaderBgStart}" />
      <stop offset="100%" stop-color="${EA_COLORS.classHeaderBgEnd}" />
    </linearGradient>

    <!-- Package Header Tab Gradient -->
    <linearGradient id="eaPkgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FB" />
      <stop offset="100%" stop-color="#DAEAF5" />
    </linearGradient>

    <!-- Subtle Drop Shadow -->
    <filter id="eaShadow" x="-2%" y="-2%" width="105%" height="106%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="${2 * SCALE}" dy="${3 * SCALE}" stdDeviation="${2.5 * SCALE}" flood-color="#0F172A" flood-opacity="0.14" />
    </filter>
  </defs>

  <!-- Canvas Background with Grid -->
  <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="${EA_COLORS.canvasBg}" />
  <rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="url(#eaGrid)" opacity="0.65" />

  <!-- ========================================== -->
  <!-- TOP HEADER / BANNER (ENTERPRISE ARCHITECT) -->
  <!-- ========================================== -->
  <g id="diagram_header">
    <rect x="${40 * SCALE}" y="${30 * SCALE}" width="${CANVAS_WIDTH - 80 * SCALE}" height="${100 * SCALE}" rx="${4 * SCALE}" fill="#FFFFFF" stroke="${EA_COLORS.classBorder}" stroke-width="${1.6 * SCALE}" filter="url(#eaShadow)" />
    <rect x="${40 * SCALE}" y="${30 * SCALE}" width="${14 * SCALE}" height="${100 * SCALE}" fill="${EA_COLORS.classBorder}" />
    
    <!-- Title & System Name -->
    <text x="${75 * SCALE}" y="${72 * SCALE}" font-size="${24 * SCALE}" font-weight="bold" fill="#0A2540" letter-spacing="1">
      DIAGRAMA DE CLASES DE BASE DE DATOS &#8212; CL&#205;NICA VIDA SALUD
    </text>
    <text x="${75 * SCALE}" y="${104 * SCALE}" font-size="${13 * SCALE}" fill="#4B6584" font-weight="600">
      Modelo Relacional Integral PostgreSQL 18 &#8226; 23 Tablas F&#237;sicas &#8226; Agrupaci&#243;n por Paquetes L&#243;gicos &#8226; Notaci&#243;n Enterprise Architect UML 2.5
    </text>

    <!-- Metadata Badges -->
    <g transform="translate(${CANVAS_WIDTH - 980 * SCALE}, ${50 * SCALE})">
      <rect x="0" y="0" width="${160 * SCALE}" height="${60 * SCALE}" rx="${3 * SCALE}" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="${1 * SCALE}"/>
      <text x="${12 * SCALE}" y="${24 * SCALE}" font-size="${10 * SCALE}" font-weight="bold" fill="#64748B">PROYECTO</text>
      <text x="${12 * SCALE}" y="${46 * SCALE}" font-size="${13 * SCALE}" font-weight="bold" fill="#0F172A">Cl&#237;nica Vida Salud</text>

      <rect x="${175 * SCALE}" y="0" width="${140 * SCALE}" height="${60 * SCALE}" rx="${3 * SCALE}" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="${1 * SCALE}"/>
      <text x="${187 * SCALE}" y="${24 * SCALE}" font-size="${10 * SCALE}" font-weight="bold" fill="#64748B">VERSI&#211;N / FECHA</text>
      <text x="${187 * SCALE}" y="${46 * SCALE}" font-size="${13 * SCALE}" font-weight="bold" fill="#0F172A">v2.0 &#8226; 2026-10-24</text>

      <rect x="${330 * SCALE}" y="0" width="${160 * SCALE}" height="${60 * SCALE}" rx="${3 * SCALE}" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="${1 * SCALE}"/>
      <text x="${342 * SCALE}" y="${24 * SCALE}" font-size="${10 * SCALE}" font-weight="bold" fill="#64748B">MOTOR BD</text>
      <text x="${342 * SCALE}" y="${46 * SCALE}" font-size="${13 * SCALE}" font-weight="bold" fill="#0F172A">PostgreSQL Nativo</text>

      <rect x="${505 * SCALE}" y="0" width="${160 * SCALE}" height="${60 * SCALE}" rx="${3 * SCALE}" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="${1 * SCALE}"/>
      <text x="${517 * SCALE}" y="${24 * SCALE}" font-size="${10 * SCALE}" font-weight="bold" fill="#64748B">DISE&#209;O Y ESTILO</text>
      <text x="${517 * SCALE}" y="${46 * SCALE}" font-size="${13 * SCALE}" font-weight="bold" fill="#0F172A">Enterprise Architect</text>

      <rect x="${680 * SCALE}" y="0" width="${230 * SCALE}" height="${60 * SCALE}" rx="${3 * SCALE}" fill="#EBF3FA" stroke="${EA_COLORS.classBorder}" stroke-width="${1 * SCALE}"/>
      <text x="${692 * SCALE}" y="${24 * SCALE}" font-size="${10 * SCALE}" font-weight="bold" fill="${EA_COLORS.pkFont}">ARQUITECTURA</text>
      <text x="${692 * SCALE}" y="${46 * SCALE}" font-size="${13 * SCALE}" font-weight="bold" fill="${EA_COLORS.classHeaderFont}">Package-by-Feature (CU)</text>
    </g>
  </g>
`;

  // Draw Packages
  PACKAGES.forEach(pkg => {
    const tabWidth = Math.min(pkg.w * 0.65, 420 * SCALE);
    const tabHeight = 32 * SCALE;
    svg += `
  <!-- Package: ${pkg.name} -->
  <g id="${pkg.id}">
    <!-- Package Tab -->
    <path d="M ${pkg.x} ${pkg.y} 
             L ${pkg.x} ${pkg.y - tabHeight + 4 * SCALE} 
             Q ${pkg.x} ${pkg.y - tabHeight} ${pkg.x + 4 * SCALE} ${pkg.y - tabHeight} 
             L ${pkg.x + tabWidth - 12 * SCALE} ${pkg.y - tabHeight} 
             L ${pkg.x + tabWidth} ${pkg.y} Z" 
          fill="url(#eaPkgGrad)" stroke="${EA_COLORS.packageBorder}" stroke-width="${1.6 * SCALE}" />
    <text x="${pkg.x + 14 * SCALE}" y="${pkg.y - 11 * SCALE}" font-size="${12 * SCALE}" font-weight="bold" fill="${EA_COLORS.packageTabFont}">
      ${pkg.name}
    </text>

    <!-- Package Body -->
    <rect x="${pkg.x}" y="${pkg.y}" width="${pkg.w}" height="${pkg.h}" 
          fill="${EA_COLORS.packageBodyBg}" stroke="${EA_COLORS.packageBorder}" stroke-width="${1.5 * SCALE}" stroke-dasharray="${6 * SCALE},${4 * SCALE}" rx="${2 * SCALE}" />
  </g>
`;
  });

  // Draw Relationships (underneath class boxes)
  RELATIONS.forEach((rel, idx) => {
    let d = '';
    rel.waypoints.forEach((pt, pIdx) => {
      d += (pIdx === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
    });

    const firstPt = rel.waypoints[0];
    const secondPt = rel.waypoints[1];
    const lastPt = rel.waypoints[rel.waypoints.length - 1];
    const secondLastPt = rel.waypoints[rel.waypoints.length - 2];

    // Compute offset for cardinality labels
    const cardFromPos = {
      x: firstPt.x + (secondPt.x > firstPt.x ? 12 * SCALE : secondPt.x < firstPt.x ? -24 * SCALE : 10 * SCALE),
      y: firstPt.y + (secondPt.y > firstPt.y ? 18 * SCALE : secondPt.y < firstPt.y ? -10 * SCALE : -8 * SCALE)
    };
    const cardToPos = {
      x: lastPt.x + (secondLastPt.x > lastPt.x ? 12 * SCALE : secondLastPt.x < lastPt.x ? -26 * SCALE : 10 * SCALE),
      y: lastPt.y + (secondLastPt.y > lastPt.y ? 18 * SCALE : secondLastPt.y < lastPt.y ? -12 * SCALE : -8 * SCALE)
    };

    const verbWidth = (rel.verb.length * 6.8 + 20) * SCALE;

    svg += `
  <!-- Relation ${idx + 1}: ${rel.from} -> ${rel.to} -->
  <g id="rel_${rel.from}_${rel.to}">
    <!-- Solid Association Line -->
    <path d="${d}" fill="none" stroke="${EA_COLORS.relationLine}" stroke-width="${1.6 * SCALE}" stroke-linecap="round" stroke-linejoin="round" />

    <!-- Cardinality From -->
    <text x="${cardFromPos.x}" y="${cardFromPos.y}" font-size="${11 * SCALE}" font-weight="bold" fill="${EA_COLORS.cardinalityFont}">
      ${rel.cardFrom}
    </text>

    <!-- Cardinality To -->
    <text x="${cardToPos.x}" y="${cardToPos.y}" font-size="${11 * SCALE}" font-weight="bold" fill="${EA_COLORS.cardinalityFont}">
      ${rel.cardTo}
    </text>

    <!-- Verb / Descriptive Action Badge -->
    <g transform="translate(${rel.verbPos.x - verbWidth / 2}, ${rel.verbPos.y - 10 * SCALE})">
      <rect x="0" y="0" width="${verbWidth}" height="${20 * SCALE}" rx="${3 * SCALE}" fill="${EA_COLORS.verbBoxBg}" stroke="${EA_COLORS.verbBoxBorder}" stroke-width="${1 * SCALE}" />
      <text x="${verbWidth / 2}" y="${14 * SCALE}" text-anchor="middle" font-size="${10.5 * SCALE}" font-weight="600" fill="${EA_COLORS.verbFont}">
        ${rel.verb}
      </text>
    </g>
  </g>
`;
  });

  // Draw Table / Class Boxes (Enterprise Architect Style)
  TABLES.forEach(tbl => {
    const headerHeight = 44 * SCALE;
    svg += `
  <!-- Class: ${tbl.name} -->
  <g id="table_${tbl.id}" filter="url(#eaShadow)">
    <!-- Class Outer Box -->
    <rect x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${tbl.h}" 
          fill="${EA_COLORS.classBodyBg}" stroke="${EA_COLORS.classBorder}" stroke-width="${1.6 * SCALE}" rx="${2 * SCALE}" />

    <!-- Class Header Compartment -->
    <rect x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${headerHeight}" 
          fill="url(#eaHeaderGrad)" rx="${2 * SCALE}" />
    <!-- Header bottom border line -->
    <line x1="${tbl.x}" y1="${tbl.y + headerHeight}" x2="${tbl.x + tbl.w}" y2="${tbl.y + headerHeight}" 
          stroke="${EA_COLORS.classBorder}" stroke-width="${1.6 * SCALE}" />

    <!-- Stereotype «table» (strictly escaped numeric XML character references) -->
    <text x="${tbl.x + tbl.w / 2}" y="${tbl.y + 16 * SCALE}" text-anchor="middle" 
          font-size="${10.5 * SCALE}" font-style="italic" fill="${EA_COLORS.classStereotypeFont}">
      &#171;table&#187;
    </text>

    <!-- Class / Table Name -->
    <text x="${tbl.x + tbl.w / 2}" y="${tbl.y + 35 * SCALE}" text-anchor="middle" 
          font-size="${14 * SCALE}" font-weight="bold" fill="${EA_COLORS.classHeaderFont}" letter-spacing="0.5">
      ${tbl.name}
    </text>

    <!-- Attributes Compartment -->
    <g id="attrs_${tbl.id}">
`;

    let currentY = tbl.y + headerHeight + 18 * SCALE;

    // Primary Keys
    tbl.pk.forEach(pkAttr => {
      svg += `      <!-- PK -->
      <g transform="translate(${tbl.x + 12 * SCALE}, ${currentY})">
        <!-- Key Icon Symbol -->
        <circle cx="${5 * SCALE}" cy="${-4 * SCALE}" r="${3.5 * SCALE}" fill="none" stroke="${EA_COLORS.pkIcon}" stroke-width="${1.2 * SCALE}" />
        <line x1="${8.5 * SCALE}" y1="${-4 * SCALE}" x2="${14 * SCALE}" y2="${-4 * SCALE}" stroke="${EA_COLORS.pkIcon}" stroke-width="${1.2 * SCALE}" />
        <line x1="${11.5 * SCALE}" y1="${-4 * SCALE}" x2="${11.5 * SCALE}" y2="${-1.5 * SCALE}" stroke="${EA_COLORS.pkIcon}" stroke-width="${1.2 * SCALE}" />
        <line x1="${14 * SCALE}" y1="${-4 * SCALE}" x2="${14 * SCALE}" y2="${-1.5 * SCALE}" stroke="${EA_COLORS.pkIcon}" stroke-width="${1.2 * SCALE}" />
        <text x="${20 * SCALE}" y="0" font-size="${12 * SCALE}" font-weight="bold" fill="${EA_COLORS.pkFont}">
          + ${pkAttr} (PK)
        </text>
      </g>
`;
      currentY += 22 * SCALE;
    });

    // Divider line between PK and non-PK attributes
    if (tbl.attributes.length > 0) {
      svg += `      <line x1="${tbl.x + 10 * SCALE}" y1="${currentY - 12 * SCALE}" x2="${tbl.x + tbl.w - 10 * SCALE}" y2="${currentY - 12 * SCALE}" 
            stroke="${EA_COLORS.dividerLine}" stroke-width="${0.8 * SCALE}" stroke-dasharray="${2 * SCALE},${2 * SCALE}" />
`;
    }

    // Regular Attributes (Omit FKs, No Types, Clean names)
    tbl.attributes.forEach(attr => {
      svg += `      <text x="${tbl.x + 22 * SCALE}" y="${currentY}" font-size="${11.5 * SCALE}" fill="${EA_COLORS.attrFont}">
        ${attr}
      </text>
`;
      currentY += 22 * SCALE;
    });

    svg += `    </g>
  </g>
`;
  });

  // Diagram Legend Box (Placed inside Admin package corner)
  svg += `
  <!-- Diagram Legend Box (Enterprise Architect Standard) -->
  <g id="ea_legend" transform="translate(${70 * SCALE}, ${1540 * SCALE})" filter="url(#eaShadow)">
    <rect x="0" y="0" width="${300 * SCALE}" height="${260 * SCALE}" rx="${3 * SCALE}" fill="#FFFFFF" stroke="${EA_COLORS.classBorder}" stroke-width="${1.4 * SCALE}" />
    <rect x="0" y="0" width="${300 * SCALE}" height="${28 * SCALE}" fill="url(#eaHeaderGrad)" rx="${3 * SCALE}" />
    <text x="${12 * SCALE}" y="${19 * SCALE}" font-size="${11 * SCALE}" font-weight="bold" fill="${EA_COLORS.classHeaderFont}">CONVENCIONES UML ENTERPRISE ARCHITECT</text>

    <!-- Legend Items -->
    <g transform="translate(${14 * SCALE}, ${48 * SCALE})">
      <!-- PK Symbol -->
      <circle cx="${6 * SCALE}" cy="${-4 * SCALE}" r="${3.2 * SCALE}" fill="none" stroke="${EA_COLORS.pkIcon}" stroke-width="${1.2 * SCALE}" />
      <line x1="${9.2 * SCALE}" y1="${-4 * SCALE}" x2="${14 * SCALE}" y2="${-4 * SCALE}" stroke="${EA_COLORS.pkIcon}" stroke-width="${1.2 * SCALE}" />
      <line x1="${11.5 * SCALE}" y1="${-4 * SCALE}" x2="${11.5 * SCALE}" y2="${-1.5 * SCALE}" stroke="${EA_COLORS.pkIcon}" stroke-width="${1.2 * SCALE}" />
      <text x="${20 * SCALE}" y="0" font-size="${11 * SCALE}" font-weight="bold" fill="${EA_COLORS.pkFont}">+ id_columna (PK)</text>
      <text x="${20 * SCALE}" y="${16 * SCALE}" font-size="${9.5 * SCALE}" fill="#64748B">Clave Primaria f&#237;sica &#250;nica</text>

      <!-- Regular Attribute -->
      <text x="${20 * SCALE}" y="${44 * SCALE}" font-size="${11 * SCALE}" fill="${EA_COLORS.attrFont}">nombre_atributo</text>
      <text x="${20 * SCALE}" y="${60 * SCALE}" font-size="${9.5 * SCALE}" fill="#64748B">Atributo propio (sin FK ni tipo de dato)</text>

      <!-- Stereotype -->
      <text x="${20 * SCALE}" y="${88 * SCALE}" font-size="${11 * SCALE}" font-style="italic" fill="${EA_COLORS.classStereotypeFont}">&#171;table&#187;</text>
      <text x="${20 * SCALE}" y="${104 * SCALE}" font-size="${9.5 * SCALE}" fill="#64748B">Estereotipo de entidad relacional f&#237;sica</text>

      <!-- Association Line -->
      <line x1="0" y1="${126 * SCALE}" x2="${40 * SCALE}" y2="${126 * SCALE}" stroke="${EA_COLORS.relationLine}" stroke-width="${1.8 * SCALE}" />
      <text x="${48 * SCALE}" y="${130 * SCALE}" font-size="${10.5 * SCALE}" font-weight="bold" fill="${EA_COLORS.cardinalityFont}">1 &#8226;&#8226; [verbo] &#8226;&#8226; 0..*</text>
      <text x="0" y="${148 * SCALE}" font-size="${9.5 * SCALE}" fill="#64748B">Asociaci&#243;n s&#243;lida con cardinalidad expl&#237;cita</text>

      <!-- Foreign Key Notice -->
      <rect x="0" y="${162 * SCALE}" width="${272 * SCALE}" height="${42 * SCALE}" rx="${2 * SCALE}" fill="#F8FAFC" stroke="#E2E8F0" />
      <text x="${8 * SCALE}" y="${178 * SCALE}" font-size="${9.5 * SCALE}" font-weight="bold" fill="#0369A1">REGLA DE PUREZA UML:</text>
      <text x="${8 * SCALE}" y="${194 * SCALE}" font-size="${9 * SCALE}" fill="#475569">Las FKs se expresan s&#243;lo v&#237;a asociaciones con verbo.</text>
    </g>
  </g>
</svg>
`;

  return svg;
}

// ============================================================================
// EXECUTION & EXPORT
// ============================================================================
const svgContent = generateSvg();

const docsDir = path.resolve(__dirname, '../docs');
const diagramsDir = path.resolve(__dirname, '../docs/diagramas');

if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(diagramsDir)) fs.mkdirSync(diagramsDir, { recursive: true });

// 1. Write docs/diagrama_base_datos.svg and duplicate in docs/diagramas/
const svgPath = path.join(docsDir, 'diagrama_base_datos.svg');
const svgPathDiagrams = path.join(diagramsDir, 'diagrama_base_datos.svg');

fs.writeFileSync(svgPath, svgContent, 'utf8');
fs.writeFileSync(svgPathDiagrams, svgContent, 'utf8');
console.log(`[OK] Diagrama vectorial SVG generado en: ${svgPath} (${fs.statSync(svgPath).size} bytes)`);

// 2. High Resolution Ultra-HD / 8K Rasterization via Chrome / Edge Headless
const htmlWrapperPath = path.join(__dirname, 'temp_render.html');
const pngPath = path.join(docsDir, 'diagrama_base_datos.png');
const pngPathDiagrams = path.join(diagramsDir, 'diagrama_base_datos.png');

const htmlWrapper = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Diagrama de Base de Datos - Enterprise Architect</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${CANVAS_WIDTH}px;
      height: ${CANVAS_HEIGHT}px;
      background-color: #FFFFFF;
      overflow: hidden;
    }
    svg {
      width: ${CANVAS_WIDTH}px;
      height: ${CANVAS_HEIGHT}px;
      display: block;
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

fs.writeFileSync(htmlWrapperPath, htmlWrapper, 'utf8');

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

console.log(`[INFO] Renderizando PNG en Ultra Alta Definición (${CANVAS_WIDTH}x${CANVAS_HEIGHT} a 300+ DPI)...`);
console.log(`[INFO] Usando motor de renderizado: ${browserBin}`);

try {
  const fileUrl = 'file:///' + htmlWrapperPath.replace(/\\/g, '/');
  const cmd = `"${browserBin}" --headless --disable-gpu --hide-scrollbars --window-size=${CANVAS_WIDTH},${CANVAS_HEIGHT} --screenshot="${pngPath}" "${fileUrl}"`;
  
  execSync(cmd, { stdio: 'pipe' });

  // Wait for file creation and sync
  const start = Date.now();
  while (Date.now() - start < 3000) {
    if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 10000) break;
  }

  if (fs.existsSync(pngPath)) {
    const pngSize = fs.statSync(pngPath).size;
    fs.copyFileSync(pngPath, pngPathDiagrams);
    console.log(`[OK] Diagrama rasterizado PNG generado exitosamente:`);
    console.log(`     - Ruta: ${pngPath}`);
    console.log(`     - Dimensiones: ${CANVAS_WIDTH} x ${CANVAS_HEIGHT} px (Ultra-HD / 8K)`);
    console.log(`     - Peso: ${(pngSize / (1024 * 1024)).toFixed(2)} MB (${pngSize} bytes)`);
  } else {
    console.error(`[ERROR] No se pudo encontrar el archivo PNG generado.`);
  }
} catch (err) {
  console.error('[ERROR] Error al renderizar PNG:', err.message);
} finally {
  if (fs.existsSync(htmlWrapperPath)) {
    fs.unlinkSync(htmlWrapperPath);
  }
}

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
  dividerLine: '#A5C4DF',
  extBoxBg: '#F8FAFC',
  extBoxBorder: '#94A3B8'
};

const WIDTH = 2560;
const HEIGHT = 1600;

// Helper to draw an Enterprise Architect Table Box
function drawTableBox(tbl) {
  const headerHeight = 70;
  const attrLineHeight = 34;
  const padding = 24;
  const totalAttrs = tbl.pk.length + tbl.attributes.length;
  const h = tbl.h || (headerHeight + (totalAttrs * attrLineHeight) + padding);

  let xml = `
  <!-- Class: ${tbl.name} -->
  <g id="table_${tbl.id}">
    <!-- Class Outer Box -->
    <rect x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${h}" 
          fill="${EA_COLORS.classBodyBg}" stroke="${EA_COLORS.classBorder}" stroke-width="2.4" rx="3" />

    <!-- Class Header Compartment -->
    <rect x="${tbl.x}" y="${tbl.y}" width="${tbl.w}" height="${headerHeight}" 
          fill="url(#eaHeaderGrad)" rx="3" />
    <line x1="${tbl.x}" y1="${tbl.y + headerHeight}" x2="${tbl.x + tbl.w}" y2="${tbl.y + headerHeight}" 
          stroke="${EA_COLORS.classBorder}" stroke-width="2.4" />

    <!-- Stereotype «table» -->
    <text x="${tbl.x + tbl.w / 2}" y="${tbl.y + 26}" text-anchor="middle" 
          font-size="16" font-style="italic" fill="${EA_COLORS.classStereotypeFont}">
      &#171;table&#187;
    </text>

    <!-- Table Name -->
    <text x="${tbl.x + tbl.w / 2}" y="${tbl.y + 54}" text-anchor="middle" 
          font-size="21" font-weight="bold" fill="${EA_COLORS.classHeaderFont}" letter-spacing="0.4">
      ${tbl.name}
    </text>

    <!-- Attributes Compartment -->
    <g id="attrs_${tbl.id}">
`;

  let currentY = tbl.y + headerHeight + 28;

  // Primary Keys
  tbl.pk.forEach(pkAttr => {
    xml += `      <g transform="translate(${tbl.x + 18}, ${currentY})">
        <circle cx="8" cy="-6" r="5.5" fill="none" stroke="${EA_COLORS.pkIcon}" stroke-width="1.8" />
        <line x1="13.5" y1="-6" x2="22" y2="-6" stroke="${EA_COLORS.pkIcon}" stroke-width="1.8" />
        <line x1="18" y1="-6" x2="18" y2="-2" stroke="${EA_COLORS.pkIcon}" stroke-width="1.8" />
        <line x1="22" y1="-6" x2="22" y2="-2" stroke="${EA_COLORS.pkIcon}" stroke-width="1.8" />
        <text x="32" y="0" font-size="18" font-weight="bold" fill="${EA_COLORS.pkFont}">
          + ${pkAttr} [PK]
        </text>
      </g>
`;
    currentY += attrLineHeight;
  });

  if (tbl.attributes.length > 0) {
    xml += `      <line x1="${tbl.x + 16}" y1="${currentY - 18}" x2="${tbl.x + tbl.w - 16}" y2="${currentY - 18}" 
            stroke="${EA_COLORS.dividerLine}" stroke-width="1.2" stroke-dasharray="3,3" />
`;
  }

  tbl.attributes.forEach(attr => {
    xml += `      <text x="${tbl.x + 32}" y="${currentY}" font-size="17" fill="${EA_COLORS.attrFont}">
        ${attr}
      </text>
`;
    currentY += attrLineHeight;
  });

  xml += `    </g>
  </g>
`;
  return xml;
}

// Helper to draw an External Entity Reference Box
function drawExternalBox(box) {
  return `
  <!-- External Class Reference: ${box.name} -->
  <g id="ext_${box.id}">
    <rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" 
          fill="${EA_COLORS.extBoxBg}" stroke="${EA_COLORS.extBoxBorder}" stroke-width="1.8" stroke-dasharray="6,4" rx="4" />
    <text x="${box.x + box.w / 2}" y="${box.y + 26}" text-anchor="middle" font-size="13" font-style="italic" fill="#64748B">
      &#171;external table&#187;
    </text>
    <text x="${box.x + box.w / 2}" y="${box.y + 52}" text-anchor="middle" font-size="18" font-weight="bold" fill="#334155">
      ${box.name}
    </text>
    <text x="${box.x + box.w / 2}" y="${box.y + 74}" text-anchor="middle" font-size="13" fill="#64748B">
      ${box.packageRef}
    </text>
  </g>
`;
}

// Helper to draw an Orthogonal Relation Line with Verbs and Cardinalities
function drawRelation(rel) {
  let d = '';
  rel.waypoints.forEach((pt, idx) => {
    d += (idx === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`);
  });

  const firstPt = rel.waypoints[0];
  const secondPt = rel.waypoints[1];
  const lastPt = rel.waypoints[rel.waypoints.length - 1];
  const secondLastPt = rel.waypoints[rel.waypoints.length - 2];

  const cardFromPos = {
    x: firstPt.x + (secondPt.x > firstPt.x ? 16 : secondPt.x < firstPt.x ? -36 : 14),
    y: firstPt.y + (secondPt.y > firstPt.y ? 24 : secondPt.y < firstPt.y ? -14 : -10)
  };
  const cardToPos = {
    x: lastPt.x + (secondLastPt.x > lastPt.x ? 16 : secondLastPt.x < lastPt.x ? -40 : 14),
    y: lastPt.y + (secondLastPt.y > lastPt.y ? 24 : secondLastPt.y < lastPt.y ? -14 : -10)
  };

  const verbWidth = rel.verb.length * 9.5 + 28;

  return `
  <!-- Relation: ${rel.from} -> ${rel.to} -->
  <g>
    <path d="${d}" fill="none" stroke="${rel.isExternal ? '#64748B' : EA_COLORS.relationLine}" 
          stroke-width="${rel.isExternal ? 2 : 2.4}" 
          stroke-dasharray="${rel.isExternal ? '6,4' : 'none'}" 
          stroke-linecap="round" stroke-linejoin="round" />

    <!-- Cardinality From -->
    <text x="${cardFromPos.x}" y="${cardFromPos.y}" font-size="16" font-weight="bold" fill="${EA_COLORS.cardinalityFont}">
      ${rel.cardFrom}
    </text>

    <!-- Cardinality To -->
    <text x="${cardToPos.x}" y="${cardToPos.y}" font-size="16" font-weight="bold" fill="${EA_COLORS.cardinalityFont}">
      ${rel.cardTo}
    </text>

    <!-- Verb Badge -->
    <g transform="translate(${rel.verbPos.x - verbWidth / 2}, ${rel.verbPos.y - 15})">
      <rect x="0" y="0" width="${verbWidth}" height="30" rx="4" fill="${EA_COLORS.verbBoxBg}" stroke="${EA_COLORS.verbBoxBorder}" stroke-width="1.2" />
      <text x="${verbWidth / 2}" y="20" text-anchor="middle" font-size="15" font-weight="600" fill="${EA_COLORS.verbFont}">
        ${rel.verb}
      </text>
    </g>
  </g>
`;
}

// Generate complete SVG document
function buildSvg(title, subtitle, tables, externalBoxes, relations, legendX = 1850, legendY = 1200) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     viewBox="0 0 ${WIDTH} ${HEIGHT}" 
     width="${WIDTH}" 
     height="${HEIGHT}"
     style="background-color: ${EA_COLORS.canvasBg}; font-family: 'Segoe UI', Arial, sans-serif;">

  <defs>
    <pattern id="eaGrid" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.2" fill="${EA_COLORS.gridDot}" />
    </pattern>

    <linearGradient id="eaHeaderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${EA_COLORS.classHeaderBgStart}" />
      <stop offset="100%" stop-color="${EA_COLORS.classHeaderBgEnd}" />
    </linearGradient>

    <linearGradient id="eaPkgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EFF6FB" />
      <stop offset="100%" stop-color="#DAEAF5" />
    </linearGradient>

    <filter id="eaShadow" x="-2%" y="-2%" width="105%" height="106%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="3" dy="4" stdDeviation="3.5" flood-color="#0F172A" flood-opacity="0.12" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${EA_COLORS.canvasBg}" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#eaGrid)" opacity="0.6" />

  <!-- Top Header Banner -->
  <g id="header_banner" filter="url(#eaShadow)">
    <rect x="50" y="40" width="${WIDTH - 100}" height="110" rx="4" fill="#FFFFFF" stroke="${EA_COLORS.classBorder}" stroke-width="2" />
    <rect x="50" y="40" width="16" height="110" fill="${EA_COLORS.classBorder}" />

    <text x="90" y="86" font-size="28" font-weight="bold" fill="#0A2540" letter-spacing="0.5">
      ${title}
    </text>
    <text x="90" y="122" font-size="16" fill="#4B6584" font-weight="600">
      ${subtitle}
    </text>

    <!-- Metadata Badges -->
    <g transform="translate(${WIDTH - 820}, 60)">
      <rect x="0" y="0" width="220" height="70" rx="3" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.2"/>
      <text x="14" y="28" font-size="12" font-weight="bold" fill="#64748B">SISTEMA</text>
      <text x="14" y="54" font-size="16" font-weight="bold" fill="#0F172A">Cl&#237;nica Vida Salud</text>

      <rect x="240" y="0" width="240" height="70" rx="3" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.2"/>
      <text x="254" y="28" font-size="12" font-weight="bold" fill="#64748B">EST&#193;NDAR / FECHA</text>
      <text x="254" y="54" font-size="16" font-weight="bold" fill="#0F172A">Enterprise Architect 2.5</text>

      <rect x="500" y="0" width="250" height="70" rx="3" fill="#EBF3FA" stroke="${EA_COLORS.classBorder}" stroke-width="1.2"/>
      <text x="514" y="28" font-size="12" font-weight="bold" fill="${EA_COLORS.pkFont}">MOTOR BD</text>
      <text x="514" y="54" font-size="16" font-weight="bold" fill="${EA_COLORS.classHeaderFont}">PostgreSQL Nativo</text>
    </g>
  </g>

  <!-- Relationships Layer -->
  <g id="relations_layer">
    ${relations.map(drawRelation).join('\n')}
  </g>

  <!-- Classes Layer -->
  <g id="classes_layer" filter="url(#eaShadow)">
    ${tables.map(drawTableBox).join('\n')}
  </g>

  <!-- External Classes Layer -->
  <g id="externals_layer">
    ${externalBoxes.map(drawExternalBox).join('\n')}
  </g>

  <!-- Legend Box -->
  <g id="legend_box" transform="translate(${legendX}, ${legendY})" filter="url(#eaShadow)">
    <rect x="0" y="0" width="640" height="320" rx="4" fill="#FFFFFF" stroke="${EA_COLORS.classBorder}" stroke-width="2" />
    <rect x="0" y="0" width="640" height="42" fill="url(#eaHeaderGrad)" rx="4" />
    <text x="18" y="28" font-size="16" font-weight="bold" fill="${EA_COLORS.classHeaderFont}">CONVENCIONES UML ENTERPRISE ARCHITECT</text>

    <g transform="translate(20, 68)">
      <circle cx="10" cy="-6" r="6" fill="none" stroke="${EA_COLORS.pkIcon}" stroke-width="2" />
      <line x1="16" y1="-6" x2="26" y2="-6" stroke="${EA_COLORS.pkIcon}" stroke-width="2" />
      <text x="36" y="0" font-size="16" font-weight="bold" fill="${EA_COLORS.pkFont}">+ id_columna [PK]</text>
      <text x="36" y="24" font-size="13.5" fill="#64748B">Clave Primaria f&#237;sica de la tabla</text>

      <text x="36" y="64" font-size="16" fill="${EA_COLORS.attrFont}">nombre_columna</text>
      <text x="36" y="88" font-size="13.5" fill="#64748B">Atributo propio (sin tipos ni llaves for&#225;neas)</text>

      <line x1="0" y1="130" x2="60" y2="130" stroke="${EA_COLORS.relationLine}" stroke-width="2.6" />
      <text x="74" y="136" font-size="15" font-weight="bold" fill="${EA_COLORS.cardinalityFont}">1 &#8226;&#8226; [verbo] &#8226;&#8226; 0..*</text>
      <text x="0" y="162" font-size="13.5" fill="#64748B">Asociaci&#243;n relacional con multiplicidad</text>

      <rect x="0" y="185" width="600" height="52" rx="3" fill="#F8FAFC" stroke="#E2E8F0" />
      <text x="14" y="208" font-size="14" font-weight="bold" fill="#0369A1">REGLA PURA DE MODELADO UML:</text>
      <text x="14" y="228" font-size="13.5" fill="#475569">Las llaves for&#225;neas no se listan en atributos; se expresan por asociaciones.</text>
    </g>
  </g>
</svg>
`;
  return xml;
}

// ============================================================================
// DEFINITIONS FOR THE 5 MODULAR PACKAGES
// ============================================================================

// ----------------------------------------------------------------------------
// 1. ACCESO, CUENTAS Y SEGURIDAD
// ----------------------------------------------------------------------------
const pkg01 = {
  filename: '01_acceso_cuentas_seguridad.png',
  title: 'PAQUETE 01: ACCESO, CUENTAS Y SEGURIDAD — CL&#205;NICA VIDA SALUD',
  subtitle: 'Roles, Permisos, Asignaci&#243;n Rol-Permiso y Cuentas de Usuarios (Seguridad OWASP)',
  tables: [
    {
      id: 'roles',
      name: 'roles',
      x: 100,
      y: 200,
      w: 460,
      pk: ['id_rol'],
      attributes: ['nombre', 'descripcion', 'created_at', 'updated_at']
    },
    {
      id: 'permisos',
      name: 'permisos',
      x: 1100,
      y: 200,
      w: 480,
      pk: ['id_permiso'],
      attributes: ['modulo', 'nombre', 'slug', 'descripcion', 'created_at', 'updated_at']
    },
    {
      id: 'rol_permiso',
      name: 'rol_permiso',
      x: 620,
      y: 640,
      w: 420,
      pk: ['id_rol, id_permiso'],
      attributes: ['created_at', 'updated_at']
    },
    {
      id: 'usuarios',
      name: 'usuarios',
      x: 100,
      y: 950,
      w: 520,
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
    }
  ],
  externalBoxes: [
    {
      id: 'personas',
      name: 'personas',
      packageRef: 'Paquete: Pacientes y Perfil',
      x: 1100,
      y: 1050,
      w: 420,
      h: 95
    }
  ],
  relations: [
    {
      from: 'roles',
      to: 'usuarios',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'asigna rol a',
      waypoints: [
        { x: 330, y: 440 },
        { x: 330, y: 950 }
      ],
      verbPos: { x: 330, y: 695 }
    },
    {
      from: 'roles',
      to: 'rol_permiso',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'posee',
      waypoints: [
        { x: 560, y: 320 },
        { x: 740, y: 320 },
        { x: 740, y: 640 }
      ],
      verbPos: { x: 740, y: 480 }
    },
    {
      from: 'permisos',
      to: 'rol_permiso',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'concedido en',
      waypoints: [
        { x: 1100, y: 390 },
        { x: 920, y: 390 },
        { x: 920, y: 640 }
      ],
      verbPos: { x: 920, y: 515 }
    },
    {
      from: 'usuarios',
      to: 'personas',
      cardFrom: '0..1',
      cardTo: '1',
      verb: 'accede como',
      isExternal: true,
      waypoints: [
        { x: 620, y: 1100 },
        { x: 1100, y: 1100 }
      ],
      verbPos: { x: 860, y: 1100 }
    }
  ],
  legendX: 1800,
  legendY: 1180
};

// ----------------------------------------------------------------------------
// 2. PACIENTES Y PERFIL
// ----------------------------------------------------------------------------
const pkg02 = {
  filename: '02_pacientes_perfil.png',
  title: 'PAQUETE 02: PACIENTES Y PERFIL — CL&#205;NICA VIDA SALUD',
  subtitle: 'Personas, Ficha de Pacientes, Informaci&#243;n M&#233;dica Base y Contactos de Emergencia',
  tables: [
    {
      id: 'personas',
      name: 'personas',
      x: 100,
      y: 220,
      w: 480,
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
      x: 880,
      y: 220,
      w: 480,
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
      x: 1720,
      y: 220,
      w: 540,
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
      x: 880,
      y: 840,
      w: 480,
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
    }
  ],
  externalBoxes: [
    {
      id: 'usuarios',
      name: 'usuarios',
      packageRef: 'Paquete: Acceso y Cuentas',
      x: 100,
      y: 1050,
      w: 420,
      h: 95
    },
    {
      id: 'citas',
      name: 'citas',
      packageRef: 'Paquete: Citas y Pagos',
      x: 1540,
      y: 900,
      w: 420,
      h: 95
    }
  ],
  relations: [
    {
      from: 'personas',
      to: 'pacientes',
      cardFrom: '1',
      cardTo: '0..1',
      verb: 'se registra como',
      waypoints: [
        { x: 580, y: 350 },
        { x: 880, y: 350 }
      ],
      verbPos: { x: 730, y: 350 }
    },
    {
      from: 'pacientes',
      to: 'informacion_medica_paciente',
      cardFrom: '1',
      cardTo: '0..1',
      verb: 'posee ficha m&#233;dica',
      waypoints: [
        { x: 1360, y: 350 },
        { x: 1720, y: 350 }
      ],
      verbPos: { x: 1540, y: 350 }
    },
    {
      from: 'pacientes',
      to: 'contactos_emergencia',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'registra contacto',
      waypoints: [
        { x: 1120, y: 550 },
        { x: 1120, y: 840 }
      ],
      verbPos: { x: 1120, y: 695 }
    },
    {
      from: 'usuarios',
      to: 'personas',
      cardFrom: '0..1',
      cardTo: '1',
      verb: 'accede como',
      isExternal: true,
      waypoints: [
        { x: 310, y: 1050 },
        { x: 310, y: 720 }
      ],
      verbPos: { x: 310, y: 885 }
    },
    {
      from: 'pacientes',
      to: 'citas',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'solicita cita',
      isExternal: true,
      waypoints: [
        { x: 1360, y: 480 },
        { x: 1750, y: 480 },
        { x: 1750, y: 900 }
      ],
      verbPos: { x: 1750, y: 690 }
    }
  ],
  legendX: 1800,
  legendY: 1180
};

// ----------------------------------------------------------------------------
// 3. CATÁLOGOS, HORARIOS Y MÉDICOS
// ----------------------------------------------------------------------------
const pkg03 = {
  filename: '03_catalogos_horarios_medicos.png',
  title: 'PAQUETE 03: CAT&#193;LOGOS, HORARIOS Y M&#201;DICOS — CL&#205;NICA VIDA SALUD',
  subtitle: 'M&#233;dicos, Especialidades, Asignaci&#243;n, Horarios Semanales, Suspensiones y Bloqueos',
  tables: [
    {
      id: 'medicos',
      name: 'medicos',
      x: 100,
      y: 220,
      w: 460,
      pk: ['id_medico'],
      attributes: ['nro_matricula', 'biografia', 'estado', 'created_at', 'updated_at']
    },
    {
      id: 'especialidades',
      name: 'especialidades',
      x: 1060,
      y: 220,
      w: 500,
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
      x: 580,
      y: 650,
      w: 440,
      pk: ['id_medico_especialidad'],
      attributes: ['created_at', 'updated_at']
    },
    {
      id: 'horarios_atencion',
      name: 'horarios_atencion',
      x: 1200,
      y: 650,
      w: 480,
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
      x: 100,
      y: 950,
      w: 480,
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
      x: 680,
      y: 1050,
      w: 460,
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
    }
  ],
  externalBoxes: [
    {
      id: 'personas',
      name: 'personas',
      packageRef: 'Paquete: Pacientes y Perfil',
      x: 100,
      y: 680,
      w: 360,
      h: 85
    }
  ],
  relations: [
    {
      from: 'medicos',
      to: 'medico_especialidad',
      cardFrom: '1',
      cardTo: '1..*',
      verb: 'ejerce',
      waypoints: [
        { x: 380, y: 510 },
        { x: 380, y: 580 },
        { x: 680, y: 580 },
        { x: 680, y: 650 }
      ],
      verbPos: { x: 530, y: 580 }
    },
    {
      from: 'especialidades',
      to: 'medico_especialidad',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'agrupa',
      waypoints: [
        { x: 1200, y: 580 },
        { x: 920, y: 580 },
        { x: 920, y: 650 }
      ],
      verbPos: { x: 1060, y: 580 }
    },
    {
      from: 'medicos',
      to: 'horarios_atencion',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'cumple',
      waypoints: [
        { x: 560, y: 350 },
        { x: 820, y: 350 },
        { x: 820, y: 540 },
        { x: 1400, y: 540 },
        { x: 1400, y: 650 }
      ],
      verbPos: { x: 1110, y: 540 }
    },
    {
      from: 'especialidades',
      to: 'horarios_atencion',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'se programa en',
      waypoints: [
        { x: 1520, y: 580 },
        { x: 1520, y: 650 }
      ],
      verbPos: { x: 1520, y: 615 }
    },
    {
      from: 'medicos',
      to: 'suspensiones_horario',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'declara',
      waypoints: [
        { x: 260, y: 510 },
        { x: 260, y: 950 }
      ],
      verbPos: { x: 260, y: 730 }
    },
    {
      from: 'medicos',
      to: 'bloqueos_clinica',
      cardFrom: '0..1',
      cardTo: '0..*',
      verb: 'afectado por',
      waypoints: [
        { x: 480, y: 510 },
        { x: 480, y: 880 },
        { x: 820, y: 880 },
        { x: 820, y: 1050 }
      ],
      verbPos: { x: 650, y: 880 }
    },
    {
      from: 'personas',
      to: 'medicos',
      cardFrom: '1',
      cardTo: '0..1',
      verb: 'se acredita como',
      isExternal: true,
      waypoints: [
        { x: 180, y: 680 },
        { x: 180, y: 510 }
      ],
      verbPos: { x: 180, y: 595 }
    }
  ],
  legendX: 1800,
  legendY: 1180
};

// ----------------------------------------------------------------------------
// 4. CITAS, NOTIFICACIONES Y PAGOS
// ----------------------------------------------------------------------------
const pkg04 = {
  filename: '04_citas_notificaciones_pagos.png',
  title: 'PAQUETE 04: CITAS, NOTIFICACIONES Y PAGOS — CL&#205;NICA VIDA SALUD',
  subtitle: 'Flujo de Citas M&#233;dicas, Pasarela de Pagos (Stripe/QR) y Sistema de Alertas Push/In-App',
  tables: [
    {
      id: 'estados_cita',
      name: 'estados_cita',
      x: 100,
      y: 280,
      w: 460,
      pk: ['id_estado_cita'],
      attributes: ['codigo', 'nombre', 'descripcion', 'created_at', 'updated_at']
    },
    {
      id: 'citas',
      name: 'citas',
      x: 880,
      y: 220,
      w: 520,
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
      x: 1720,
      y: 220,
      w: 500,
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
      x: 880,
      y: 920,
      w: 480,
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
    }
  ],
  externalBoxes: [
    {
      id: 'pacientes',
      name: 'pacientes',
      packageRef: 'Paquete: Pacientes y Perfil',
      x: 100,
      y: 800,
      w: 360,
      h: 85
    },
    {
      id: 'medicos',
      name: 'medicos',
      packageRef: 'Paquete: Catálogos Médicos',
      x: 100,
      y: 950,
      w: 360,
      h: 85
    },
    {
      id: 'usuarios',
      name: 'usuarios',
      packageRef: 'Paquete: Acceso y Cuentas',
      x: 100,
      y: 1100,
      w: 360,
      h: 85
    },
    {
      id: 'atenciones_clinicas',
      name: 'atenciones_clinicas',
      packageRef: 'Paquete: Historia Clínica',
      x: 1720,
      y: 850,
      w: 440,
      h: 95
    }
  ],
  relations: [
    {
      from: 'estados_cita',
      to: 'citas',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'clasifica',
      waypoints: [
        { x: 560, y: 400 },
        { x: 880, y: 400 }
      ],
      verbPos: { x: 720, y: 400 }
    },
    {
      from: 'citas',
      to: 'pagos_cita',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'liquida mediante',
      waypoints: [
        { x: 1400, y: 350 },
        { x: 1720, y: 350 }
      ],
      verbPos: { x: 1560, y: 350 }
    },
    {
      from: 'pacientes',
      to: 'citas',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'solicita',
      isExternal: true,
      waypoints: [
        { x: 460, y: 840 },
        { x: 680, y: 840 },
        { x: 680, y: 490 },
        { x: 880, y: 490 }
      ],
      verbPos: { x: 680, y: 665 }
    },
    {
      from: 'medicos',
      to: 'citas',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'atiende',
      isExternal: true,
      waypoints: [
        { x: 460, y: 990 },
        { x: 750, y: 990 },
        { x: 750, y: 560 },
        { x: 880, y: 560 }
      ],
      verbPos: { x: 750, y: 775 }
    },
    {
      from: 'usuarios',
      to: 'citas',
      cardFrom: '0..1',
      cardTo: '0..*',
      verb: 'agenda / reserva',
      isExternal: true,
      waypoints: [
        { x: 460, y: 1140 },
        { x: 820, y: 1140 },
        { x: 820, y: 630 },
        { x: 880, y: 630 }
      ],
      verbPos: { x: 820, y: 885 }
    },
    {
      from: 'usuarios',
      to: 'notificaciones',
      cardFrom: '1',
      cardTo: '0..*',
      verb: 'recibe alerta',
      isExternal: true,
      waypoints: [
        { x: 460, y: 1160 },
        { x: 880, y: 1160 }
      ],
      verbPos: { x: 670, y: 1160 }
    },
    {
      from: 'citas',
      to: 'atenciones_clinicas',
      cardFrom: '1',
      cardTo: '0..1',
      verb: 'origina atenci&#243;n',
      isExternal: true,
      waypoints: [
        { x: 1400, y: 650 },
        { x: 1560, y: 650 },
        { x: 1560, y: 890 },
        { x: 1720, y: 890 }
      ],
      verbPos: { x: 1560, y: 770 }
    }
  ],
  legendX: 1800,
  legendY: 1180
};

// ----------------------------------------------------------------------------
// 5. HISTORIA CLÍNICA Y AUDITORÍA
// ----------------------------------------------------------------------------
const pkg05 = {
  filename: '05_historia_clinica_auditoria.png',
  title: 'PAQUETE 05: HISTORIA CL&#205;NICA Y AUDITOR&#205;A — CL&#205;NICA VIDA SALUD',
  subtitle: 'Diagn&#243;stico M&#233;dico, Laboratorio, Bit&#225;cora de Auditor&#237;a (Trazabilidad), Backups y Par&#225;metros',
  tables: [
    {
      id: 'atenciones_clinicas',
      name: 'atenciones_clinicas',
      x: 80,
      y: 220,
      w: 520,
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
      x: 880,
      y: 220,
      w: 480,
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
    {
      id: 'bitacora_auditoria',
      name: 'bitacora_auditoria',
      x: 1620,
      y: 220,
      w: 520,
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
      x: 880,
      y: 800,
      w: 460,
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
      x: 80,
      y: 840,
      w: 480,
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
  ],
  externalBoxes: [
    {
      id: 'citas',
      name: 'citas',
      packageRef: 'Paquete: Citas y Pagos',
      x: 80,
      y: 1220,
      w: 360,
      h: 85
    },
    {
      id: 'usuarios',
      name: 'usuarios',
      packageRef: 'Paquete: Acceso y Cuentas',
      x: 880,
      y: 1220,
      w: 360,
      h: 85
    }
  ],
  relations: [
    {
      from: 'atenciones_clinicas',
      to: 'resultados_laboratorio',
      cardFrom: '0..1',
      cardTo: '0..*',
      verb: 'deriva en estudio',
      waypoints: [
        { x: 600, y: 350 },
        { x: 880, y: 350 }
      ],
      verbPos: { x: 740, y: 350 }
    },
    {
      from: 'citas',
      to: 'atenciones_clinicas',
      cardFrom: '1',
      cardTo: '0..1',
      verb: 'origina atenci&#243;n',
      isExternal: true,
      waypoints: [
        { x: 260, y: 1220 },
        { x: 260, y: 640 }
      ],
      verbPos: { x: 260, y: 930 }
    },
    {
      from: 'usuarios',
      to: 'copias_seguridad',
      cardFrom: '0..1',
      cardTo: '0..*',
      verb: 'ejecuta respaldo',
      isExternal: true,
      waypoints: [
        { x: 1040, y: 1220 },
        { x: 1040, y: 1100 }
      ],
      verbPos: { x: 1040, y: 1160 }
    },
    {
      from: 'usuarios',
      to: 'bitacora_auditoria',
      cardFrom: '0..1',
      cardTo: '0..*',
      verb: 'genera traza auditor&#237;a',
      isExternal: true,
      waypoints: [
        { x: 1240, y: 1260 },
        { x: 1880, y: 1260 },
        { x: 1880, y: 720 }
      ],
      verbPos: { x: 1560, y: 1260 }
    }
  ],
  legendX: 1500,
  legendY: 820
};

// ============================================================================
// RUNNER: GENERATE SVGs AND RENDER ULTRA HIGH-RES PNGs
// ============================================================================
const outputDir = path.resolve(__dirname, '../docs/diagramas_paquetes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const packages = [pkg01, pkg02, pkg03, pkg04, pkg05];

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

console.log(`[INFO] Motor de renderizado: ${browserBin}`);
console.log(`[INFO] Generando 5 diagramas modulares por paquete en: ${outputDir}`);

packages.forEach((pkg, index) => {
  const svgContent = buildSvg(pkg.title, pkg.subtitle, pkg.tables, pkg.externalBoxes, pkg.relations, pkg.legendX, pkg.legendY);
  
  // Save SVG
  const svgFilename = pkg.filename.replace('.png', '.svg');
  const svgPath = path.join(outputDir, svgFilename);
  fs.writeFileSync(svgPath, svgContent, 'utf8');

  // Render to PNG
  const pngPath = path.join(outputDir, pkg.filename);
  const tempHtmlPath = path.join(__dirname, `temp_pkg_${index + 1}.html`);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      background-color: #FFFFFF;
      overflow: hidden;
    }
    svg {
      width: ${WIDTH}px;
      height: ${HEIGHT}px;
      display: block;
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`;

  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  try {
    const fileUrl = 'file:///' + tempHtmlPath.replace(/\\/g, '/');
    const cmd = `"${browserBin}" --headless --disable-gpu --hide-scrollbars --window-size=${WIDTH},${HEIGHT} --screenshot="${pngPath}" "${fileUrl}"`;
    execSync(cmd, { stdio: 'pipe' });

    // Wait for file creation
    const start = Date.now();
    while (Date.now() - start < 2000) {
      if (fs.existsSync(pngPath) && fs.statSync(pngPath).size > 1000) break;
    }

    if (fs.existsSync(pngPath)) {
      const size = fs.statSync(pngPath).size;
      console.log(`[OK] Paquete ${index + 1}: ${pkg.filename} (${WIDTH}x${HEIGHT} px, ${(size / 1024).toFixed(1)} KB)`);
    } else {
      console.error(`[ERROR] No se generó ${pkg.filename}`);
    }
  } catch (err) {
    console.error(`[ERROR] Fallo al generar ${pkg.filename}:`, err.message);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
});

console.log('[FIN] Proceso de generación de diagramas modulares completado con éxito.');

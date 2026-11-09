/**
 * CU-23: Exportar reportes en PDF
 * Utilidad para la generación y descarga en el frontend de reportes clínicos y operacionales en formato PDF.
 * Utiliza importación dinámica de jsPDF y jsPDF-AutoTable para optimizar el peso inicial del aplicativo.
 */

// Función auxiliar para formatear fechas de ISO (AAAA-MM-DD) a formato latino DD/MM/AAAA
const formatearFechaLatina = (fechaStr) => {
  if (!fechaStr) return '—';
  const partes = String(fechaStr).split('T')[0].split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return fechaStr;
};

// Función auxiliar para obtener la fecha y hora actual en formato DD/MM/AAAA HH:MM
const obtenerFechaHoraActual = () => {
  const ahora = new Date();
  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = String(ahora.getMonth() + 1).padStart(2, '0');
  const anio = ahora.getFullYear();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
};

// Función auxiliar para normalizar nombres de estados sin emojis ni caracteres corruptos
const normalizarEstadoCita = (estadoNombre, estadoCodigo) => {
  if (estadoNombre && typeof estadoNombre === 'string') {
    return estadoNombre.trim();
  }
  const cod = (estadoCodigo || '').toLowerCase();
  const mapa = {
    programada: 'Programada',
    confirmada: 'Confirmada',
    en_espera: 'En Sala de Espera',
    atendida: 'Atendida',
    inasistencia: 'Inasistencia',
    postergada: 'Postergada',
    cancelada: 'Cancelada',
  };
  return mapa[cod] || estadoCodigo || 'Sin Estado';
};

// Carga perezosa de los módulos jsPDF y jsPDF-AutoTable
const cargarBibliotecasPdf = async () => {
  const [{ default: jsPDF }, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const autoTable = autoTableModule.default || autoTableModule;
  return { jsPDF, autoTable };
};

// Aplica el plugin autoTable al documento jsPDF de manera compatible
const aplicarAutoTable = (doc, autoTableFunc, opciones) => {
  if (typeof doc.autoTable === 'function') {
    doc.autoTable(opciones);
  } else if (typeof autoTableFunc === 'function') {
    autoTableFunc(doc, opciones);
  } else {
    throw new Error('No se pudo inicializar jsPDF-AutoTable.');
  }
};

// Dibuja la cabecera corporativa y el pie de página en cada hoja del documento
const decorarPaginas = (doc, subtitulo, fechaHoraGeneracion) => {
  const totalPaginas = doc.internal.getNumberOfPages();
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);

    // 1. Franja superior corporativa (#0A6C84)
    doc.setFillColor(10, 108, 132);
    doc.rect(0, 0, anchoPagina, 22, 'F');

    // 2. Textos de cabecera
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('CLINICA VIDA SALUD', 14, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(subtitulo, 14, 16.5);

    // Fecha y hora de emisión (alineada a la derecha)
    doc.setFontSize(7.5);
    doc.text(`Emision: ${fechaHoraGeneracion}`, anchoPagina - 14, 13.5, { align: 'right' });

    // 3. Pie de página con línea divisoria tenue (#E0E0E0)
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.3);
    doc.line(14, altoPagina - 11, anchoPagina - 14, altoPagina - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Documento generado por el sistema de la Clinica Vida Salud', 14, altoPagina - 6);
    doc.text(`Pagina ${i} de ${totalPaginas}`, anchoPagina - 14, altoPagina - 6, { align: 'right' });
  }
};

/**
 * Genera y descarga el PDF del Reporte Operacional de Citas (CU-23).
 * Formato: A4 horizontal (landscape).
 */
export async function exportarCitasPdf({
  citas = [],
  resumen = null,
  filtros = {},
  usuario = null,
  especialidades = [],
  medicos = [],
}) {
  const { jsPDF, autoTable } = await cargarBibliotecasPdf();

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const fechaHoraGeneracion = obtenerFechaHoraActual();
  const anchoPagina = doc.internal.pageSize.getWidth();

  // 1. Resolver etiquetas de filtros aplicados
  const fechaDesde = formatearFechaLatina(filtros.fechaInicio);
  const fechaHasta = formatearFechaLatina(filtros.fechaFin);

  let nombreEsp = 'Todas las especialidades';
  if (filtros.idEspecialidad) {
    const espEncontrada = especialidades.find(
      (e) => String(e.id_especialidad) === String(filtros.idEspecialidad)
    );
    if (espEncontrada) nombreEsp = espEncontrada.nombre;
  }

  let nombreMed = 'Todos los profesionales';
  if (filtros.idMedico) {
    const medEncontrado = medicos.find(
      (m) => String(m.id_medico) === String(filtros.idMedico)
    );
    if (medEncontrado) {
      nombreMed = `Dr(a). ${medEncontrado.apellidos}, ${medEncontrado.nombres}`;
    }
  }

  const mapaEstadosFiltro = {
    '1': 'Pendiente',
    '2': 'Confirmada',
    '3': 'En Sala de Espera',
    '4': 'Atendida / Concluida',
    '5': 'Inasistencia',
    '6': 'Postergada por Contingencia',
    '7': 'Cancelada',
  };
  const nombreEstado = filtros.idEstadoCita
    ? mapaEstadosFiltro[String(filtros.idEstadoCita)] || 'Estado seleccionado'
    : 'Todos los estados';

  const nombreUsuario = usuario
    ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || usuario.nombre_usuario || 'Administrador'
    : 'Administrador';
  const rolUsuario = usuario?.rol
    ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)
    : 'Administrador';

  // 2. Dibujar bloque de metadatos en la primera página
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 25, anchoPagina - 28, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(10, 108, 132);
  doc.text('PERIODO:', 18, 30.5);
  doc.text('FILTROS:', 18, 35.5);
  doc.text('GENERADO POR:', 18, 40.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(18, 52, 59);
  doc.text(`Desde ${fechaDesde} hasta ${fechaHasta}`, 36, 30.5);
  doc.text(`Especialidad: ${nombreEsp}   |   Profesional: ${nombreMed}   |   Estado: ${nombreEstado}`, 36, 35.5);
  doc.text(`${nombreUsuario} (${rolUsuario})`, 44, 40.5);

  // 3. Preparar filas de la tabla de citas
  const encabezadosTabla = [
    'Codigo',
    'Fecha',
    'Horario',
    'Paciente',
    'CI',
    'Nro Exp',
    'Especialidad',
    'Profesional Medico',
    'Estado Cita',
    'Garantia (Bs)',
    'Estado Pago',
  ];

  let cuerpoTabla = [];
  if (citas && citas.length > 0) {
    cuerpoTabla = citas.map((c) => [
      c.codigo_cita || '—',
      formatearFechaLatina(c.fecha_cita),
      c.hora_inicio && c.hora_fin ? `${c.hora_inicio} - ${c.hora_fin}` : '—',
      c.paciente_nombre || c.paciente || '—',
      c.paciente_ci || '—',
      c.codigo_historia || '—',
      c.especialidad_nombre || c.especialidad || '—',
      c.medico_nombre ? `Dr(a). ${c.medico_nombre}` : c.medico ? `Dr(a). ${c.medico}` : '—',
      normalizarEstadoCita(c.estado_nombre || c.estado, c.estado_codigo),
      c.monto_garantia !== null && c.monto_garantia !== undefined
        ? Number(c.monto_garantia).toFixed(2)
        : '0.00',
      c.estado_pago ? String(c.estado_pago).toUpperCase() : 'SIN PAGO',
    ]);
  } else {
    cuerpoTabla = [
      [
        {
          content: 'No se encontraron registros para los filtros seleccionados.',
          colSpan: encabezadosTabla.length,
          styles: { halign: 'center', textColor: [100, 116, 139], fontStyle: 'italic' },
        },
      ],
    ];
  }

  // 4. Renderizar tabla con autoTable
  aplicarAutoTable(doc, autoTable, {
    startY: 46,
    head: [encabezadosTabla],
    body: cuerpoTabla,
    showHead: 'everyPage',
    margin: { top: 26, bottom: 15, left: 14, right: 14 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      textColor: [18, 52, 59],
      cellPadding: 1.8,
      lineWidth: 0.2,
      lineColor: [224, 224, 224],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [10, 108, 132],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 7.8,
      lineWidth: 0.2,
      lineColor: [10, 108, 132],
    },
    alternateRowStyles: {
      fillColor: [244, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Codigo
      1: { cellWidth: 18 }, // Fecha
      2: { cellWidth: 20 }, // Horario
      3: { cellWidth: 38 }, // Paciente
      4: { cellWidth: 18 }, // CI
      5: { cellWidth: 18 }, // Nro Exp
      6: { cellWidth: 32 }, // Especialidad
      7: { cellWidth: 38 }, // Profesional
      8: { cellWidth: 25 }, // Estado Cita
      9: { cellWidth: 20, halign: 'right' }, // Garantia
      10: { cellWidth: 22, halign: 'center' }, // Estado Pago
    },
  });

  // 5. Bloque de resumen cuantitativo al final
  const altoRequeridoResumen = 22;
  const altoDisponible = doc.internal.pageSize.getHeight() - 15;
  let posY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 46) + 6;

  if (posY + altoRequeridoResumen > altoDisponible) {
    doc.addPage();
    posY = 28;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, posY, anchoPagina - 28, 15, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(10, 108, 132);
  doc.text('RESUMEN DE CITAS EN EL PERIODO:', 18, posY + 5.5);

  const totalCitasVal = resumen?.total_citas !== undefined ? resumen.total_citas : citas.length;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(18, 52, 59);

  let desgloseTexto = `Total de citas registradas: ${totalCitasVal}`;
  if (resumen?.por_estado && resumen.por_estado.length > 0) {
    const estadosStr = resumen.por_estado
      .map((e) => `${e.estado_nombre || e.estado_codigo}: ${e.total}`)
      .join('   |   ');
    desgloseTexto += `   —   ${estadosStr}`;
  }
  doc.text(desgloseTexto, 18, posY + 10.5, { maxWidth: anchoPagina - 36 });

  // 6. Decorar todas las páginas con cabecera y pie
  decorarPaginas(doc, 'Reporte Operacional Detallado de Citas Medicas', fechaHoraGeneracion);

  // 7. Descargar archivo PDF
  const fIniNombre = filtros.fechaInicio || 'inicio';
  const fFinNombre = filtros.fechaFin || 'fin';
  const nombreArchivo = `reporte_citas_${fIniNombre}_a_${fFinNombre}.pdf`;
  doc.save(nombreArchivo);
}

/**
 * Genera y descarga el PDF del Reporte de Cumplimiento y Asistencia de Pacientes (CU-23).
 * Formato: A4 vertical (portrait).
 */
export async function exportarCumplimientoPdf({
  desglose = [],
  totales = {},
  filtros = {},
  usuario = null,
  especialidades = [],
  medicos = [],
}) {
  const { jsPDF, autoTable } = await cargarBibliotecasPdf();

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const fechaHoraGeneracion = obtenerFechaHoraActual();
  const anchoPagina = doc.internal.pageSize.getWidth();

  // 1. Resolver etiquetas de filtros
  const fechaDesde = formatearFechaLatina(filtros.fechaInicio);
  const fechaHasta = formatearFechaLatina(filtros.fechaFin);

  let nombreEsp = 'Todas las especialidades';
  if (filtros.idEspecialidad) {
    const espEncontrada = especialidades.find(
      (e) => String(e.id_especialidad) === String(filtros.idEspecialidad)
    );
    if (espEncontrada) nombreEsp = espEncontrada.nombre;
  }

  let nombreMed = 'Todos los profesionales';
  if (filtros.idMedico) {
    const medEncontrado = medicos.find(
      (m) => String(m.id_medico) === String(filtros.idMedico)
    );
    if (medEncontrado) {
      nombreMed = `Dr(a). ${medEncontrado.apellidos}, ${medEncontrado.nombres}`;
    }
  }

  const nombreUsuario = usuario
    ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || usuario.nombre_usuario || 'Administrador'
    : 'Administrador';
  const rolUsuario = usuario?.rol
    ? usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)
    : 'Administrador';

  // 2. Dibujar bloque de metadatos en la primera página
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 25, anchoPagina - 28, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(10, 108, 132);
  doc.text('PERIODO:', 18, 30.5);
  doc.text('CRITERIOS:', 18, 35.5);
  doc.text('GENERADO POR:', 18, 40.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(18, 52, 59);
  doc.text(`Desde ${fechaDesde} hasta ${fechaHasta}`, 36, 30.5);
  doc.text(`Especialidad: ${nombreEsp}   |   Profesional: ${nombreMed}`, 38, 35.5);
  doc.text(`${nombreUsuario} (${rolUsuario})`, 44, 40.5);

  // 3. Preparar filas de la tabla de cumplimiento
  const encabezadosTabla = [
    'Especialidad Medica',
    'Total Citas',
    'Atendidas',
    'Inasistencias',
    'Canceladas',
    'Efectividad (%)',
    'Ausentismo (%)',
  ];

  let cuerpoTabla = [];
  if (desglose && desglose.length > 0) {
    cuerpoTabla = desglose.map((item) => {
      const total = Number(item.total || 0);
      const atendidas = Number(item.atendidas || 0);
      const inasistencias = Number(item.inasistencias || 0);
      const canceladas = Number(item.canceladas || 0);

      let efectividad = item.tasa_efectividad !== undefined ? Number(item.tasa_efectividad) : null;
      let ausentismo = item.tasa_ausentismo !== undefined ? Number(item.tasa_ausentismo) : null;

      if (efectividad === null) {
        const den = atendidas + inasistencias;
        efectividad = den > 0 ? ((atendidas / den) * 100) : 0;
      }
      if (ausentismo === null) {
        const den = atendidas + inasistencias;
        ausentismo = den > 0 ? ((inasistencias / den) * 100) : 0;
      }

      return [
        item.especialidad || '—',
        String(total),
        String(atendidas),
        String(inasistencias),
        String(canceladas),
        `${efectividad.toFixed(2)}%`,
        `${ausentismo.toFixed(2)}%`,
      ];
    });
  } else {
    cuerpoTabla = [
      [
        {
          content: 'No se encontraron registros para los filtros seleccionados.',
          colSpan: encabezadosTabla.length,
          styles: { halign: 'center', textColor: [100, 116, 139], fontStyle: 'italic' },
        },
      ],
    ];
  }

  // 4. Renderizar tabla con autoTable
  aplicarAutoTable(doc, autoTable, {
    startY: 46,
    head: [encabezadosTabla],
    body: cuerpoTabla,
    showHead: 'everyPage',
    margin: { top: 26, bottom: 15, left: 14, right: 14 },
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      textColor: [18, 52, 59],
      cellPadding: 2,
      lineWidth: 0.2,
      lineColor: [224, 224, 224],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [10, 108, 132],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      fontSize: 8,
      lineWidth: 0.2,
      lineColor: [10, 108, 132],
    },
    alternateRowStyles: {
      fillColor: [244, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 50 }, // Especialidad
      1: { cellWidth: 22, halign: 'center' }, // Total
      2: { cellWidth: 22, halign: 'center' }, // Atendidas
      3: { cellWidth: 22, halign: 'center' }, // Inasistencias
      4: { cellWidth: 22, halign: 'center' }, // Canceladas
      5: { cellWidth: 22, halign: 'right' }, // Efectividad
      6: { cellWidth: 22, halign: 'right' }, // Ausentismo
    },
  });

  // 5. Bloque de resumen de cumplimiento
  const altoRequeridoResumen = 28;
  const altoDisponible = doc.internal.pageSize.getHeight() - 15;
  let posY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 46) + 6;

  if (posY + altoRequeridoResumen > altoDisponible) {
    doc.addPage();
    posY = 28;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, posY, anchoPagina - 28, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(10, 108, 132);
  doc.text('TOTALES Y RENDIMIENTO GLOBAL DEL PERIODO:', 18, posY + 5.5);

  const totalCitasGlob = totales.total_citas !== undefined ? totales.total_citas : '—';
  const atendidasGlob = totales.atendidas !== undefined ? totales.atendidas : '—';
  const inasistGlob = totales.inasistencias !== undefined ? totales.inasistencias : '—';
  const canceladasGlob = totales.canceladas !== undefined ? totales.canceladas : '—';
  const efectividadGlob = totales.porcentajes?.tasa_efectividad !== undefined
    ? `${totales.porcentajes.tasa_efectividad}%`
    : '—';
  const ausentismoGlob = totales.porcentajes?.tasa_ausentismo !== undefined
    ? `${totales.porcentajes.tasa_ausentismo}%`
    : '—';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(18, 52, 59);
  doc.text(
    `Citas Totales: ${totalCitasGlob}   |   Atendidas: ${atendidasGlob}   |   Inasistencias: ${inasistGlob}   |   Canceladas: ${canceladasGlob}`,
    18,
    posY + 11
  );
  doc.text(
    `Tasa Global de Efectividad: ${efectividadGlob}   |   Tasa Global de Ausentismo: ${ausentismoGlob}`,
    18,
    posY + 16
  );

  // 6. Decorar todas las páginas con cabecera y pie
  decorarPaginas(doc, 'Reporte de Cumplimiento, Asistencia y Ausentismo Clinico', fechaHoraGeneracion);

  // 7. Descargar archivo PDF
  const fIniNombre = filtros.fechaInicio || 'inicio';
  const fFinNombre = filtros.fechaFin || 'fin';
  const nombreArchivo = `reporte_cumplimiento_${fIniNombre}_a_${fFinNombre}.pdf`;
  doc.save(nombreArchivo);
}


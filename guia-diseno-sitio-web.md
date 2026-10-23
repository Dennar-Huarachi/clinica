# GUÍA DE DISEÑO — Sitio web Clínica Vida Salud

> **INSTRUCCIÓN PARA LA IA (leer primero):**
> Al crear **cualquier** página, componente o panel de este sistema (parte pública y paneles internos por rol), debes seguir **estrictamente** esta guía de diseño: colores, tipografía, estructura de secciones, comportamiento responsive y componentes. No inventes otro estilo ni cambies la paleta. Si algo no está definido aquí, mantén la misma línea visual (limpia, luminosa, turquesa/verde azulado, naranja solo para la acción principal) y avisa qué decidiste.
>
> El diseño está inspirado en la referencia visual del sitio de la *Clínica de las Américas* (capturas de pantalla en celular). **Se copia el estilo y la estructura, NO se copian logo, textos, fotos ni marca.** Todo el contenido debe ser propio.

---

## 1. Idea general

Un sitio **limpio y luminoso**: fondo blanco, tonos turquesa y verde azulado, y un **naranja vivo solo para las acciones principales**. Se diseña **primero para celular (mobile-first)** y luego se amplía a tablet, laptop y escritorio.

Los títulos combinan **una parte en negrita y otra fina** (misma línea o en dos líneas), como en la referencia:

- **Atención integral** *muy cerca de usted*
- **Todo lo que su salud necesita** *en un solo lugar*
- **Nuestros** servicios (negrita + fino)
- **Busque a su** especialidad
- **Cuidamos su salud** *con respaldo y cercanía*

---

## 2. Tecnología y reglas de código

- Stack del proyecto: **PHP + PostgreSQL**. El front debe ser HTML + CSS + JS que se integre con plantillas PHP (header, footer y menú reutilizables).
- Maquetación con **CSS Grid y Flexbox**, **media queries** y la etiqueta viewport:
  `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Usar **variables CSS** (`:root`) para todos los colores, radios y sombras. Nunca escribir colores sueltos en los componentes.
- Las tablas **no deben cortarse ni obligar a deslizar la página de lado**.
- Pendiente por definir: usar Bootstrap/Tailwind o **CSS propio** (por defecto: CSS propio).

---

## 3. Pantallas que debe soportar

| Dispositivo | Ancho | Layout |
|---|---|---|
| Celular | hasta 640 px | Una columna, menú hamburguesa, barra fija inferior |
| Tablet | 641 a 1024 px | Dos columnas, menú lateral que se puede ocultar |
| Laptop | 1025 a 1440 px | Tres o cuatro columnas, menú lateral fijo |
| Escritorio grande | más de 1440 px | Contenido con ancho máximo (~1280 px), centrado |

---

## 4. Paleta de colores

```css
:root {
  /* Marca */
  --verde-azulado:   #0A6C84; /* menús, títulos, botones secundarios, fondos de secciones */
  --turquesa:        #1FA5B8; /* detalles, iconos, bordes activos */
  --cian:            #22C3E0; /* botones pequeños, resaltados, buscador */
  --naranja:         #F28C1E; /* SOLO botón principal (Agendar cita, Buscar, Confirmar) */
  --naranja-oscuro:  #C75F00; /* naranja para texto blanco (accesible) */

  /* Fondos */
  --fondo:           #F4FAFB;
  --blanco:          #FFFFFF; /* tarjetas */

  /* Texto */
  --texto:           #12343B; /* títulos y cuerpo */
  --texto-sec:       #5B7078; /* texto secundario */

  /* Estados de la cita */
  --programada:      #22C3E0; /* cian */
  --confirmada:      #2E9E6B; /* verde */
  --atendida:        #0A6C84; /* verde azulado profundo */
  --cancelada:       #D9534F; /* rojo suave */
  --inasistencia:    #7A8A90; /* gris */
  --postergada:      #E0A100; /* ámbar */
}
```

**Reglas de uso**

- **Naranja = acción principal y nada más.** No usarlo para decorar.
- **No usar azul marino oscuro.** El tono más oscuro es el verde azulado `#0A6C84`.
- **Contraste:** el texto blanco sobre naranja claro se lee mal. En botones naranja usar **texto oscuro** (`--texto`) o el naranja oscuro `#C75F00` con texto blanco.
- **Los estados de la cita siempre llevan texto**, nunca solo color (ej. insignia "Confirmada" con icono + texto).

---

## 5. Tipografía y estilo

- Fuente sans-serif redondeada y legible: **Nunito Sans** (alternativa: Lato). Tamaño base **16 px**.
- Títulos grandes con **dos pesos**: negrita (700) para la idea principal y fino (300) para la complementaria.
- **Bordes redondeados de 12 a 16 px** en botones, campos y tarjetas.
- **Tarjetas blancas** con sombra muy suave, **mucho espacio en blanco** e **iconos de línea**.

```css
:root {
  --radio: 14px;
  --sombra: 0 4px 16px rgba(10, 108, 132, 0.10);
}
.titulo b { font-weight: 700; }
.titulo span { font-weight: 300; }
```

---

## 6. Parte pública (inicio) — orden de secciones

De arriba hacia abajo (así debe construirse la página de inicio):

### 6.1 Encabezado
- Fondo blanco. **Logo a la izquierda** (por ahora texto provisional "Clínica Vida Salud").
- A la derecha, **botones cuadrados pequeños con esquinas redondeadas** (accesos rápidos):
  1. Teléfono → **naranja**
  2. Icono secundario (ej. resultados/laboratorio) → **verde azulado `#0A6C84`**
  3. Buscar → **cian `#22C3E0`**
  4. Hamburguesa (☰) → **gris claro**; al abrir el menú se convierte en **X**
- Zonas táctiles de mínimo 44 px.

### 6.2 Portada (hero)
- **Foto grande** de fondo con un **degradado verde azulado** encima para que el texto blanco se lea.
- Título en dos pesos, **en blanco**: "**Atención integral** *muy cerca de usted*".
- Frase corta en blanco debajo.
- **Botón naranja** "Agendar cita" (o "Nuestros servicios").

### 6.3 Accesos rápidos en tarjetas
Título centrado: "**Todo lo que su salud necesita** *en un solo lugar*" (color verde azulado).

Tarjetas: **Agendar cita, Encontrar un médico, Especialidades, Mis citas, Consultar resultados.**

- Cada tarjeta blanca lleva: **icono de línea turquesa + título + descripción corta + botón verde azulado con flecha →** (ej. "Agendar ahora →").
- Columnas: **celular 2**, **tablet 3**, **escritorio 4 o 5**.

### 6.4 Servicios / especialidades (carrusel)
- Título centrado "**Nuestros** *servicios*" en verde azulado.
- **Carrusel que se desliza con el dedo**; **flechas redondas** (‹ ›) arriba a la derecha en pantallas grandes.
- Cada tarjeta: **foto de fondo con degradado oscuro-azulado**, título blanco, descripción corta blanca y **botón pequeño cian** con flecha (ej. "Agende su cita →").
- Se ve parte de la siguiente tarjeta cortada para invitar a deslizar.

### 6.5 Buscador "Busque a su especialista"
- Franja con **fondo verde azulado** (con imagen muy tenue de fondo).
- Título blanco: "**Busque a su** *especialista*".
- **Campo blanco** ("Escriba una especialidad") + **botón naranja "BUSCAR →"**.
- Celular: campo y botón **apilados**. Desktop: en una fila.

### 6.6 Sección informativa / noticias
- Sobre **fondo blanco**: pequeño rótulo "Noticias", título en fino, texto breve y botón naranja pequeño "Leer más →"; **foto con bordes redondeados** al otro lado.
- Celular: texto e imagen **apilados**.

### 6.7 Sección institucional "Cuidamos su salud"
- Sobre **fondo verde azulado profundo**, **texto a un lado e imagen al otro** (en celular, apiladas).
- Título blanco en dos pesos: "**Cuidamos su salud** *con respaldo y cercanía*", párrafos en blanco y botón naranja "Conozca más →".

### 6.8 Pie de página
- Contacto, horarios y enlaces.

---

## 7. Menú (parte pública)

**Celular**
- Botón hamburguesa que abre un **menú a pantalla completa** sobre **fondo verde azulado**.
- Opciones en **blanco y negrita**, con **líneas separadoras finas** entre cada una; las que tienen submenú llevan una **flechita ▾**.
- Opciones sugeridas: Servicios ▾, Especialidades, Pacientes, Médicos, Nosotros ▾, Contacto.
- **Barra fija inferior** con dos botones a mitad de ancho cada uno:
  - "**Agendar cita**" (naranja, icono de calendario)
  - "**¿Necesita ayuda?**" (verde azulado, icono de chat)

**Tablet y escritorio**
- **Menú horizontal** arriba.
- La barra inferior se reemplaza por **dos botones flotantes en la esquina inferior derecha** ("Agendar cita" naranja y "¿Necesita ayuda?" verde azulado, con icono, esquinas redondeadas y sombra).

---

## 8. Parte interna — paneles por rol

### 8.1 Distribución de pantalla
- **Celular:** encabezado con hamburguesa y **barra inferior con 4 accesos**: Inicio, Citas, Agenda o Pacientes (según el rol), Perfil.
- **Tablet:** menú lateral **colapsable con solo iconos**.
- **Laptop y escritorio:** menú lateral **fijo con iconos y texto**, y área de contenido a la derecha.
- El menú lateral usa fondo **verde azulado `#0A6C84`**, item activo con borde/indicador **turquesa**.

### 8.2 Pantallas por rol (con su caso de uso)

**Paciente**
- Reservar cita (elegir especialidad, médico, fecha y turno) — CU-10, CU-12
- Mis citas, cancelar o confirmar — CU-12, CU-15
- Mi perfil — CU-06
- Historial clínico — CU-20 (opcional)

**Recepcionista**
- Buscar o registrar pacientes — CU-05
- Programar y reprogramar citas — CU-12
- Agenda de cualquier médico — CU-14
- Suspensiones de horario — CU-11
- Marcar asistencia — CU-13

**Médico**
- Mi agenda del día — CU-14
- Mis pacientes — CU-17
- Marcar atendida o inasistencia — CU-13
- Atención clínica y laboratorio — CU-18, CU-19 (opcionales)

**Administrador**
- Usuarios y roles — CU-04
- Especialidades, médicos y horarios — CU-07, CU-08, CU-09
- Reportes y exportación — CU-21, CU-22, CU-23

> Nota: la numeración de casos de uso puede cambiar cuando se fusione la lista final de casos de uso; si cambia, actualizar las referencias.

### 8.3 Cómo se adaptan los elementos

| Elemento | Celular | Escritorio |
|---|---|---|
| Tablas | **Tarjetas apiladas / Acordeón vertical** (sin scroll lateral) | Tabla normal |
| Agenda | Lista del día con selector de fecha | Vista de semana por horas |
| Elección de turno | Cuadrícula de botones con la hora, **3 columnas** | **6 o más columnas** |
| Formularios | **1 columna** | **2 columnas** |
| Ventanas emergentes | **Pantalla completa** | Cuadro centrado |
| Reportes | **Filtros plegables**; gráficos y tablas ajustados al ancho | Filtros visibles |

- **Tablas en móviles (≤ 640px):** Prohibido el scroll horizontal. La fila compacta colapsada muestra únicamente 2 o 3 datos esenciales. Al desplegar el acordeón, los datos secundarios se distribuyen en 1 sola columna vertical (100% ancho) y los botones de acción se apilan verticalmente (`flex-direction: column`) ocupando el 100% del ancho con altura táctil mínima de 44px.
- Turnos ocupados: se ven **deshabilitados** (gris + texto "Ocupado").
- Formularios: **mensaje de error debajo de cada campo**.

---

## 9. Componentes base

- **Botón primario:** naranja (acción principal).
- **Botón secundario:** verde azulado `#0A6C84`.
- **Botón terciario:** solo borde.
- **Botón pequeño de tarjeta:** cian con flecha →.
- Campos de texto, listas desplegables, selector de fecha y buscador.
- Tarjetas, **insignias de estado de la cita** (con texto), alertas y mensajes breves de confirmación.
- Paginación, pestañas y carrusel.

Todos con bordes redondeados de 12–16 px.

---

## 10. Accesibilidad y rendimiento

- Zonas táctiles de **al menos 44 px**.
- Buen contraste entre texto y fondo.
- Campos con **etiqueta visible** y **navegación con teclado**.
- Imágenes ligeras que se cargan según el tamaño de pantalla (`srcset`, `loading="lazy"`).
- Los estados **nunca dependen solo del color**.

---

## 11. Pendientes por definir

- Nombre y logo definitivos de la clínica (por ahora texto provisional "Clínica Vida Salud").
- Si se usará Bootstrap/Tailwind o CSS propio.
- Si el modo oscuro es necesario.
- Qué fotos usar (**deben ser propias o libres de derechos**; no usar las de la clínica de referencia).

---

## 12. Checklist para la IA antes de entregar cualquier pantalla

- [ ] ¿Usa solo los colores de la paleta (variables CSS)?
- [ ] ¿El naranja aparece solo en la acción principal?
- [ ] ¿Los títulos combinan negrita + fino?
- [ ] ¿Funciona en celular, tablet, laptop y escritorio grande?
- [ ] ¿Las tablas se ven como tarjetas en celular?
- [ ] ¿Los botones tienen mínimo 44 px y buen contraste?
- [ ] ¿Los estados de cita llevan texto además de color?
- [ ] ¿Los formularios tienen etiqueta visible y errores bajo cada campo?
- [ ] ¿No se copió logo, texto ni fotos de la web de referencia?

<?php

// CU-02 Cambiar contraseña — Configuración — Recuperación por correo. Cubre: RF01 · Reglas: RN12, RN21

return [
    'codigo' => env('CODIGO_RECUPERACION', '482913'),
    'vigenciaMinutos' => 10,
    'segundosEspera' => 60,
    'maximoIntentos' => 5,
    'maximoSolicitudesPorHora' => 5,
];


<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Poblado inicial de la base de datos de la Clínica "Vida Salud".
     */
    public function run(): void
    {
        // 1. Roles del sistema
        $roles = [
            ['id_rol' => 1, 'nombre' => 'administrador', 'descripcion' => 'Administrador total del sistema', 'created_at' => now(), 'updated_at' => now()],
            ['id_rol' => 2, 'nombre' => 'medico', 'descripcion' => 'Profesional médico de la clínica', 'created_at' => now(), 'updated_at' => now()],
            ['id_rol' => 3, 'nombre' => 'recepcionista', 'descripcion' => 'Personal de recepción y gestión de citas', 'created_at' => now(), 'updated_at' => now()],
            ['id_rol' => 4, 'nombre' => 'paciente', 'descripcion' => 'Usuario paciente con acceso a autoservicio', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('roles')->insertOrIgnore($roles);

        // 2. Estados de Cita médica
        $estadosCita = [
            ['id_estado_cita' => 1, 'codigo' => 'pendiente', 'nombre' => 'Pendiente', 'descripcion' => 'Cita reservada a la espera de confirmación', 'created_at' => now(), 'updated_at' => now()],
            ['id_estado_cita' => 2, 'codigo' => 'confirmada', 'nombre' => 'Confirmada', 'descripcion' => 'Cita confirmada por el paciente o recepción', 'created_at' => now(), 'updated_at' => now()],
            ['id_estado_cita' => 3, 'codigo' => 'en_espera', 'nombre' => 'En Sala de Espera', 'descripcion' => 'Paciente presente en la clínica esperando llamado', 'created_at' => now(), 'updated_at' => now()],
            ['id_estado_cita' => 4, 'codigo' => 'atendida', 'nombre' => 'Atendida', 'descripcion' => 'Consulta médica concluida con atención clínica registrada', 'created_at' => now(), 'updated_at' => now()],
            ['id_estado_cita' => 5, 'codigo' => 'cancelada', 'nombre' => 'Cancelada', 'descripcion' => 'Cita cancelada con anticipación', 'created_at' => now(), 'updated_at' => now()],
            ['id_estado_cita' => 6, 'codigo' => 'inasistencia', 'nombre' => 'Inasistencia', 'descripcion' => 'El paciente no asistió a su cita programada', 'created_at' => now(), 'updated_at' => now()],
            ['id_estado_cita' => 7, 'codigo' => 'reprogramada', 'nombre' => 'Reprogramada', 'descripcion' => 'Cita movida a otro turno u horario', 'created_at' => now(), 'updated_at' => now()],
            ['id_estado_cita' => 8, 'codigo' => 'postergada', 'nombre' => 'Postergada por Suspensión', 'descripcion' => 'Cita afectada por suspensión de médico pendiente de reubicación', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('estados_cita')->insertOrIgnore($estadosCita);

        // 3. Parámetros del sistema
        $parametros = [
            [
                'clave' => 'HORAS_ANTICIPACION_CANCELAR',
                'valor' => '2',
                'descripcion' => 'Horas mínimas de anticipación requeridas para que un paciente cancele su turno',
                'tipo_dato' => 'integer',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'clave' => 'HORAS_VENTANA_POSTERGADAS',
                'valor' => '48',
                'descripcion' => 'Horas en que los turnos liberados tras suspensión quedan reservados exclusivamente para reubicar citas postergadas',
                'tipo_dato' => 'integer',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'clave' => 'MINUTOS_DURACION_TURNO',
                'valor' => '15',
                'descripcion' => 'Duración estándar de cada turno de consulta en minutos',
                'tipo_dato' => 'integer',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'clave' => 'NOMBRE_CLINICA',
                'valor' => 'Clínica Vida Salud',
                'descripcion' => 'Nombre institucional del establecimiento',
                'tipo_dato' => 'string',
                'created_at' => now(),
                'updated_at' => now()
            ],
        ];
        DB::table('parametros_sistema')->insertOrIgnore($parametros);

        // 4. Especialidades iniciales
        $especialidades = [
            ['id_especialidad' => 1, 'nombre' => 'Medicina General', 'descripcion' => 'Atención primaria y diagnóstico integral', 'duracion_turno_minutos' => 15, 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['id_especialidad' => 2, 'nombre' => 'Pediatría', 'descripcion' => 'Atención médica integral infantil y adolescente', 'duracion_turno_minutos' => 20, 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['id_especialidad' => 3, 'nombre' => 'Cardiología', 'descripcion' => 'Prevención, diagnóstico y tratamiento cardiovascular', 'duracion_turno_minutos' => 30, 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['id_especialidad' => 4, 'nombre' => 'Ginecología y Obstetricia', 'descripcion' => 'Salud reproductiva femenina y control prenatal', 'duracion_turno_minutos' => 20, 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
            ['id_especialidad' => 5, 'nombre' => 'Traumatología', 'descripcion' => 'Lesiones osteoarticulares y rehabilitación musculoesquelética', 'duracion_turno_minutos' => 20, 'estado' => 'activo', 'created_at' => now(), 'updated_at' => now()],
        ];
        DB::table('especialidades')->insertOrIgnore($especialidades);

        // 5. Usuario Administrador por defecto
        $idPersonaAdmin = DB::table('personas')->insertGetId([
            'ci' => '1000001',
            'nombres' => 'Administrador',
            'apellidos' => 'Vida Salud',
            'fecha_nacimiento' => '1988-05-15',
            'sexo' => 'M',
            'telefono' => '70001234',
            'correo' => 'admin@vidasalud.com',
            'direccion' => 'Av. Principal #100',
            'created_at' => now(),
            'updated_at' => now(),
        ], 'id_persona');

        DB::table('usuarios')->insertOrIgnore([
            'id_persona' => $idPersonaAdmin,
            'id_rol' => 1, // Administrador
            'nombre_usuario' => 'admin',
            'correo' => 'admin@vidasalud.com',
            'contrasena_hash' => Hash::make('admin123'),
            'debe_cambiar_contrasena' => false,
            'estado' => 'activo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 6. Permisos del sistema y matriz modular
        $this->call(PermisosSeeder::class);
    }
}

<?php

namespace App\Http\Requests\Paquetes\CatalogosHorarios\CU09_GestionarHorariosAtencion;

use App\Nucleo\Validaciones\FormRequestPersonalizado;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GuardarHorarioRequest extends FormRequestPersonalizado
{
    protected function prepareForValidation(): void
    {
        $inicio = $this->input('hora_inicio');
        $fin = $this->input('hora_fin');

        $merge = [];
        if ($inicio && is_string($inicio) && strlen($inicio) >= 5) {
            $merge['hora_inicio'] = substr($inicio, 0, 5);
        }
        if ($fin && is_string($fin) && strlen($fin) >= 5) {
            $merge['hora_fin'] = substr($fin, 0, 5);
        }
        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'id_medico' => 'required|integer|exists:medicos,id_medico',
            'id_especialidad' => 'required|integer|exists:especialidades,id_especialidad',
            'dia_semana' => 'required|integer|between:1,7', // 1=Lunes .. 7=Domingo
            'hora_inicio' => 'required|date_format:H:i',
            'hora_fin' => 'required|date_format:H:i|after:hora_inicio',
            'duracion_intervalo_minutos' => 'required|integer|min:5|max:120',
            'estado' => 'nullable|string|in:activo,inactivo',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $idMedico = $this->input('id_medico');
            $idEspecialidad = $this->input('id_especialidad');

            // 1. Validar vinculación Médico-Especialidad activa
            if ($idMedico && $idEspecialidad) {
                $vinculo = DB::table('medico_especialidad')
                    ->join('especialidades', 'medico_especialidad.id_especialidad', '=', 'especialidades.id_especialidad')
                    ->where('medico_especialidad.id_medico', $idMedico)
                    ->where('medico_especialidad.id_especialidad', $idEspecialidad)
                    ->where('especialidades.estado', 'activo')
                    ->exists();

                if (!$vinculo) {
                    $validator->errors()->add(
                        'id_especialidad',
                        'El médico seleccionado no tiene asignada esta especialidad médica o la especialidad se encuentra inactiva.'
                    );
                }
            }

            // 2. Validar divisibilidad exacta (RN08)
            $inicioStr = $this->input('hora_inicio');
            $finStr = $this->input('hora_fin');
            $duracion = (int)$this->input('duracion_intervalo_minutos', 15);

            if ($inicioStr && $finStr && $duracion > 0) {
                try {
                    $inicio = Carbon::createFromFormat('H:i', substr($inicioStr, 0, 5));
                    $fin = Carbon::createFromFormat('H:i', substr($finStr, 0, 5));

                    if ($fin->lte($inicio)) {
                        $validator->errors()->add('hora_fin', 'La hora de fin debe ser posterior a la hora de inicio.');
                    } else {
                        $diferenciaMinutos = $inicio->diffInMinutes($fin);
                        if ($diferenciaMinutos % $duracion !== 0) {
                            $validator->errors()->add(
                                'duracion_intervalo_minutos',
                                "El rango horario seleccionado debe ser divisible de forma exacta entre la duración del turno ({$duracion} min)."
                            );
                        }
                    }
                } catch (\Throwable $e) {
                    // Errores de formato cubiertos por date_format
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'id_medico.required' => 'Debe seleccionar un profesional médico.',
            'id_especialidad.required' => 'Debe seleccionar una especialidad médica.',
            'dia_semana.between' => 'El día de la semana debe ser válido (1=Lunes a 7=Domingo).',
            'hora_fin.after' => 'La hora de fin debe ser estrictamente posterior a la hora de inicio.',
            'duracion_intervalo_minutos.min' => 'La duración del turno debe ser de al menos 5 minutos.',
        ];
    }
}

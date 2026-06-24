export interface Session {
  numero: number;
  titulo: string;
  duracion: string;
  actividades: {
    inicio: string[];
    desarrollo: string[];
    cierre: string[];
  };
  materiales: string[];
  diasSelected?: string[];
  evaluacion?: string;
  preguntaMetacognitiva?: string;
}

export interface FaseMomento {
  nombre: string;
  descripcion: string;
  sesiones: Session[];
}

export interface EvaluacionFormativa {
  instrumentos: string[];
  criterios: string[];
  evidencias: string[];
}

export interface Planeacion {
  id?: string;
  userId?: string;
  createdAt?: any;
  tituloProyecto: string;
  resumen: string;
  docente: string;
  escuela: string;
  fase: string;
  grado: string;
  campoFormativo: string;
  ejesArticuladores: string[];
  metodologia: string;
  escenario: string;
  temporalidad: string;
  contenido: string;
  pda: string;
  proposito: string;
  propositoFormativo?: string;
  aprendizajeEsperado?: string;
  estrategiaNacional?: string;
  secuenciaDidactica: FaseMomento[];
  evaluacionFormativa: EvaluacionFormativa;
  ajustesRazonables: string[];
  recursosAdicionales?: string[];
  notasAdicionales?: string;
  contextoEscolar?: string;
  interesesOProblema?: string;
  tipoPlaneacion?: "Proyecto" | "Anual" | "Bimestral" | "Mensual" | "Semanal";
  frecuenciaSemanal?: string;
  horasSesion?: string;
  materias?: string[];
  incluyeComputacion?: boolean;
  mes?: string;
  ciclo?: string;
  periodo?: string;
  grupo?: string;
  disciplina?: string;
  actividadesComplementarias?: string;
}

export interface PredefinedData {
  field: string;
  contenidos: {
    titulo: string;
    pdas: string[];
  }[];
}

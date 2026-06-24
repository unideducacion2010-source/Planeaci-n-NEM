import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini API Client to prevent startup crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("La clave GEMINI_API_KEY de Google AI Studio no está configurada.");
    }
    aiClient = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}

// Wrapper to handle Gemini model requests with an automatic fallback mechanism
async function generateContentWithFallback(prompt: string, responseMimeType?: string, temperature?: number): Promise<string> {
  const modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const ai = getAiClient();
      console.log(`Intentando llamar al modelo de Gemini: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          ...(responseMimeType ? { responseMimeType } : {}),
          ...(temperature !== undefined ? { temperature } : {}),
        }
      });
      if (response && response.text) {
        console.log(`Éxito al generar contenido con el modelo: ${modelName}`);
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Advertencia: Error llamando al modelo ${modelName}:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error("No se pudo obtener respuesta de ningún modelo de Gemini.");
}

// Check api health and secrets status
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY;
  res.json({ 
    status: "ok", 
    geminiConfigured: hasKey,
    message: hasKey 
      ? "Servidor listo y API de Gemini configurada de forma segura." 
      : "Servidor encendido, pero falta configurar GEMINI_API_KEY en Secretos."
  });
});

// Endpoint to suggest NEM Elements (autofill, keywords, contenidos, pdas)
app.post("/api/suggest-elements", async (req, res) => {
  try {
    const { fase, grado, campoFormativo, temaInteres } = req.body;
    
    if (!fase || !grado || !campoFormativo) {
      return res.status(400).json({ error: "Faltan campos obligatorios para generar sugerencias." });
    }

    const ai = getAiClient();
    const prompt = `
      Actúa como un experto asesor de la Nueva Escuela Mexicana (NEM) en México de educación básica.
      El docente está planeando sus clases para el siguiente escenario:
      - Fase: ${fase}
      - Grado: ${grado}
      - Campo Formativo: ${campoFormativo}
      - Idea de proyecto / Tema de interés: ${temaInteres || 'Sugerencia general de acuerdo al grado'}

      Genera en formato JSON estructurado exactamente:
      1. 3 opciones de "contenidos" oficiales de la NEM (reales o altamente probables/adecuados según los planes vigentes SEP 2022/2023) con sus respectivos "pdas" (Procesos de Desarrollo de Aprendizaje, al menos 1 o 2 por contenido).
      2. 3 opciones creativas de "tituloProyecto" adecuados para el grado y campo.
      3. Sugerencia de "metodologias" recomendadas.
      
      Estructura del JSON de salida que debes devolver ÚNICAMENTE (sin markdown, comentarios ni texto extra):
      {
        "proyectosSugeridos": ["Título 1", "Título 2", "Título 3"],
        "contenidosSugeridos": [
          {
            "contenido": "Nombre del contenido oficial...",
            "pdas": ["PDA 1 para este grado...", "PDA 2 para este grado..."]
          },
          {
            "contenido": "Otro contenido oficial...",
            "pdas": ["PDA de ese contenido...", "Otro PDA..."]
          },
          {
            "contenido": "Tercer contenido oficial...",
            "pdas": ["PDA correspondiente..."]
          }
        ],
        "metodologiaRecomendada": {
          "nombre": "Aprendizaje Basado en Proyectos Comunitarios o Ciencia STEAM o Problemas ABP o Aprendizaje Servicio",
          "justificacion": "Breve explicación de por qué es idónea"
        }
      }
    `;

    const text = await generateContentWithFallback(prompt, "application/json", 0.7);
    const data = JSON.parse(text);
    return res.json(data);
  } catch (error: any) {
    console.error("Error al sugerir elementos:", error);
    return res.status(500).json({ 
      error: "Error al generar sugerencias con IA", 
      details: error.message 
    });
  }
});

// Endpoint to generate full planning
app.post("/api/generate-plan", async (req, res) => {
  try {
    const {
      tituloProyecto,
      resumen,
      docente,
      escuela,
      fase,
      grado,
      campoFormativo,
      ejesArticuladores,
      metodologia,
      escenario,
      temporalidad,
      contenido,
      pda,
      contextoEscolar,
      interesesOProblema,
      tipoPlaneacion,
      frecuenciaSemanal,
      horasSesion,
      materias,
      incluyeComputacion
    } = req.body;

    if (!fase || !grado || !campoFormativo || !metodologia || !contenido || !pda) {
      return res.status(400).json({ error: "Faltan campos críticos para generar la planeación. Revisa Fase, Grado, Campo Formativo, Metodología, Contenido y PDA." });
    }

    const ai = getAiClient();

    // Custom instruction based on chosen methodology
    let methodologyStructurePrompt = "";
    if (metodologia.includes("Proyectos Comunitarios")) {
      methodologyStructurePrompt = `
        La estructura didáctica DEBE dividirse en 3 FASES con un total de 11 MOMENTOS oficiales del Aprendizaje Basado en Proyectos Comunitarios:
        - FASE 1: PLANEACIÓN
          - Momento 1: Identificación (Planteamiento del problema real, insumos iniciales)
          - Momento 2: Recuperación (Saberes previos)
          - Momento 3: Planificación (Organización de los tiempos y acciones)
        - FASE 2: ACCIÓN
          - Momento 4: Acercamiento (Exploración del problema)
          - Momento 5: Comprensión y producción (Bocetado, experimentación, saberes teóricos)
          - Momento 6: Reconocimiento (Avances, dificultades y ajustes)
          - Momento 7: Concreción (Formulación final del producto)
        - FASE 3: INTERVENCIÓN
          - Momento 8: Integración (Intercambio y mejora del prototipo/servicio)
          - Momento 9: Difusión (Presentación del proyecto a la comunidad/aula)
          - Momento 10: Consideraciones (Evaluación del impacto y retroalimentación)
          - Momento 11: Avances (Toma de decisiones de seguimiento)
      `;
    } else if (metodologia.includes("STEAM") || metodologia.toLowerCase().includes("indagación")) {
      methodologyStructurePrompt = `
        La estructura didáctica DEBE dividirse en las 5 FASES oficiales del Aprendizaje Metodológico STEAM (Enfoque de Indagación):
        - FASE 1: Introducción al tema (Uso de conocimientos previos, planteamiento de preguntas de indagación inicial sobre el fenómeno)
        - FASE 2: Diseño de la investigación (Ruta de acción, recolección de datos y experimentación para responder a las preguntas)
        - FASE 3: Organizar y estructurar las respuestas a las preguntas de indagación (Análisis de datos, contraste de teorías, síntesis)
        - FASE 4: Presentación de los resultados de indagación (Propuestas de aplicación en la escuela o comunidad, prototipos o soluciones)
        - FASE 5: Metacognición y Reflexión sobre lo realizado (Autoevaluación del proceso, qué aprendieron, qué mejorar)
      `;
    } else if (metodologia.includes("Problemas") || metodologia.includes("ABP")) {
      methodologyStructurePrompt = `
        La estructura didáctica DEBE dividirse en los 6 MOMENTOS oficiales del Aprendizaje Basado en Problemas (ABP):
        - Momento 1: Presentemos (Sensibilización sobre un problema cotidiano de interés, lectura de texto descriptor)
        - Momento 2: Recolectemos (Exploración, saberes previos sobre la complejidad de ese problema)
        - Momento 3: Formulemos el problema (Delimitación explícita del problema central objeto de estudio)
        - Momento 4: Organicemos la experiencia (Planificación de tareas de investigación, roles, productos parciales)
        - Momento 5: Vivamos la experiencia (Indagación activa, experimentación, búsqueda en libros para dar respuesta)
        - Momento 6: Resultados y análisis (Presentación del análisis grupal, productos o soluciones, metacognición)
      `;
    } else if (metodologia.includes("Servicio") || metodologia.includes("AS")) {
      methodologyStructurePrompt = `
        La estructura didáctica DEBE dividirse en las 5 ETAPAS del Aprendizaje Servicio (AS) de la NEM:
        - ETAPA 1: Punto de partida (Sensibilización, interés por una necesidad o problemática real del entorno escolar/comunitario)
        - ETAPA 2: Lo que sé y lo que quiero saber (Diagnóstico participativo para definir límites del servicio público escolar/comunitario)
        - ETAPA 3: Organicemos las actividades (Cronograma detallado de la acción solidaria, recursos y responsables)
        - ETAPA 4: Creatividad en marcha (Puesta en marcha y ejecución práctica de las actividades y la prestación del servicio)
        - ETAPA 5: Compartimos y evaluamos lo aprendido (Reflexión sobre el éxito del servicio, aprendizajes curriculares y seguimiento)
      `;
    } else {
      methodologyStructurePrompt = `
        La estructura didáctica debe dividirse en 3 Momentos Básicos generales de la Secuencia Didáctica:
        - Fase de Apertura / Inicio (Recuperación de ideas y motivación)
        - Fase de Desarrollo (Construcción del conocimiento y proyectos activos)
        - Fase de Cierre (Evaluación y reflexión metacognitiva)
      `;
    }

    const tPlaneacion = tipoPlaneacion || "Proyecto";

    let tipoPlaneacionCustomPrompt = "";
    if (tPlaneacion === "Anual") {
      tipoPlaneacionCustomPrompt = `
        TIPO DE ENFOQUE: PLANEADOR ANUAL DE CLASE (Macro-estructura curricular para el Ciclo Escolar quincenal o trimestral completo).
        
        INSTRUCCIONES ESPECÍFICAS PARA EL PLAN ANUAL:
        1. Tu tarea es de nivel directivo y estratégico. Organiza el año escolar en 3 Trimestres/Periodos principales.
        2. La "secuenciaDidactica" debe estructurarse obligatoriamente con exactamente 3 elementos (uno para cada trimestre):
           - "nombre": "Trimestre I" (o "Primer Periodo"), "Trimestre II" ("Segundo Periodo"), "Trimestre III" ("Tercer Periodo").
           - "descripcion": El propósito pedagógico, metas grupales y bloques conceptuales centrales de ese trimestre.
           - "sesiones": En lugar de sesiones de clase individuales diarios, cada sesión aquí representará una Unidad Didáctica, un Eje Temático Macro, o un Gran Proyecto sugerido para ese trimestre (mínimo 3 sugeridos por trimestre, distribuidos con coherencia temporal).
             - "titulo": El nombre de la Unidad Temática o Proyecto sugerido (ej. "Proyecto de Integración Inicial" o "Unidad Temática: Expresión Artística y Narrativa").
             - "actividades": {
                "inicio": ["Lineamientos diagnósticos y metas iniciales del periodo...", "Estrategias de sensibilización grupal..."],
                "desarrollo": ["Proyectos didácticos específicos y ejes a abordar...", "Focalización de temas y contenidos clave del programa sintético..."],
                "cierre": ["Presentación de un producto integrador trimestral...", "Instrucciones de evaluación sumativa/formativa del periodo..."]
             }
             - "materiales": ["Libros de texto de la SEP", "Portafolios de evidencias", "Herramientas de evaluación trimestral"]
        3. El "proposito" debe ser un propósito estratégico anual.
      `;
    } else if (tPlaneacion === "Bimestral") {
      tipoPlaneacionCustomPrompt = `
        TIPO DE ENFOQUE: PLANEADOR BIMESTRAL DE CLASE (Organización curricular para un bloque didáctico de 2 meses).
        
        INSTRUCCIONES ESPECÍFICAS PARA EL PLAN BIMESTRAL:
        1. Organiza el bimestre escolar en periodos quincenales clave (4 bloques quincenales).
        2. La "secuenciaDidactica" debe tener entre 3 y 4 elementos en total que representen quincenas o bloques de semanas (ej: "Bloque 1: Quincena de Diagnóstico y Saberes", "Bloque 2: Quincena de Indagación Formativa", etc.).
        3. En cada bloque, las "sesiones" deben representar las metas didácticas u horizontes de aprendizaje de cada una de las semanas asociadas.
           - "titulo": El tema focal o meta del aprendizaje de esa semana (ej: "Semana 1: Conocimiento de las raíces y su descripción").
           - "actividades": {
                "inicio": ["Actividades clave para detonar el interés de la semana...", "Recuperación de conocimientos previos quincenales..."],
                "desarrollo": ["Proyectos y experimentos sugeridos semana con semana...", "Indagación científica, matemática y social activa..."],
                "cierre": ["Reflexiones meta-cognitivas y evaluación informal...", "Entregable grupal o individual de la semana..."]
             }
           - "materiales": ["Materiales específicos de la semana", "Libros de texto o contenidos comunitarios"]
      `;
    } else if (tPlaneacion === "Mensual") {
      tipoPlaneacionCustomPrompt = `
        TIPO DE ENFOQUE: PLANEADOR MENSUAL DE CLASE (Estructura y distribución didáctica organizada por semanas para 1 mes).
        
        INSTRUCCIONES ESPECÍFICAS PARA EL PLAN MENSUAL:
        1. La "secuenciaDidactica" debe contener exactamente 4 elementos, correspondientes a las semanas del mes:
           - "nombre": "Semana 1", "Semana 2", "Semana 3", "Semana 4".
           - "descripcion": El foco temático y propósito particular de aprendizaje de esa semana concreta.
        2. Dentro de cada semana, las "sesiones" representarán los días de clase o los tópicos principales.
           - "titulo": Título de la meta de aprendizaje semanal o proyecto de la semana.
           - "actividades": {
                "inicio": ["Detonador de aprendizaje y preguntas guía para la semana..."],
                "desarrollo": ["Secuencia lógica de actividades teórico-prácticas y de campo para avanzar en el PDA..."],
                "cierre": ["Evaluación del proceso semanal, retroalimentación y acuerdos de mejora..."]
             }
      `;
    } else if (tPlaneacion === "Semanal") {
      tipoPlaneacionCustomPrompt = `
        TIPO DE ENFOQUE: PLANEADOR SEMANAL DE CLASE (Plan de clase detallado sesión por sesión para los días de clase de la semana).
        
        INSTRUCCIONES ESPECÍFICAS PARA EL PLAN SEMANAL:
        ${frecuenciaSemanal ? `
        1. El usuario especificó que esta materia únicamente se imparte ciertos días o frecuencia semanal: "${frecuenciaSemanal}".
        2. CRÍTICO: El número total de sesiones debe coincidir EXACTAMENTE con el número de días específicos elegidos. Por ejemplo:
           - Si se indicó "Lunes, Miércoles y Viernes", debes generar EXACTAMENTE 3 sesiones (una para el Lunes, una para el Miércoles y otra para el Viernes).
           - Si se indicó "Martes y Jueves", debes generar EXACTAMENTE 2 sesiones (una para el Martes y otra para el Jueves).
           - Si se indicó "Solo los Viernes", debes generar EXACTAMENTE 1 sesión (para el Viernes).
           NO generes de forma forzada los 5 días de la semana de Lunes a Viernes, ni dejes sesiones en blanco o de relleno.
        3. En la lista de "sesiones", cada sesión debe corresponder a uno de esos días en orden secuencial:
           - "numero": Corresponde al correlativo de la sesión (1, 2, 3, etc.).
           - "titulo": Título diario de la sesión, especificando de forma obligatoria y súper clara el día de la semana correspondiente (ej: "Lunes: Indagación de saberes de la comunidad", "Miércoles: ...").
           - "duracion": "${horasSesion || "1 hora"}" (esta es la duración/horas de sesión que indicó el docente).
        ` : `
        1. Organiza la semana cubriendo de Lunes a Viernes (5 días lectivos estándar de L-V).
        2. La "secuenciaDidactica" estructúrala en fases que agrupen las actividades semanales.
        3. En "sesiones", incluye exactamente 5 sesiones distintas que representen cada día laborable de la semana en orden secuencial de Lunes a Viernes:
           - "numero": 1 (Lunes), 2 (Martes), 3 (Miércoles), 4 (Jueves), 5 (Viernes).
           - "titulo": Título diario especificando de forma clara y explícita el día de la semana correspondiente (ej: "Lunes: Introducción y saberes previos", "Martes: ...", "Miércoles: ...", "Jueves: ...", "Viernes: ...").
           - "duracion": "${horasSesion || "1 hora"}" por sesión.
        `}
        4. En cada sesión, "actividades" debe estructurarse con:
           - "inicio": ["Actividad de inicio paso a paso para comenzar la clase de ese día (recuperación, motivación, dinámica)..."],
           - "desarrollo": ["Proceso de desarrollo reflexivo paso a paso detallado para el docente (instrucciones prácticas, roles)..."],
           - "cierre": ["Cierre diario que incluye metacognición rápida, revisión de avances o pequeña tarea..."]
        5. "materiales": ["Lista de cuadernos, cartulinas, material de reúso u objetos específicos para este día concreto"]
      `;
    } else {
      tipoPlaneacionCustomPrompt = `
        TIPO DE ENFOQUE: PLANEACIÓN DIDÁCTICA POR PROYECTO (Modelo estándar NEM detallado continuo).
        
        INSTRUCCIONES ESPECÍFICAS:
        1. Divide la secuencia didáctica según los momentos y fases oficiales de la metodología sociocrítica elegida: ${metodologia}.
        2. Define de 3 a 5 sesiones secuenciales detalladas con Inicio, Desarrollo, Cierre para lograr culminar el proyecto elegido con éxito.
      `;
    }

    const prompt = `
      Actúa como un Diseñador Curricular Senior experto en Educación Básica en México de la Secretaría de Educación Pública (SEP). tu tarea es crear una PLANEACIÓN DIDÁCTICA INTEGRAL ultra completa, profesional y práctica, alineada perfectamente a los principios didácticos del Plan de Estudios 2022 y la Nueva Escuela Mexicana (NEM).

      DATOS DE LA PLANEACIÓN:
      - Docente: ${docente || "No especificado"}
      - Escuela: ${escuela || "No especificada"}
      - Proyecto: "${tituloProyecto || "Proyecto sin título"}"
      - Breve Resumen: ${resumen || "No especificado"}
      - Fase: ${fase} 
      - Grado: ${grado}
      - Campo Formativo: ${campoFormativo}
      - Ejes Articuladores: ${ejesArticuladores && ejesArticuladores.length > 0 ? ejesArticuladores.join(", ") : "Pensamiento Crítico"}
      - Metodología Sociocrítica: ${metodologia}
      - Escenario: ${escenario || "Aula"}
      - Temporalidad: ${temporalidad || "1 semana"}
      - Horas por sesión: ${horasSesion || "1 hora"}
      - Contenido Nacional/Programa Sintético: "${contenido}"
      - PDA (Proceso de Desarrollo de Aprendizaje): "${pda}"
      - Contexto Escolar / Diagnóstico Diagnóstico del Grupo: ${contextoEscolar || "Estudiantes con diversos estilos de aprendizaje, requieren trabajo lúdico y práctico."}
      - Problemática comunitaria o intereses a atender: ${interesesOProblema || "Integración grupal, cuidado del ambiente local."}
      - Materias / Asignaturas de articulación: ${(() => {
          let list = [...(materias || [])];
          if (incluyeComputacion && !list.includes("Computación")) {
            list.push("Computación");
          }
          return list.length > 0 ? list.join(", ") : "No especificadas";
        })()}
      - Incluye Computación como Materia (Opcional): ${incluyeComputacion ? "SÍ (IMPORTANTE: Trata a 'Computación' como una materia/asignatura de articulación adicional de forma explícita. Desarrolla contenidos, objetivos o aprendizajes específicos de Computación dentro del plan escolar en lugar de solo como una actividad secundaria)" : "NO"}

      ${methodologyStructurePrompt}

      ${tipoPlaneacionCustomPrompt}

      REQUISITOS IMPORTANTES DE CONTENIDO:
      1. No uses descripciones genéricas como "el docente explica el tema". Da instrucciones concretas paso a paso útiles para el maestro en el aula.
      2. Proporciona materiales físicos y recursos específicos que usará el maestro y los alumnos.
      3. Define rigurosamente un "propositoFormativo" (Propósito formativo que exprese de forma clara el para qué y el cómo de los conocimientos) y "aprendizajeEsperado" (Aprendizaje esperado que represente el indicador meta pedagógico a alcanzar).
      4. Si la materia de Computación está incluida, asegúrate de que se trate formalmente como una asignatura participante en la planeación y la secuencia didáctica, especificando qué aprendizajes o dinámicas de computación, pensamiento computacional o software educativo se abordarán en las sesiones como materia articulada.

      EVALUACIÓN FORMATIVA ALINEADA:
      Proporciona:
      - Instrumentos de evaluación sugeridos específicos (por ejemplo, rúbrica, escala estimativa, diario de clase).
      - Criterios claros de evaluación alineados exactamente con el PDA (ej. "El alumno logra identificar...").
      - Evidencias específicas de aprendizaje (el entregable o demostración que harán los niños).

      AJUSTES RAZONABLES:
      - Proporciona al menos 2 o 3 estrategias de inclusión y accesibilidad claras para alumnos que enfrenten barreras en el aula, con TDAH o ritmos de aprendizaje más lentos.

      ESTRATEGIA NACIONAL SUGERIDA:
      Determina y sugiere cuál de las Estrategias Nacionales de la SEP se alinea mejor con esto (por ejemplo, "Estrategia Nacional de Lectura", "Estrategia de Vida Saludable", "Estrategia de Inclusión y Educación Inclusiva", etc.).

      FORMATO DE SALIDA:
      Debes devolver un archivo JSON válido NATIVO, sin ningún bloque de texto externo, que cumpla exactamente la interfaz de TypeScript descrita abajo de manera que se pueda decodificar inmediatamente. No pongas bloques de comentarios de código. Evita las marcas de markdown al rededor excepto si usas JSON nativo puro.

      Interfaz de respuesta requerida:
      {
        "tituloProyecto": "Nombre del proyecto o planeación generada",
        "resumen": "Resumen pedagógico del proyecto o plan trimestral/mensual",
        "docente": "Nombre del docente",
        "escuela": "Nombre de la escuela",
        "fase": "La fase de la SEP",
        "grado": "Grado correspondiente",
        "campoFormativo": "Campo Formativo elegido",
        "ejesArticuladores": ["Eje 1", "Eje 2"],
        "metodologia": "Metodología utilizada",
        "escenario": "Aula, Escuela o Comunidad",
        "temporalidad": "Duración especificada",
        "contenido": "Contenido sintético",
        "pda": "PDA sintético incorporado",
        "proposito": "El propósito didáctico general redactado de forma profesional",
        "propositoFormativo": "El propósito formativo que exprese de forma clara el desarrollo del alumno",
        "aprendizajeEsperado": "El aprendizaje esperado concreto y evaluable para este nivel",
        "estrategiaNacional": "Estrategia Nacional sugerida",
        "mes": "Nombre del mes (ej. JUNIO)",
        "ciclo": "Ciclo escolar actual (ej. 2025-2026)",
        "periodo": "Periodo o bimestre de realización (ej. 6o BIMESTRE)",
        "grupo": "Grupo o sección (ej. A)",
        "disciplina": "La disciplina o asignatura participante (ej. COMPUTACION)",
        "actividadesComplementarias": "Casos de uso o actividades complementarias recomendadas",
        "secuenciaDidactica": [
          {
            "nombre": "Nombre de la Fase, Trimestre, Semana o Bloque (ej. Trimestre I, Semana 1 o Fase 1: Planeación)",
            "descripcion": "Descripción breve del foco de esta fase/semana en el proyecto o plan",
            "sesiones": [
              {
                "numero": 1,
                "titulo": "Título de la sesión, día o tema focal",
                "duracion": "50 minutos",
                "actividades": {
                  "inicio": ["Actividad 1 paso a paso...", "Actividad 2 paso a paso..."],
                  "desarrollo": ["Desarrollo 1...", "Desarrollo 2..."],
                  "cierre": ["Cierre 1...", "Cierre 2..."]
                },
                "materiales": ["Material 1", "Material 2"],
                "preguntaMetacognitiva": "Una pregunta meta cognitiva que invite a la reflexión del alumno (ej. ¿Qué cosas interesantes podemos hacer con este objeto?)",
                "evaluacion": "El instrumento de evaluación formativa específico para esta sesión (ej. Cuestionario, Escala de valoración, etc.)"
              }
            ]
          }
        ],
        "evaluacionFormativa": {
          "instrumentos": ["Instrumento 1", "Instrumento 2"],
          "criterios": ["Criterio 1", "Criterio 2"],
          "evidencias": ["Evidencia 1", "Evidencia 2"]
        },
        "ajustesRazonables": ["Ajuste 1", "Ajuste 2"]
      }
    `;

    const text = await generateContentWithFallback(prompt, "application/json", 0.75);
    const data = JSON.parse(text);
    // Force inject the selected planner scope
    data.tipoPlaneacion = tPlaneacion;
    data.frecuenciaSemanal = frecuenciaSemanal || "";
    data.horasSesion = horasSesion || "1 hora";
    data.materias = materias || [];
    data.incluyeComputacion = !!incluyeComputacion;
    return res.json(data);
  } catch (error: any) {
    console.error("Error al generar la planeación:", error);
    return res.status(500).json({ 
      error: "Error interno al generar la planeación con Gemini", 
      details: error.message 
    });
  }
});

// Configure Vite middleware in development or direct static in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA routing fallback for non-API calls
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server running on http://localhost:${PORT}`);
  });
}

startServer();

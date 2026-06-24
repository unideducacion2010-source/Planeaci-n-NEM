import { PredefinedData } from "../types";

export const FASES_Y_GRADOS = [
  { 
    fase: "Fase 2", 
    nivel: "Preescolar", 
    grados: ["1º de Preescolar", "2º de Preescolar", "3º de Preescolar"] 
  },
  { 
    fase: "Fase 3", 
    nivel: "Primaria", 
    grados: ["1º de Primaria", "2º de Primaria"] 
  },
  { 
    fase: "Fase 4", 
    nivel: "Primaria", 
    grados: ["3º de Primaria", "4º de Primaria"] 
  },
  { 
    fase: "Fase 5", 
    nivel: "Primaria", 
    grados: ["5º de Primaria", "6º de Primaria"] 
  },
  { 
    fase: "Fase 6", 
    nivel: "Secundaria", 
    grados: ["1º de Secundaria", "2º de Secundaria", "3º de Secundaria"] 
  }
];

export const CAMPOS_FORMATIVOS = [
  {
    id: "lenguajes",
    nombre: "Lenguajes",
    color: "bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200",
    colorAccent: "pink",
    icon: "MessageSquareText"
  },
  {
    id: "saberes",
    nombre: "Saberes y Pensamiento Científico",
    color: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200",
    colorAccent: "blue",
    icon: "Binary"
  },
  {
    id: "etica",
    nombre: "Ética, Naturaleza y Sociedades",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200",
    colorAccent: "emerald",
    icon: "Globe2"
  },
  {
    id: "humano",
    nombre: "De lo Humano y lo Comunitario",
    color: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-200",
    colorAccent: "orange",
    icon: "Heart"
  },
  {
    id: "computacion",
    nombre: "Computación y Ciudadanía Digital",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200",
    colorAccent: "indigo",
    icon: "Laptop"
  }
];

export const EJES_ARTICULADORES = [
  { id: "inclusion", nombre: "Inclusión", color: "bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 border-fuchsia-200" },
  { id: "critico", nombre: "Pensamiento Crítico", color: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200" },
  { id: "interculturalidad", nombre: "Interculturalidad Crítica", color: "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200" },
  { id: "genero", nombre: "Igualdad de Género", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200" },
  { id: "saludable", nombre: "Vida Saludable", color: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200" },
  { id: "lectura", nombre: "Apropiación de las culturas a través de la lectura y la escritura", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200" },
  { id: "artes", nombre: "Artes y Experiencias Estéticas", color: "bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200" }
];

export const METODOLOGIAS = [
  {
    nombre: "Aprendizaje Basado en Proyectos Comunitarios (ABPC)",
    abreviatura: "ABPC",
    campoComun: "Lenguajes",
    fases: [
      { n: "Fase 1: Planeación", d: "Instantes de identificar la necesidad o problema real pedagógico, recuperar saberes previos y trazar la ruta." },
      { n: "Fase 2: Acción", d: "Exploración minuciosa del problema, recopilación, y producción de borradores o soluciones tangibles." },
      { n: "Fase 3: Intervención", d: "Presentación de resultados a la comunidad, autoevaluación, toma de acuerdos y decisiones de avance." }
    ],
    justificacion: "Recomendada para el campo formativo de Lenguajes. Permite vincular los saberes escolares con problemáticas socioeducativas de la comunidad."
  },
  {
    nombre: "Aprendizaje Basado en Indagación (STEAM)",
    abreviatura: "STEAM",
    campoComun: "Saberes y Pensamiento Científico",
    fases: [
      { n: "Fase 1: Introducción al tema", d: "Se usan conocimientos previos, se identifica una problemática o pregunta rectora del fenómeno." },
      { n: "Fase 2: Diseño de la investigación", d: "Planificación de actividades, roles e indagaciones prácticas o experimentos." },
      { n: "Fase 3: Organizar respuestas", d: "Contraste de hipótesis, estructuración de explicaciones y análisis de datos." },
      { n: "Fase 4: Presentación de resultados", d: "Comunicación de hallazgos, propuestas de prototipos o explicaciones científicas." },
      { n: "Fase 5: Metacognición y Reflexión", d: "Autoevaluación del proceso científico y de indagación vivido." }
    ],
    justificacion: "Recomendada para Saberes y Pensamiento Científico. Desarrolla el pensamiento lógico, el método científico y resolución tecnológica."
  },
  {
    nombre: "Aprendizaje Basado en Problemas (ABP)",
    abreviatura: "ABP",
    campoComun: "Ética, Naturaleza y Sociedades",
    fases: [
      { n: "Momento 1: Presentemos", d: "Planteamiento inicial del escenario del problema, recuperando interés escolar." },
      { n: "Momento 2: Recolectemos", d: "Exploración de conceptos y saberes para ampliar el entendimiento de la complejidad del problema." },
      { n: "Momento 3: Formulemos el problema", d: "Identificar formalmente qué se va a investigar o la pregunta/consigna central." },
      { n: "Momento 4: Organicemos la experiencia", d: "Puntos de partida, planeación del proceso de aprendizaje e investigativo." },
      { n: "Momento 5: Vivamos la experiencia", d: "Indagación guiada, lectura reflexiva, experimentación grupal activa." },
      { n: "Momento 6: Resultados y análisis", d: "Presentación, intercambio, evaluación y metacognición final." }
    ],
    justificacion: "Recomendada para Ética, Naturaleza y Sociedades. Fomenta el juicio ético, ciudadanía crítica e investigación histórica/social."
  },
  {
    nombre: "Aprendizaje Servicio (AS)",
    abreviatura: "AS",
    campoComun: "De lo Humano y lo Comunitario",
    fases: [
      { n: "Etapa 1: Punto de partida", d: "Sensibilización sobre los intereses o necesidades detectadas colectivamente." },
      { n: "Etapa 2: Lo que sé y lo que quiero saber", d: "Evaluación y diagnóstico del problema, delimitando nuestro plan educativo de servicio." },
      { n: "Etapa 3: Organicemos las actividades", d: "Estructuración grupal de tareas, comisiones, tiempos y materiales de acción." },
      { n: "Etapa 4: Creatividad en marcha", d: "Llevar a cabo la acción de servicio comunitario, adaptándose de forma flexible." },
      { n: "Etapa 5: Compartimos y evaluamos", d: "Reflexionar sobre aprendizajes curriculares, el éxito social del servicio y dar seguimiento." }
    ],
    justificacion: "Recomendada para De lo Humano y lo Comunitario. Desarrolla la empatía, el compromiso social y el bienestar solidario activo."
  }
];

export const ESCENARIOS = ["Aula", "Escuela", "Comunidad"];

// Predefined project ideas / themes / problems for NEM point 2
export const IDEAS_PROYECTO = [
  "Falta de cultura de reciclaje de basura en la comunidad escolar",
  "Hábitos de alimentación saludable y prevención de consumo de comida chatarra",
  "El agua en nuestra comunidad: cuidado de fugas, conservación y ahorro vital",
  "Convivencia pacífica, empatía y resolución constructiva de conflictos en el aula",
  "Exploración de la biodiversidad local y rescate de áreas verdes de la escuela",
  "Comprensión de instructivos y preparación de recetas lúdicas tradicionales",
  "Las matemáticas en el comercio local: juego interactivo de la tiendita escolar",
  "Rescate de las leyendas, costumbres, lenguas y tradiciones de nuestra comunidad",
  "Uso seguro, responsable y educativo de las tecnologías digitales en el aula",
  "Higiene personal, lavado de manos y prevención de enfermedades en la escuela"
];

// Predefined school and student contexts for NEM point 2
export const CONTEXTOS_AULA = [
  "Grupo con 25 estudiantes en total. Diversidad de ritmos de aprendizaje, con preferencia por actividades visuales y motrices. Dos estudiantes con diagnóstico de TDAH que requieren instrucciones visuales cortas y pausas activas regulares.",
  "Grupo con 30 alumnos. Nivel medio de comprensión lectora. Se observan dificultades en el cálculo mental. Muestran alta motivación por dinámicas lúdicas y juegos colaborativos al aire libre.",
  "Aula multigrado con diversidad de edades. Estudiantes de diversos contextos socioculturales, lo que enriquece el intercambio lingüístico. Requieren de actividades diferenciadas con apoyo de materiales didácticos concretos.",
  "Grupo participativo de 28 alumnos. Prefieren las artes, la música y los experimentos prácticos en equipo. Dos estudiantes con dificultades específicas en lectoescritura que se benefician de la tutoría entre pares.",
  "Grupo escolar de 32 alumnos. Presenta retos específicos en el seguimiento de reglas y en la autorregulación de emociones. Se trabaja activamente en la empatía, la comunicación asertiva y el trabajo cooperativo."
];

export interface OfficialContenido {
  contenido: string;
  pdas: string[];
}

// Comprehensive mapping of Planes y Programas (NEM 2022) for select dropdowns in point 4
export const OFFICIAL_PLANES_Y_PROGRAMAS: Record<string, Record<string, OfficialContenido[]>> = {
  "Fase 2": {
    "Lenguajes": [
      {
        contenido: "Comunicación de necesidades, emociones, gustos, ideas y saberes, a través de los diversos lenguajes.",
        pdas: [
          "Emplea palabras, gestos, señas, imágenes, sonidos o movimientos corporales para expresar sus necesidades, ideas y emociones.",
          "Manifiesta de manera clara y con seguridad sus gustos y opiniones respecto a temas familiares."
        ]
      },
      {
        contenido: "Narración de historias mediante diversos lenguajes y recursos expresivos.",
        pdas: [
          "Evoca y relata con secuencia lógica historias reales o imaginarias de su entorno familiar y comunitario.",
          "Describe lugares, personajes y acciones de los cuentos que escucha y lee."
        ]
      }
    ],
    "Saberes y Pensamiento Científico": [
      {
        contenido: "Los seres vivos: elementos, procesos y fenómenos naturales que ofrecen oportunidades de entender y explicar hechos cotidianos.",
        pdas: [
          "Hace preguntas sobre la naturaleza y las responde con sus propias ideas o con ayuda de sus compañeros.",
          "Observa y describe de manera detallada las características de las plantas y animales de su entorno local."
        ]
      },
      {
        contenido: "Los saberes numéricos como herramienta para resolver situaciones del entorno.",
        pdas: [
          "Dice en orden los números que conoce de manera progresiva y amplía su rango de conteo.",
          "Usa números en juegos de mesa y situaciones cotidianas que implican contar objetos de su entorno."
        ]
      }
    ],
    "Ética, Naturaleza y Sociedades": [
      {
        contenido: "Interacción, cuidado y conservación de la naturaleza, que favorece la construcción de una conciencia ambiental.",
        pdas: [
          "Convive de manera pacífica con su entorno natural, respetando plantas, árboles y animales.",
          "Promueve actitudes de cuidado del agua y manejo de basura en su salón de clases."
        ]
      }
    ],
    "De lo Humano y lo Comunitario": [
      {
        contenido: "Construcción de la identidad personal a partir de su origen, territorio, lengua y cultura.",
        pdas: [
          "Descubre rasgos de su historia familiar que lo vinculan con sus raíces culturales y comunitarias.",
          "Reconoce sus potencialidades de juego, movimiento y destrezas motrices."
        ]
      }
    ],
    "Computación y Ciudadanía Digital": [
      {
        contenido: "Uso seguro y exploración de dispositivos tecnológicos en el entorno familiar y escolar.",
        pdas: [
          "Reconoce partes básicas de una computadora o tableta y practica reglas de cuidado al utilizarlas.",
          "Distingue entre actividades en pantalla y juegos físicos, promoviendo hábitos saludables de tiempo de uso."
        ]
      },
      {
        contenido: "Identidad personal y respeto mutuo en interacciones mediadas por tecnología.",
        pdas: [
          "Identifica emociones al interactuar con contenidos digitales y practica la empatía digital con sus compañeros.",
          "Comprende la importancia de no compartir fotos o información de su familia sin supervisión de un adulto."
        ]
      },
      {
        contenido: "Espacio para Contenido Personalizado (Escribe aquí tu tema de computación)",
        pdas: [
          "Espacio para PDA Personalizado 1 (Escribe aquí tu indicador)",
          "Espacio para PDA Personalizado 2 (Escribe aquí tu indicador)"
        ]
      }
    ]
  },
  "Fase 3": {
    "Lenguajes": [
      {
        contenido: "Escritura de nombres en la lengua materna.",
        pdas: [
          "Escribe su nombre y lo compara con los nombres de sus compañeros, usa su nombre para indicar la autoría de sus trabajos de clase.",
          "Identifica nombres largos o cortos y nombres que empiezan o terminan con la misma letra."
        ]
      },
      {
        contenido: "Descripción de objetos, personas, seres vivos y lugares.",
        pdas: [
          "Describe de forma oral y escrita en su lengua materna objetos, personas, seres vivos y lugares de su entorno natural y social.",
          "Utiliza adjetivos calificativos de manera pertinente para enriquecer sus descripciones orales y escritas."
        ]
      },
      {
        contenido: "Lectura, escritura y otros tipos de interacción con nombres, letreros y carteles del aula.",
        pdas: [
          "Identifica el uso de textos de carácter público (como nombres de calles, letreros o avisos) en su comunidad.",
          "Escribe avisos, recados o letreros sencillos para comunicar actividades del aula o de la escuela."
        ]
      }
    ],
    "Saberes y Pensamiento Científico": [
      {
        contenido: "Cuerpo humano: estructura externa, funcionamiento de los órganos de los sentidos y acciones para su cuidado.",
        pdas: [
          "Compara y representa las características físicas externas del cuerpo, reconoce que son únicas y valiosas.",
          "Identifica órganos de los sentidos y su función, así como acciones cotidianas para su cuidado y prevención de accidentes."
        ]
      },
      {
        contenido: "Estudio de los números y nociones de suma y resta.",
        pdas: [
          "Expresa oralmente la sucesión numérica en su lengua materna hasta 100 de manera ascendente y descendente.",
          "Resuelve problemas de suma y resta con números menores a 100 usando agrupamientos y descomposiciones."
        ]
      },
      {
        contenido: "Características del entorno natural y sociocultural.",
        pdas: [
          "Distingue características de plantas y animales, las clasifica de acuerdo con su estructura o hábitat.",
          "Observa, compara y registra los cambios en la naturaleza a lo largo de las estaciones y su impacto social."
        ]
      }
    ],
    "Ética, Naturaleza y Sociedades": [
      {
        contenido: "Diversidad natural y cultural de su entidad y del país.",
        pdas: [
          "Reconoce y describe que los seres vivos y componentes de la naturaleza forman parte de la diversidad de su región.",
          "Valora las tradiciones, lenguas y costumbres de su comunidad, participando en festividades de forma respetuosa."
        ]
      },
      {
        contenido: "Respeto, cuidado y empatía hacia la naturaleza como parte de un todo interdependiente.",
        pdas: [
          "Se reconoce como parte de la naturaleza y promueve acciones de cuidado para preservar plantas y animales.",
          "Describe la importancia del agua, el aire, el suelo y el sol para los seres vivos, fomentando su conservación."
        ]
      }
    ],
    "De lo Humano y lo Comunitario": [
      {
        contenido: "Construcción de la identidad y sentido de pertenencia familiar y comunitaria.",
        pdas: [
          "Identifica aspectos de la historia familiar y comunitaria que fortalecen su identidad y sentido de pertenencia.",
          "Interactúa con empatía y respeto en juegos y dinámicas grupales para favorecer la convivencia armónica."
        ]
      },
      {
        contenido: "Estilos de vida activos y saludables en el aula y hogar.",
        pdas: [
          "Participa en actividades físicas de forma habitual para mantener un cuerpo activo y saludable.",
          "Reconoce la importancia del descanso, la recreación y el juego para el bienestar general."
        ]
      }
    ],
    "Computación y Ciudadanía Digital": [
      {
        contenido: "Ciudadanía Digital: Identidad, privacidad y huella digital básica en entornos virtuales.",
        pdas: [
          "Reconoce que tiene una identidad digital y describe prácticas sencillas para proteger sus datos personales y contraseñas.",
          "Identifica riesgos básicos al navegar en internet y reconoce a adultos de confianza a quienes reportar situaciones incómodas."
        ]
      },
      {
        contenido: "Pensamiento computacional elemental: seguimiento y creación de secuencias lógicas e instrucciones estructuradas.",
        pdas: [
          "Ordena instrucciones paso a paso (algoritmos sencillos) para resolver problemas lúdicos y retos de la vida diaria.",
          "Utiliza representaciones gráficas o dibujos para planificar una secuencia de acciones o comandos básicos."
        ]
      },
      {
        contenido: "Espacio para Contenido Personalizado (Escribe aquí tu tema de computación)",
        pdas: [
          "Espacio para PDA Personalizado 1 (Escribe aquí tu indicador)",
          "Espacio para PDA Personalizado 2 (Escribe aquí tu indicador)"
        ]
      }
    ]
  },
  "Fase 4": {
    "Lenguajes": [
      {
        contenido: "Comprensión y producción de textos instructivos para realizar actividades escolares y juegos.",
        pdas: [
          "Analiza las características de los textos instructivos (títulos, instrucciones, materiales) y valora su utilidad.",
          "Redacta textos instructivos sencillos empleando verbos en infinitivo o imperativo para organizar juegos o dinámicas."
        ]
      },
      {
        contenido: "Búsqueda y manejo reflexivo de información en su entorno y fuentes documentales.",
        pdas: [
          "Formula preguntas reflexivas para localizar información de interés y emplea recursos como índices o glosarios.",
          "Distingue entre hechos y opiniones en fuentes informativas orales o escritas de su comunidad."
        ]
      },
      {
        contenido: "Comprensión y producción de textos expositivos en los que se planteen problemas, soluciones, causas o consecuencias.",
        pdas: [
          "Planea y redacta un texto expositivo sobre problemas comunitarios, utilizando nexos lógicos de causa-efecto.",
          "Usa adecuadamente mayúsculas, puntos y signos de puntuación básicos al estructurar sus escritos."
        ]
      }
    ],
    "Saberes y Pensamiento Científico": [
      {
        contenido: "Estructura y funcionamiento del cuerpo humano: sistemas locomotor y digestivo, así como prácticas de su cuidado.",
        pdas: [
          "Describe y representa con modelos el funcionamiento del sistema digestivo, relacionando la ingesta de alimentos con la obtención de nutrientes.",
          "Identifica y describe la participación de la boca, esófago, estómago, intestinos en la digestión."
        ]
      },
      {
        contenido: "Alimentación saludable, con base en el Plato del Bien Comer, así como prácticas culturales y la toma de decisiones encaminadas a favorecer la salud.",
        pdas: [
          "Propone platillos saludables basados en el Plato del Bien Comer y agua simple potable para favorecer la salud familiar.",
          "Analiza etiquetas de alimentos ultraprocesados para tomar decisiones conscientes de consumo en la escuela."
        ]
      },
      {
        contenido: "Suma y resta como operaciones inversas, aplicadas a problemas lúdicos.",
        pdas: [
          "Resuelve problemas de suma o resta vinculados a su contexto escolar que implican números naturales de hasta cuatro cifras.",
          "Utiliza y explica algoritmos convencionales para resolver problemas de suma y resta en el juego de la tienda."
        ]
      }
    ],
    "Ética, Naturaleza y Sociedades": [
      {
        contenido: "Valoración de los ecosistemas: características de la comunidad, interacciones de la biodiversidad y sustentabilidad ambiental.",
        pdas: [
          "Analiza críticamente el impacto de las actividades humanas en los ecosistemas locales y propone acciones para mitigar el deterioro.",
          "Representa cartográficamente los ecosistemas de su entidad, identificando flora, fauna y fuentes de agua locales."
        ]
      },
      {
        contenido: "La toma de decisiones ante situaciones de conflicto o desacuerdos en el salón de clases.",
        pdas: [
          "Analiza causas de desacuerdos escolares y propone el diálogo asertivo y la mediación como vías pacíficas de resolución.",
          "Participa en la construcción democrática de acuerdos de convivencia escolar y asume compromisos."
        ]
      }
    ],
    "De lo Humano y lo Comunitario": [
      {
        contenido: "Hábitos saludables para promover el bienestar en la escuela y en la comunidad.",
        pdas: [
          "Analiza las características de una alimentación correcta, higiene y actividad física para diseñar un plan de vida saludable.",
          "Reflexiona sobre sus hábitos cotidianos de descanso e higiene, y asume el compromiso de modificarlos para su beneficio."
        ]
      },
      {
        contenido: "Capacidades motrices y de expresión lúdica.",
        pdas: [
          "Adapta sus movimientos corporales y motrices ante retos individuales o colectivos en el juego de Educación Física.",
          "Promueve el juego limpio, el compañerismo y el respeto a la diversidad en dinámicas recreativas grupales."
        ]
      }
    ],
    "Computación y Ciudadanía Digital": [
      {
        contenido: "Netiqueta, comunicación respetuosa y colaboración en plataformas digitales.",
        pdas: [
          "Aplica reglas de etiqueta digital (netiqueta) para redactar mensajes claros, respetuosos y asertivos en foros o correos escolares.",
          "Colabora con compañeros en la creación de documentos digitales compartidos, respetando las aportaciones de los demás."
        ]
      },
      {
        contenido: "Pensamiento algorítmico y detección de patrones para resolver problemas del entorno escolar.",
        pdas: [
          "Diseña diagramas de flujo sencillos o secuencias de bloques lógicos para modelar la solución a una problemática áulica.",
          "Identifica patrones repetitivos en problemas y los simplifica mediante la creación de ciclos o instrucciones de repetición."
        ]
      },
      {
        contenido: "Espacio para Contenido Personalizado (Escribe aquí tu tema de computación)",
        pdas: [
          "Espacio para PDA Personalizado 1 (Escribe aquí tu indicador)",
          "Espacio para PDA Personalizado 2 (Escribe aquí tu indicador)"
        ]
      }
    ]
  },
  "Fase 5": {
    "Lenguajes": [
      {
        contenido: "Comprensión y producción de textos argumentativos sobre temas de interés escolar o comunitario.",
        pdas: [
          "Expresa opiniones fundamentadas oralmente y por escrito, distinguiendo argumentos sólidos de meras suposiciones.",
          "Produce textos argumentativos coherentes en los que expone razones para defender una postura sobre un tema social."
        ]
      },
      {
        contenido: "Análisis y representación de textos dramáticos e historias teatrales.",
        pdas: [
          "Lee y analiza la estructura de obras teatrales breves, reconociendo acotaciones, diálogos y personajes.",
          "Representa de manera lúdica pasajes históricos o comunitarios mediante títeres o puestas en escena."
        ]
      }
    ],
    "Saberes y Pensamiento Científico": [
      {
        contenido: "Estructura y funcionamiento del cuerpo humano: sistemas circulatorio, respiratorio e inmunológico, y su relación con la salud.",
        pdas: [
          "Explica la interacción de los sistemas circulatorio y respiratorio en el intercambio de gases a partir de modelos físicos.",
          "Describe el papel del sistema inmunológico en la defensa contra infecciones y valora la importancia de las vacunas."
        ]
      },
      {
        contenido: "Multiplicación y división como operaciones inversas y resolución de problemas.",
        pdas: [
          "Resuelve situaciones problemáticas vinculadas a su contexto que impliquen multiplicaciones de números decimales por naturales.",
          "Resuelve problemas de división que involucren el cálculo de promedios o reparto proporcional."
        ]
      }
    ],
    "Ética, Naturaleza y Sociedades": [
      {
        contenido: "Interculturalidad y relación de respeto con la naturaleza, como saberes de los pueblos originarios.",
        pdas: [
          "Analiza la relación de los pueblos originarios con la naturaleza y reconoce la importancia de sus saberes sobre la preservación de los recursos.",
          "Comprende el impacto de las actividades industriales en la biodiversidad y asume un papel activo de cuidado ético ambiental."
        ]
      }
    ],
    "De lo Humano y lo Comunitario": [
      {
        contenido: "Construcción del proyecto de vida a través de metas escolares y sociales.",
        pdas: [
          "Valora sus logros académicos, deportivos y comunitarios para trazar nuevas metas de crecimiento personal a mediano plazo.",
          "Aplica estrategias de autorregulación y resiliencia para afrontar dificultades en sus metas escolares."
        ]
      }
    ],
    "Computación y Ciudadanía Digital": [
      {
        contenido: "Búsqueda crítica de información, derechos de autor y prevención de ciberacoso en la red.",
        pdas: [
          "Evalúa la veracidad de fuentes de información en internet aplicando criterios básicos de confiabilidad y cita adecuadamente a los autores.",
          "Analiza el impacto del ciberacoso (cyberbullying) y propone estrategias de prevención escolar y reporte seguro en redes sociales."
        ]
      },
      {
        contenido: "Estructuras lógicas de control, variables y pensamiento computacional en la resolución de problemas.",
        pdas: [
          "Utiliza variables y estructuras condicionales (si... entonces) para programar secuencias lógicas orientadas a simulaciones de fenómenos naturales.",
          "Construye algoritmos robustos con múltiples ramificaciones lógicas para optimizar recursos en proyectos de la comunidad."
        ]
      },
      {
        contenido: "Espacio para Contenido Personalizado (Escribe aquí tu tema de computación)",
        pdas: [
          "Espacio para PDA Personalizado 1 (Escribe aquí tu indicador)",
          "Espacio para PDA Personalizado 2 (Escribe aquí tu indicador)"
        ]
      }
    ]
  },
  "Fase 6": {
    "Lenguajes": [
      {
        contenido: "La diversidad de lenguas y su uso en la comunicación familiar, escolar y comunitaria.",
        pdas: [
          "Analiza y valora la importancia de la diversidad lingüística de México y el mundo, investigando lenguas maternas e indígenas.",
          "Elabora propuestas de divulgación escrita para fomentar el respeto a las variaciones lingüísticas del español."
        ]
      },
      {
        contenido: "Textos de divulgación científica y tecnológica.",
        pdas: [
          "Identifica las características de formato, lenguaje y estructura formal de un texto de divulgación científica.",
          "Escribe y publica artículos de divulgación científica dirigidos a la comunidad escolar sobre temas ambientales."
        ]
      }
    ],
    "Saberes y Pensamiento Científico": [
      {
        contenido: "Funcionamiento del cuerpo humano coordinado por los sistemas nervioso y endocrino.",
        pdas: [
          "Explica la coordinación del organismo por medio del sistema nervioso y las hormonas en los procesos de desarrollo biológico.",
          "Valora la importancia de la prevención de adicciones y conductas de riesgo para proteger el sistema nervioso."
        ]
      },
      {
        contenido: "Ecuaciones y proporcionalidad lineal aplicadas a fenómenos físicos.",
        pdas: [
          "Resuelve ecuaciones de primer grado y sistemas de ecuaciones lineales sencillos para modelar y resolver problemas científicos.",
          "Interpreta gráficos y tablas de proporcionalidad directa e inversa en el análisis de experimentos escolares."
        ]
      }
    ],
    "Ética, Naturaleza y Sociedades": [
      {
        contenido: "Los derechos humanos en el México contemporáneo y su garantía jurídica.",
        pdas: [
          "Debate sobre la importancia de los derechos humanos y propone mecanismos escolares para prevenir el acoso escolar y la discriminación.",
          "Investiga las instituciones nacionales e internacionales encargadas de defender y garantizar el respeto a los derechos humanos."
        ]
      }
    ],
    "De lo Humano y lo Comunitario": [
      {
        contenido: "Herramientas, máquinas e instrumentos como extensión corporal en la satisfacción de necesidades humanas.",
        pdas: [
          "Analiza el cambio técnico y la evolución de las herramientas digitales para mejorar procesos de trabajo colaborativo en la escuela.",
          "Diseña y pone a prueba soluciones tecnológicas respetuosas con el medio ambiente para resolver problemas en su entorno."
        ]
      }
    ],
    "Computación y Ciudadanía Digital": [
      {
        contenido: "Huella digital, derechos y deberes ciudadanos en la sociedad del conocimiento.",
        pdas: [
          "Reflexiona críticamente sobre el impacto a largo plazo de su huella digital y diseña campañas escolares de concientización sobre privacidad.",
          "Analiza las implicaciones legales, éticas y sociales de la piratería, el plagio y el uso compartido de licencias abiertas (Creative Commons)."
        ]
      },
      {
        contenido: "Modelado de sistemas, programación estructurada y robótica para la transformación social.",
        pdas: [
          "Diseña y programa prototipos de software o algoritmos complejos que automaticen el análisis de datos de una problemática comunitaria.",
          "Explica los principios del pensamiento sistémico y la inteligencia artificial, debatiendo sobre sus dilemas éticos actuales."
        ]
      },
      {
        contenido: "Espacio para Contenido Personalizado (Escribe aquí tu tema de computación)",
        pdas: [
          "Espacio para PDA Personalizado 1 (Escribe aquí tu indicador)",
          "Espacio para PDA Personalizado 2 (Escribe aquí tu indicador)"
        ]
      }
    ]
  }
};

// Sample prefilled NEM programs to showcase or give fast loading data if teachers just click examples
export const TEMPLADOS_NEM_EJEMPLOS = [
  {
    fase: "Fase 3",
    campoFormativo: "Lenguajes",
    contenido: "Escritura de nombres en la lengua materna.",
    pdas: [
      "Escribe su nombre y lo compara con los nombres de sus compañeros, usa su nombre para indicar la autoría de sus trabajos de clase.",
      "Identifica nombres largos o cortos y nombres que empiezan o terminan con la misma letra."
    ]
  },
  {
    fase: "Fase 4",
    campoFormativo: "Saberes y Pensamiento Científico",
    contenido: "Estructura y funcionamiento del cuerpo humano: sistemas locomotor y digestivo, así como prácticas de su cuidado.",
    pdas: [
      "Describe y representa con modelos el funcionamiento del sistema digestivo, relacionando la ingesta de alimentos con la obtención de nutrientes.",
      "Identifica y describe la participación de la boca, esófago, estómago, intestinos en la digestión."
    ]
  },
  {
    fase: "Fase 5",
    campoFormativo: "Ética, Naturaleza y Sociedades",
    contenido: "Interculturalidad y relación de respeto con la naturaleza, como saberes de los pueblos originarios.",
    pdas: [
      "Analiza la relación de los pueblos originarios con la naturaleza y reconoce la importancia de sus saberes sobre la preservación de los recursos.",
      "Comprende el impacto de las actividades humanas en la biodiversidad y asume un papel activo de cuidado ético ambiental."
    ]
  }
];

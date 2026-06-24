import React, { useState, useEffect } from "react";
import { Planeacion } from "../types";
import { FASES_Y_GRADOS, CAMPOS_FORMATIVOS, EJES_ARTICULADORES, METODOLOGIAS, ESCENARIOS, TEMPLADOS_NEM_EJEMPLOS, IDEAS_PROYECTO, CONTEXTOS_AULA, OFFICIAL_PLANES_Y_PROGRAMAS } from "../data/schoolReference";
import { Sparkles, HelpingHand, Trash2, Book, RefreshCcw, Eye, Info, PenTool, CheckSquare, Laptop, Calendar } from "lucide-react";

export const MATERIAS_DISPONIBLES = [
  "Español / Lengua Materna",
  "Matemáticas",
  "Ciencias Naturales y Tecnología",
  "Historia",
  "Geografía",
  "Formación Cívica y Ética",
  "Artes",
  "Educación Física",
  "Educación Socioemocional / Tutoría",
  "Inglés (Lengua Extranjera)",
  "Computación"
];

interface PlaneacionFormProps {
  onGenerate: (formData: any) => void;
  isLoading: boolean;
  prefillData: Planeacion | null;
}

export default function PlaneacionForm({ onGenerate, isLoading, prefillData }: PlaneacionFormProps) {
  // Main form fields
  const [docente, setDocente] = useState("");
  const [escuela, setEscuela] = useState("");
  const [faseSelected, setFaseSelected] = useState("Fase 4");
  const [gradoSelected, setGradoSelected] = useState("3º de Primaria");
  const [campoSelected, setCampoSelected] = useState("Lenguajes");
  const [metodologia, setMetodologia] = useState("Aprendizaje Basado en Proyectos Comunitarios (ABPC)");
  const [ejesSelected, setEjesSelected] = useState<string[]>(["Pensamiento Crítico"]);
  const [escenario, setEscenario] = useState("Aula");
  const [temporalidad, setTemporalidad] = useState("2 semanas");
  const [tipoPlaneacion, setTipoPlaneacion] = useState<"Proyecto" | "Anual" | "Bimestral" | "Mensual" | "Semanal">("Proyecto");
  const [materias, setMaterias] = useState<string[]>([]);
  const [incluyeComputacion, setIncluyeComputacion] = useState(false);
  const [frecuenciaSemanal, setFrecuenciaSemanal] = useState("");
  const [horasSesion, setHorasSesion] = useState("1 hora");
  const [activeTab, setActiveTab] = useState("generales");

  const handleNextTab = () => {
    const tabOrder = ["generales", "metodologia", "contexto", "articulacion", "contenidos"];
    const currIdx = tabOrder.indexOf(activeTab);
    if (currIdx < tabOrder.length - 1) {
      setActiveTab(tabOrder[currIdx + 1]);
    }
  };

  const handlePrevTab = () => {
    const tabOrder = ["generales", "metodologia", "contexto", "articulacion", "contenidos"];
    const currIdx = tabOrder.indexOf(activeTab);
    if (currIdx > 0) {
      setActiveTab(tabOrder[currIdx - 1]);
    }
  };
  
  // Topic context & description
  const [temaInteres, setTemaInteres] = useState("");
  const [contenido, setContenido] = useState("");
  const [pda, setPda] = useState("");
  const [contextoEscolar, setContextoEscolar] = useState("");
  const [resumen, setResumen] = useState("");

  // Suggest elements helpers
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestedElements, setSuggestedElements] = useState<any | null>(null);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  const handleTipoPlaneacionChange = (type: "Proyecto" | "Anual" | "Bimestral" | "Mensual" | "Semanal") => {
    setTipoPlaneacion(type);
    if (type === "Proyecto") setTemporalidad("2 semanas");
    else if (type === "Anual") setTemporalidad("Ciclo Escolar (10 meses)");
    else if (type === "Bimestral") setTemporalidad("Bimestre (2 meses)");
    else if (type === "Mensual") setTemporalidad("Mes (4 semanas)");
    else if (type === "Semanal") setTemporalidad("Semana (5 días)");
  };

  // Sync Prefill data (e.g. from Library, or duplication)
  useEffect(() => {
    if (prefillData) {
      setDocente(prefillData.docente || "");
      setEscuela(prefillData.escuela || "");
      setFaseSelected(prefillData.fase || "Fase 4");
      setGradoSelected(prefillData.grado || "3º de Primaria");
      setCampoSelected(prefillData.campoFormativo || "Lenguajes");
      setMetodologia(prefillData.metodologia || "Aprendizaje Basado en Proyectos Comunitarios (ABPC)");
      setEjesSelected(prefillData.ejesArticuladores || ["Pensamiento Crítico"]);
      setEscenario(prefillData.escenario || "Aula");
      setTemporalidad(prefillData.temporalidad || "2 semanas");
      setContenido(prefillData.contenido || "");
      setPda(prefillData.pda || "");
      setContextoEscolar(prefillData.contextoEscolar || "");
      setTemaInteres(prefillData.interesesOProblema || prefillData.notasAdicionales || "");
      setResumen(prefillData.resumen || "");
      setTipoPlaneacion(prefillData.tipoPlaneacion || "Proyecto");
      setMaterias(prefillData.materias || []);
      setIncluyeComputacion(!!prefillData.incluyeComputacion);
      setFrecuenciaSemanal(prefillData.frecuenciaSemanal || "");
      setHorasSesion(prefillData.horasSesion || "1 hora");
    }
  }, [prefillData]);

  // When Phase changes, auto-select first matching Grade
  const handleFaseChange = (fase: string) => {
    setFaseSelected(fase);
    const found = FASES_Y_GRADOS.find(item => item.fase === fase);
    if (found && found.grados.length > 0) {
      setGradoSelected(found.grados[0]);
    }
  };

  // Auto-align methodology as recommended for Campo Formativo
  const handleCampoChange = (campo: string) => {
    setCampoSelected(campo);
    const metRecommendation = METODOLOGIAS.find(met => met.campoComun.toLowerCase().trim() === campo.toLowerCase().trim() || campo.toLowerCase().includes(met.campoComun.toLowerCase().trim()));
    if (metRecommendation) {
      setMetodologia(metRecommendation.nombre);
    }
  };

  // Toggle Articulating Axes
  const handleEjeToggle = (ejeNombre: string) => {
    if (ejesSelected.includes(ejeNombre)) {
      setEjesSelected(ejesSelected.filter(e => e !== ejeNombre));
    } else {
      setEjesSelected([...ejesSelected, ejeNombre]);
    }
  };

  // Trigger Gemini API to recommend contents & pda based on Phase / Campo / Theme
  const handleGetAiSuggestions = async () => {
    if (!temaInteres.trim()) {
      alert("Por favor, describe una idea de proyecto, problemática o tema de interés común (ej: 'El reciclaje de botellas' o 'Falta de áreas verdes' o 'Alimentación chatarra') para que la IA proponga contenidos.");
      return;
    }

    setSuggestLoading(true);
    setSuggestError(null);
    setSuggestedElements(null);

    try {
      const response = await fetch("/api/suggest-elements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fase: faseSelected,
          grado: gradoSelected,
          campoFormativo: campoSelected,
          temaInteres: temaInteres
        })
      });

      if (!response.ok) {
        throw new Error("Error interno al obtener propuestas del modelo.");
      }

      const data = await response.json();
      setSuggestedElements(data);
    } catch (err: any) {
      console.error(err);
      setSuggestError("No se pudieron generar sugerencias. Verifica tu conexión de internet o que tu clave de Secrets sea correcta.");
    } finally {
      setSuggestLoading(false);
    }
  };

  // Auto load static templates directly as quick choice
  const handleLoadPrefiledEjemplo = (ej: typeof TEMPLADOS_NEM_EJEMPLOS[0]) => {
    setFaseSelected(ej.fase);
    const found = FASES_Y_GRADOS.find(item => item.fase === ej.fase);
    if (found) setGradoSelected(found.grados[0]);
    setCampoSelected(ej.campoFormativo);
    handleCampoChange(ej.campoFormativo);
    setContenido(ej.contenido);
    setPda(ej.pdas[0]);
  };

  // Submit complete form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim() || !pda.trim()) {
      alert("El Contenido y el PDA son requeridos. Puedes redactarlos tú o usar la IA para proponerlos.");
      return;
    }

    let defaultTitle = "";
    if (tipoPlaneacion === "Proyecto") {
      defaultTitle = "Proyecto: " + (temaInteres || "Planeación de " + campoSelected);
    } else {
      defaultTitle = `Plan ${tipoPlaneacion}: ` + (temaInteres || "Plan de " + campoSelected);
    }

    onGenerate({
      tituloProyecto: defaultTitle,
      resumen: resumen,
      docente,
      escuela,
      fase: faseSelected,
      grado: gradoSelected,
      campoFormativo: campoSelected,
      ejesArticuladores: ejesSelected,
      metodologia,
      escenario,
      temporalidad,
      contenido,
      pda,
      contextoEscolar,
      interesesOProblema: temaInteres,
      tipoPlaneacion,
      frecuenciaSemanal,
      horasSesion,
      materias,
      incluyeComputacion
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left" id="planeacion-creator-form">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Window Chrome Titlebar */}
        <div className="bg-slate-900 text-slate-100 px-4 py-3 flex items-center justify-between font-sans select-none border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block"></span>
            <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block"></span>
            <span className="text-[11px] text-slate-400 font-mono ml-2 border-l border-slate-700 pl-2">programa_planeacion_nem_v2.0</span>
          </div>
          <div className="text-xs font-bold tracking-wide uppercase text-slate-200 bg-slate-800 px-3.5 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-indigo-400" />
            Asistente Escolar de Configuración
          </div>
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </div>
        </div>

        {/* Outer Grid: Left Sidebar for Tabs, Right Main content workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[520px]">
          {/* Tab Navigation Sidebar */}
          <div className="lg:col-span-1 bg-slate-50/50 p-4 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible">
            {[
              { id: "generales", nombre: "1. Datos y Plazo", icon: Book, info: "Docente, escuela y plazo temporal" },
              { id: "metodologia", nombre: "2. Grado y Enfoque", icon: PenTool, info: "Fase, grado, campo y metodología" },
              { id: "contexto", nombre: "3. Aula y Proyecto", icon: HelpingHand, info: "Problemática y diagnóstico del grupo" },
              { id: "articulacion", nombre: "4. Articulación", icon: CheckSquare, info: "Ejes y asignaturas vinculadas" },
              { id: "contenidos", nombre: "5. Contenidos y PDA", icon: Sparkles, info: "Planes oficiales y co-diseño" }
            ].map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex-shrink-0 lg:flex-shrink flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-150"
                      : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  style={{ minWidth: "160px" }}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-100" : "text-slate-500"}`} />
                  <div className="hidden sm:block text-left">
                    <div className="text-xs leading-tight font-bold">{tab.nombre}</div>
                    <div className={`text-[10px] mt-0.5 leading-tight font-medium ${isActive ? "text-indigo-200/90" : "text-slate-400"}`}>
                      {tab.id === "generales" ? `${tipoPlaneacion}` : tab.id === "metodologia" ? `${gradoSelected}` : tab.id === "contenidos" ? (contenido ? "Seleccionado" : "Pendiente") : "Configurar"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tab Work Panel (Right 3 cols) */}
          <div className="lg:col-span-3 p-5 md:p-6 bg-white flex flex-col justify-between">
            <div className="space-y-6">
              {/* TAB 1: GENERALES */}
              {activeTab === "generales" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                      1. Identificación y Plazo Didáctico
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ingresa la información básica institucional y define la temporalidad del planificador de clases de la SEP.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Nombre del Docente</label>
                      <input
                        type="text"
                        value={docente}
                        onChange={(e) => setDocente(e.target.value)}
                        placeholder="Profesor(a)..."
                        className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-250 focus:border-indigo-500 focus:outline-none transition bg-slate-50/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Nombre de la Escuela</label>
                      <input
                        type="text"
                        value={escuela}
                        onChange={(e) => setEscuela(e.target.value)}
                        placeholder="Escuela primaria..."
                        className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-250 focus:border-indigo-500 focus:outline-none transition bg-slate-50/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-xs font-semibold text-slate-650 uppercase">Plazo Temporal de la Planeación (Alcance)</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                      {[
                        { id: "Proyecto", label: "Pr. Didáctico", icon: "🚀", desc: "1-3 semanas" },
                        { id: "Semanal", label: "Semanal", icon: "📋", desc: "Clase por clase" },
                        { id: "Mensual", label: "Mensual", icon: "📆", desc: "Bloques temáticos" },
                        { id: "Bimestral", label: "Bimestral", icon: "🗓️", desc: "Quincenal" },
                        { id: "Anual", label: "Anual", icon: "📅", desc: "Macro-plan" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleTipoPlaneacionChange(item.id as any)}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition gap-1 ${
                            tipoPlaneacion === item.id
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                          }`}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-xs font-bold leading-tight">{item.label}</span>
                          <span className={`text-[9px] mt-0.5 leading-tight ${tipoPlaneacion === item.id ? "text-indigo-100" : "text-slate-400"}`}>
                            {item.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {tipoPlaneacion === "Semanal" && (
                    <div className="bg-amber-50/50 border border-amber-200/80 p-4 rounded-2xl space-y-3.5 animate-fade-in">
                      <div className="flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <label className="block text-xs font-bold text-amber-950 uppercase tracking-wide">Días de Impartición / Frecuencia Semanal</label>
                          <p className="text-[11px] text-amber-800 leading-normal mt-0.5">
                            ¿Esta materia o proyecto solo se imparte algunos días de la semana y no los 5 días de Lunes a Viernes? Escríbelo de forma abierta aquí para que la IA concentre las actividades en esos días.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={frecuenciaSemanal}
                          onChange={(e) => setFrecuenciaSemanal(e.target.value)}
                          placeholder="Ej: Lunes, Miércoles y Viernes, o Solo Martes y Jueves..."
                          className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-amber-250 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 font-medium"
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <span className="text-[10px] text-amber-700 font-semibold self-center mr-1">Opciones Rápidas:</span>
                        {[
                          "Lunes, Miércoles y Viernes",
                          "Martes y Jueves",
                          "Solo Lunes, Miércoles",
                          "Solo los Viernes",
                          "Todos los días (L-V)"
                        ].map((sug) => (
                          <button
                            key={sug}
                            type="button"
                            onClick={() => setFrecuenciaSemanal(sug === "Todos los días (L-V)" ? "" : sug)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border transition font-semibold ${
                              frecuenciaSemanal === sug || (sug === "Todos los días (L-V)" && frecuenciaSemanal === "")
                                ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Presets box */}
                  <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-100 p-4 rounded-xl">
                    <h5 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      ¿Deseas precargar un ejemplo rápido del plan escolar?
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                      Elige uno de los siguientes ejemplos curriculares predefinidos para autocompletar la metodología y contenidos al instante:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      {TEMPLADOS_NEM_EJEMPLOS.map((ej, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            handleLoadPrefiledEjemplo(ej);
                            // Auto transition to tab 2 to make it seamless
                            setActiveTab("metodologia");
                          }}
                          className="text-[11px] bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 transition flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {ej.campoFormativo} • {ej.fase}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: METODOLOGIA */}
              {activeTab === "metodologia" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                      2. Grado, Campo Formativo y Metodología
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Asocia tu planeación al grado correspondiente y elige el campo formativo y metodología socio-crítica oficial.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Fase de Aprendizaje</label>
                      <select
                        value={faseSelected}
                        onChange={(e) => handleFaseChange(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:border-indigo-500 bg-white"
                      >
                        {FASES_Y_GRADOS.map((item) => (
                          <option key={item.fase} value={item.fase}>
                            {item.fase} ({item.nivel})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Grado Escolar</label>
                      <select
                        value={gradoSelected}
                        onChange={(e) => setGradoSelected(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:border-indigo-500 bg-white"
                      >
                        {FASES_Y_GRADOS.find((item) => item.fase === faseSelected)?.grados.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Campo Formativo</label>
                      <select
                        value={campoSelected}
                        onChange={(e) => handleCampoChange(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:border-indigo-500 bg-white"
                      >
                        {CAMPOS_FORMATIVOS.map((c) => (
                          <option key={c.id} value={c.nombre}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Metodología Sugerida</label>
                      <select
                        value={metodologia}
                        onChange={(e) => setMetodologia(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:border-indigo-500 bg-white"
                      >
                        {METODOLOGIAS.map((met) => (
                          <option key={met.abreviatura} value={met.nombre}>
                            {met.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Escenario de Aplicación</label>
                      <select
                        value={escenario}
                        onChange={(e) => setEscenario(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-250 focus:outline-none focus:border-indigo-500 bg-white"
                      >
                        {ESCENARIOS.map((esc) => (
                          <option key={esc} value={esc}>
                            {esc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Temporalidad Estimada</label>
                      <input
                        type="text"
                        value={temporalidad}
                        onChange={(e) => setTemporalidad(e.target.value)}
                        placeholder="Ej: '2 semanas', '3 sesiones', etc."
                        className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-250 focus:border-indigo-500 focus:outline-none transition bg-slate-50/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Horas por Sesión</label>
                      <input
                        type="text"
                        value={horasSesion}
                        onChange={(e) => setHorasSesion(e.target.value)}
                        placeholder="Ej: '1 hora', '50 minutos', '2 horas'..."
                        className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-250 focus:border-indigo-500 focus:outline-none transition bg-slate-50/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CONTEXTO */}
              {activeTab === "contexto" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                      3. Diagnóstico de Aula e Idea de Proyecto
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Describe los intereses o problemas comunes del grupo y su contexto particular para particularizar las sesiones didácticas.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">
                      Idea, Problema Comunitario o Tema de Interés (NEM) <span className="text-red-500">*</span>
                    </label>
                    <div className="mb-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) setTemaInteres(e.target.value);
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value=""
                      >
                        <option value="" disabled>-- Selecciona una sugerencia de ideas para proyectos --</option>
                        {IDEAS_PROYECTO.map((id, index) => (
                          <option key={index} value={id}>{id}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      value={temaInteres}
                      onChange={(e) => setTemaInteres(e.target.value)}
                      placeholder="Ej: 'Cuidado de áreas verdes escolares', 'Falta de cultura de reciclaje', 'Las matemáticas jugando tiendita'..."
                      className="w-full text-sm p-4 rounded-xl border border-slate-250 focus:border-indigo-500 focus:outline-none resize-none bg-slate-50/20"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-650 uppercase mb-1.5">Contexto del Aula / Alumnos (Opcional)</label>
                    <div className="mb-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) setContextoEscolar(e.target.value);
                        }}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        value=""
                      >
                        <option value="" disabled>-- Selecciona un diagnóstico común de grupo --</option>
                        {CONTEXTOS_AULA.map((ctx, index) => (
                          <option key={index} value={ctx}>{ctx}</option>
                        ))}
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      value={contextoEscolar}
                      onChange={(e) => setContextoEscolar(e.target.value)}
                      placeholder="Grupo con 25 estudiantes de diversos ritmos de aprendizaje, requieren actividades lúdicas..."
                      className="w-full text-sm p-4 rounded-xl border border-slate-250 focus:border-indigo-500 focus:outline-none resize-none bg-slate-50/20"
                    ></textarea>
                  </div>

                  {/* Get recommendations button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={suggestLoading}
                      onClick={handleGetAiSuggestions}
                      className="px-5 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer border border-indigo-100"
                    >
                      {suggestLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-indigo-800 border-t-transparent rounded-full animate-spin"></div>
                          Obteniendo propuestas del modelo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                          Sugerir Contenidos y PDA oficiales con IA
                        </>
                      )}
                    </button>
                  </div>

                  {suggestError && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 shrink-0 text-rose-500" />
                      <span>{suggestError}</span>
                    </div>
                  )}

                  {/* Suggested Elements Display inline in Tab 3 */}
                  {suggestedElements && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Propuestas generadas por la IA:
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          Haz clic sobre cualquiera para precargar el Contenido y PDA para la pestaña 5.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Projects */}
                        {suggestedElements.proyectosSugeridos && (
                          <div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase">Títulos Recomendados:</div>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {suggestedElements.proyectosSugeridos.map((p_tit: string, i: number) => (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => setTemaInteres(p_tit)}
                                  className="text-[11px] bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium hover:border-indigo-400"
                                >
                                  {p_tit}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Contents suggested */}
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Contenidos y PDA propuestos:</div>
                          <div className="grid grid-cols-1 gap-2.5">
                            {suggestedElements.contenidosSugeridos?.map((item: any, idx: number) => (
                              <div key={idx} className="bg-white p-3 border border-slate-200 rounded-xl hover:border-indigo-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                                <div className="space-y-1">
                                  <div className="font-bold text-slate-800">{item.contenido}</div>
                                  <div className="text-slate-500 font-medium">PDA: {item.pdas?.join(" / ")}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setContenido(item.contenido);
                                    if (item.pdas && item.pdas.length > 0) {
                                      setPda(item.pdas[0]);
                                    }
                                    // Transition to contents tab
                                    setActiveTab("contenidos");
                                  }}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold transition uppercase tracking-wider self-start sm:self-auto shrink-0"
                                >
                                  Cargar
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ARTICULACION */}
              {activeTab === "articulacion" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                      4. Ejes Articuladores y Asignaturas Vinculadas
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Selecciona los ejes rectores de la NEM y las materias que se integrarán transversalmente en la planeación (¡Puedes incluir Computación!).
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-650 uppercase">Ejes Articuladores de la NEM</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {EJES_ARTICULADORES.map((eje) => {
                        const isSelected = ejesSelected.includes(eje.nombre);
                        return (
                          <button
                            key={eje.id}
                            type="button"
                            onClick={() => handleEjeToggle(eje.nombre)}
                            className={`text-xs px-3.5 py-2.5 rounded-xl border transition-all text-left font-medium ${
                              isSelected 
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs" 
                                : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <CheckSquare className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-400"}`} />
                              {eje.nombre}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-slate-650 uppercase">Asignaturas de Vinculación (Articulación)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {MATERIAS_DISPONIBLES.map((mat) => {
                        const isSelected = materias.includes(mat);
                        return (
                          <button
                            key={mat}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setMaterias(materias.filter((m) => m !== mat));
                                if (mat === "Computación") {
                                  setIncluyeComputacion(false);
                                }
                              } else {
                                setMaterias([...materias, mat]);
                                if (mat === "Computación") {
                                  setIncluyeComputacion(true);
                                }
                              }
                            }}
                            className={`text-xs px-3.5 py-2.5 rounded-xl border transition-all text-left font-medium flex items-center justify-between ${
                              isSelected 
                                ? "bg-indigo-50 border-indigo-400 text-indigo-900 font-semibold" 
                                : "bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-indigo-500 animate-pulse" : "bg-slate-300"}`}></span>
                              {mat}
                            </span>
                            {mat === "Computación" && (
                              <Laptop className="w-3.5 h-3.5 text-indigo-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CONTENIDOS */}
              {activeTab === "contenidos" && (
                <div className="space-y-5 animate-fade-in">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-bold text-slate-800 tracking-wide uppercase flex items-center justify-between">
                      <span>5. Contenidos Curriculares y PDA Seleccionados</span>
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                        {faseSelected} - {campoSelected}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Selecciona un contenido oficial del plan de estudios SEP 2022 o redacta uno personalizado en el área de texto.
                    </p>
                  </div>

                  {(() => {
                    const officialContents = (OFFICIAL_PLANES_Y_PROGRAMAS as any)[faseSelected]?.[campoSelected] || [];
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2.5">
                          <label className="block text-xs font-semibold text-slate-650 uppercase">Contenido del Plan de Estudios</label>
                          
                          {/* Dropdown Content Selector */}
                          <div>
                            <select
                              onChange={(e) => {
                                const selectedContentText = e.target.value;
                                setContenido(selectedContentText);
                                
                                // Auto-set the first PDA for this content to make it seamless
                                const match = officialContents.find((c: any) => c.contenido === selectedContentText);
                                if (match && match.pdas.length > 0) {
                                  setPda(match.pdas[0]);
                                }
                              }}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2"
                              value={officialContents.some((item: any) => item.contenido === contenido) ? contenido : ""}
                            >
                              <option value="" disabled>-- Selecciona un contenido oficial del Plan de Estudios --</option>
                              {officialContents.map((item: any, index: number) => (
                                <option key={index} value={item.contenido}>{item.contenido}</option>
                              ))}
                            </select>
                          </div>

                          <textarea
                            rows={3}
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            placeholder="Escribe el nombre oficial del contenido o edita el texto seleccionado..."
                            className="w-full text-sm p-4 rounded-xl border border-slate-250 focus:border-indigo-500 focus:outline-none resize-none bg-slate-50/20"
                          ></textarea>
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            * Puedes editar el texto libremente para agregar contenidos personales de tu escuela (Co-diseño).
                          </p>
                        </div>

                        <div className="space-y-2.5">
                          <label className="block text-xs font-semibold text-slate-650 uppercase">Proceso de Desarrollo de Aprendizaje (PDA)</label>
                          
                          {/* Dropdown PDA Selector */}
                          {officialContents.some((item: any) => item.contenido === contenido) && (
                            <div>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) setPda(e.target.value);
                                }}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2"
                                value={(() => {
                                  const matched = officialContents.find((c: any) => c.contenido === contenido);
                                  return matched?.pdas.includes(pda) ? pda : "";
                                })()}
                              >
                                <option value="" disabled>-- Selecciona un PDA oficial correspondiente --</option>
                                {(() => {
                                  const matched = officialContents.find((c: any) => c.contenido === contenido);
                                  return matched?.pdas.map((p: string, index: number) => (
                                    <option key={index} value={p}>{p}</option>
                                  )) || null;
                                })()}
                              </select>
                            </div>
                          )}

                          <textarea
                            rows={3}
                            value={pda}
                            onChange={(e) => setPda(e.target.value)}
                            placeholder="Escribe los PDA correspondientes o edita el texto seleccionado..."
                            className="w-full text-sm p-4 rounded-xl border border-slate-250 focus:border-indigo-500 focus:outline-none resize-none bg-slate-50/20"
                          ></textarea>
                          <p className="text-[10px] text-slate-400 italic mt-0.5">
                            * Puedes editar los PDAs de forma libre para personalizarlos con las metas de tus estudiantes.
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Footer Workspace Controls */}
            <div className="border-t border-slate-100 pt-4 mt-6 flex items-center justify-between">
              <button
                type="button"
                disabled={activeTab === "generales"}
                onClick={handlePrevTab}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-45 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-2">
                {activeTab !== "contenidos" ? (
                  <button
                    type="button"
                    onClick={handleNextTab}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    Siguiente →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:from-indigo-400 disabled:to-indigo-400 cursor-pointer shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Estructurando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                        Generar Planeación con IA
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 text-center font-medium mt-1">
        * El asistente del programa guiará la articulación del Plan Analítico con la secuencia didáctica final.
      </p>
    </form>
  );
}

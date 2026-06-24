import { useState, useRef, useEffect, Fragment } from "react";
import { Planeacion, FaseMomento, Session } from "../types";
import { db, collection, addDoc, updateDoc, doc, serverTimestamp } from "../lib/firebase";
import { Printer, Save, Copy, ChevronDown, ChevronUp, Share2, CornerUpLeft, Plus, Trash, Sparkles, FileText, Download, AlertCircle, ExternalLink } from "lucide-react";

interface PlaneacionViewerProps {
  plan: Planeacion;
  onBack: () => void;
  onSaveSuccess: (updatedPlan: Planeacion) => void;
}

export default function PlaneacionViewer({ plan: initialPlan, onBack, onSaveSuccess }: PlaneacionViewerProps) {
  const [plan, setPlan] = useState<Planeacion>(initialPlan);
  const [viewStyle, setViewStyle] = useState<"cinzel" | "editor">("cinzel");
  const [activeTab, setActiveTab] = useState<"general" | "secuencia" | "evaluacion" | "inclusión">("general");
  const [selectedSessionMap, setSelectedSessionMap] = useState<Record<number, number>>({});
  const [viewMode, setViewMode] = useState<"ventanas" | "lista">("ventanas");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }
  }, []);

  // Auto-resizing textarea for fluid on-screen document editing
  const AutoResizeTextarea = ({
    value,
    onChange,
    className = "",
    placeholder = "",
    rows = 1
  }: {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    rows?: number;
  }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value]);

    return (
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full resize-none overflow-hidden bg-transparent border-none p-1 focus:bg-slate-50 focus:outline-none focus:ring-0 rounded transition ${className}`}
      />
    );
  };

  // Helper to render text paragraphs with bold prefix matching the user's PDF layout
  const renderParagraphWithBoldPrefix = (text: string) => {
    const prefixes = ["Objetivo específico:", "Técnica:", "Actividad 1:", "Actividad 2:", "Actividad 3:", "Inclusión:", "Pensamiento crítico:", "Interculturalidad crítica:", "Fomento a la lectura:"];
    for (const prefix of prefixes) {
      if (text.startsWith(prefix)) {
        return (
          <p className="text-[13px] md:text-[14px] text-slate-800 leading-relaxed mb-3">
            <strong>{prefix}</strong>{text.substring(prefix.length)}
          </p>
        );
      }
    }
    return (
      <p className="text-[13px] md:text-[14px] text-slate-800 leading-relaxed mb-3">
        {text}
      </p>
    );
  };

  // Helper to generate dynamic transversal integration sentences aligned with NEM
  const getTransversalIntegrationDesc = (eje: string, sessionNum: number, tema: string) => {
    const normalized = eje.toLowerCase();
    if (normalized.includes("inclusión")) {
      return `Se fomenta la participación equitativa de todos los alumnos en la sesión #${sessionNum}, adaptando la dinámica escolar sobre "${tema}" para asegurar un ambiente libre de exclusión y de barreras de aprendizaje.`;
    }
    if (normalized.includes("pensamiento")) {
      return `Se estimula la reflexión y la capacidad analítica en la sesión #${sessionNum}, formulando cuestionamientos y retos con el tema "${tema}" que movilizan el razonamiento autónomo.`;
    }
    if (normalized.includes("interculturalidad")) {
      return `Se vincula el desarrollo de "${tema}" con los diversos saberes, contextos sociales y realidades de la sesión #${sessionNum}, valorando el diálogo respetuoso y la interculturalidad.`;
    }
    if (normalized.includes("fomento") || normalized.includes("lectura") || normalized.includes("escritura")) {
      return `Se incentiva la apropiación de la lectura y escritura mediante la revisión de instrucciones, glosarios y el registro de bitácoras del alumno en torno a "${tema}" en esta sesión #${sessionNum}.`;
    }
    if (normalized.includes("vida saludable")) {
      return `Se promueven posturas ergonómicas, pausas activas y un ambiente de cuidado recíproco durante la sesión #${sessionNum} al trabajar en la planeación de "${tema}".`;
    }
    if (normalized.includes("artes") || normalized.includes("experiencias estéticas")) {
      return `Se promueve el sentido creativo y la apreciación estética en la sesión #${sessionNum} mediante representaciones visuales o producciones artísticas relacionadas con "${tema}".`;
    }
    if (normalized.includes("género") || normalized.includes("igualdad")) {
      return `Se garantiza una distribución equitativa de tareas y liderazgo cooperativo entre alumnas y alumnos durante los trabajos de la sesión #${sessionNum} centrados en "${tema}".`;
    }
    return `Se integra activamente este eje transversal con los procesos didácticos de la sesión #${sessionNum} enfocada en "${tema}".`;
  };

  // Helper to determine if a session is active (e.g. for weekly planning, check if any days are selected)
  const isSessionActive = (session: any) => {
    if (plan.tipoPlaneacion === "Semanal") {
      return !session.diasSelected || session.diasSelected.length > 0;
    }
    return true;
  };

  // Renders the lesson plan as a gorgeous, unified continuous document (Cinzel format)
  const renderCinzelSheet = (isPrintOnly: boolean) => {
    const totalSesiones = plan.secuenciaDidactica?.reduce((acc, f) => {
      const activeSesiones = f.sesiones?.filter(isSessionActive) || [];
      return acc + activeSesiones.length;
    }, 0) || 0;

    return (
      <div className={`space-y-6 text-black ${isPrintOnly ? "p-0 bg-white" : "p-1"}`} id="pdf-printable-container">
        
        {/* HEADER: Institutional Header Table */}
        <div className="border-2 border-slate-950 text-[11px] md:text-xs text-slate-900 font-sans tracking-wide leading-normal bg-white" id="pdf-header-table">
          <div className="grid grid-cols-1 divide-y divide-slate-950">
            {/* Row 1: Escuela / Institución */}
            <div className="p-3 text-center font-black text-sm uppercase tracking-wider bg-slate-50/50">
              {isPrintOnly ? (
                <span>{plan.escuela || "INSTITUTO GESTALT PRIMARIA"}</span>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-extrabold text-xs text-slate-400 select-none uppercase">[Escuela]:</span>
                  <input
                    type="text"
                    value={plan.escuela || ""}
                    onChange={(e) => handleFieldChange("escuela", e.target.value)}
                    className="w-1/2 text-center bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-black text-sm uppercase text-slate-900"
                    placeholder="NOMBRE DEL INSTITUTO / ESCUELA..."
                  />
                </div>
              )}
            </div>

            {/* Row 2: Título de Planeación */}
            <div className="p-2.5 text-center font-black uppercase bg-slate-50/20 text-xs md:text-sm">
              {isPrintOnly ? (
                <span>{plan.tituloProyecto ? `PLANEACIÓN: ${plan.tituloProyecto}` : "PLANEACIÓN DE CLASE"}</span>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-extrabold text-xs text-slate-400 select-none uppercase">[Proyecto/Tema]:</span>
                  <input
                    type="text"
                    value={plan.tituloProyecto || ""}
                    onChange={(e) => handleFieldChange("tituloProyecto", e.target.value)}
                    className="w-1/2 text-center bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-black uppercase text-slate-900"
                    placeholder="PLANEACIÓN SEMANA / TEMA..."
                  />
                </div>
              )}
            </div>

            {/* Row 3: MES, CICLO, PERIODO */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-950">
              <div className="p-2.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 shrink-0 uppercase">MES:</span>
                {isPrintOnly ? (
                  <span className="font-semibold">{plan.mes || "JUNIO"}</span>
                ) : (
                  <input
                    type="text"
                    value={plan.mes || ""}
                    onChange={(e) => handleFieldChange("mes", e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold px-1 py-0.5"
                    placeholder="Escriba el mes..."
                  />
                )}
              </div>
              <div className="p-2.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 shrink-0 uppercase">CICLO:</span>
                {isPrintOnly ? (
                  <span className="font-semibold">{plan.ciclo || "2025-2026"}</span>
                ) : (
                  <input
                    type="text"
                    value={plan.ciclo || ""}
                    onChange={(e) => handleFieldChange("ciclo", e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold px-1 py-0.5"
                    placeholder="Escriba el ciclo..."
                  />
                )}
              </div>
              <div className="p-2.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 shrink-0 uppercase">PERIODO:</span>
                {isPrintOnly ? (
                  <span className="font-semibold">{plan.periodo || "6o BIMESTRE"}</span>
                ) : (
                  <input
                    type="text"
                    value={plan.periodo || ""}
                    onChange={(e) => handleFieldChange("periodo", e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold px-1 py-0.5"
                    placeholder="Escriba el periodo..."
                  />
                )}
              </div>
            </div>

            {/* Row 4: FASE, GRADO/GRUPO, DISCIPLINA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-950">
              <div className="p-2.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 shrink-0 uppercase">FASE:</span>
                {isPrintOnly ? (
                  <span className="font-semibold uppercase">{plan.fase || "PRIMARIA"}</span>
                ) : (
                  <input
                    type="text"
                    value={plan.fase || ""}
                    onChange={(e) => handleFieldChange("fase", e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold px-1 py-0.5 uppercase"
                    placeholder="Escriba la fase..."
                  />
                )}
              </div>
              <div className="p-2.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 shrink-0 uppercase">GRADO / GRUPO:</span>
                {isPrintOnly ? (
                  <span className="font-semibold">{plan.grado || "1°"} {plan.grupo ? ` / ${plan.grupo}` : ""}</span>
                ) : (
                  <div className="flex gap-1 items-center w-full">
                    <input
                      type="text"
                      value={plan.grado || ""}
                      onChange={(e) => handleFieldChange("grado", e.target.value)}
                      className="w-12 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold text-center px-1 py-0.5"
                      placeholder="Grado..."
                    />
                    <span>/</span>
                    <input
                      type="text"
                      value={plan.grupo || ""}
                      onChange={(e) => handleFieldChange("grupo", e.target.value)}
                      className="w-16 bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold px-1 py-0.5"
                      placeholder="Grupo..."
                    />
                  </div>
                )}
              </div>
              <div className="p-2.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 shrink-0 uppercase">DISCIPLINA:</span>
                {isPrintOnly ? (
                  <span className="font-semibold uppercase">{plan.disciplina || plan.campoFormativo || "COMPUTACIÓN"}</span>
                ) : (
                  <input
                    type="text"
                    value={plan.disciplina || ""}
                    onChange={(e) => handleFieldChange("disciplina", e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold px-1 py-0.5 uppercase"
                    placeholder="Escriba la disciplina..."
                  />
                )}
              </div>
            </div>

            {/* Row 5: CAMPO FORMATIVO, DURACIÓN DE CLASE */}
            <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-950">
              <div className="sm:col-span-3 p-2.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 shrink-0 uppercase">CAMPO FORMATIVO:</span>
                {isPrintOnly ? (
                  <span className="font-semibold uppercase">{plan.campoFormativo || "SABERES Y PENSAMIENTO CIENTÍFICO"}</span>
                ) : (
                  <input
                    type="text"
                    value={plan.campoFormativo || ""}
                    onChange={(e) => handleFieldChange("campoFormativo", e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold px-1 py-0.5 uppercase"
                    placeholder="Escriba el campo formativo..."
                  />
                )}
              </div>
              <div className="p-2.5 flex items-center gap-1.5">
                <span className="font-extrabold text-slate-950 shrink-0 uppercase">DURACIÓN CLASE:</span>
                {isPrintOnly ? (
                  <span className="font-semibold">{plan.horasSesion || "40 MIN"}</span>
                ) : (
                  <input
                    type="text"
                    value={plan.horasSesion || ""}
                    onChange={(e) => handleFieldChange("horasSesion", e.target.value)}
                    className="w-full bg-transparent border-b border-dashed border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 font-semibold px-1 py-0.5"
                    placeholder="ej. 40 MIN..."
                  />
                )}
              </div>
            </div>

            {/* Row 6: EJES ARTICULADORES */}
            <div className="p-2.5 flex items-start gap-1.5">
              <span className="font-extrabold text-slate-950 shrink-0 uppercase">EJES ARTICULADORES:</span>
              <span className="font-semibold uppercase">
                {plan.ejesArticuladores && plan.ejesArticuladores.length > 0 
                  ? plan.ejesArticuladores.join(", ") 
                  : "TECNICA Y TECNOLOGIA"}
              </span>
            </div>
          </div>
        </div>

        {/* SECUENCIA DIDÁCTICA: PDF Style Layout Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-slate-950 border-collapse table-fixed text-xs text-slate-900 leading-normal font-sans" id="pdf-secuencia-table">
            <thead>
              <tr className="bg-slate-100/80 border-b-2 border-slate-950 uppercase font-black text-center tracking-wider divide-x divide-slate-950">
                <th className="p-3 w-[15%] text-center font-black">Sesión</th>
                <th className="p-3 w-[51%] text-left font-black">Secuencia Didáctica</th>
                <th className="p-3 w-[17%] text-left font-black">Material de Apoyo</th>
                <th className="p-3 w-[17%] text-left font-black">Evaluación Formativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-950">
              {plan.secuenciaDidactica?.map((fase, fIdx) => (
                <Fragment key={fIdx}>
                  {fase.sesiones?.filter(isSessionActive).map((session, sIdx) => {
                    const blockLabel = `SESIÓN ${session.numero}`;
                    
                    return (
                      <tr key={sIdx} className="divide-x divide-slate-950 align-top">
                        {/* Column 1: Sesión Label */}
                        <td className="p-3 text-center font-black text-xs uppercase bg-slate-50/10 whitespace-nowrap">
                          {blockLabel}
                          <div className="text-[10px] text-slate-500 font-bold mt-1">({session.duracion || plan.horasSesion || "40 min"})</div>
                        </td>

                        {/* Column 2: Secuencia Didáctica */}
                        <td className="p-4 space-y-4 text-justify">
                          {/* Methodology/Active learning indicator */}
                          <p className="text-[11px] text-slate-600 italic leading-relaxed">
                            Se trabajará en base de la metodología del aprendizaje {plan.metodologia || "colaborativo y activo"}.
                          </p>

                          {/* Session Title/Objective */}
                          <div className="text-[11px] border-b border-slate-200 pb-1.5">
                            <span className="font-extrabold text-slate-950 uppercase block mb-0.5">Tema de la sesión:</span>
                            {isPrintOnly ? (
                              <span className="font-medium text-slate-800">{session.titulo || "Tema sin asignar"}</span>
                            ) : (
                              <input
                                type="text"
                                value={session.titulo || ""}
                                onChange={(e) => handleSessionTitleChange(fIdx, sIdx, e.target.value)}
                                className="w-full bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 focus:outline-none focus:ring-0 py-0.5 text-[11px] font-medium"
                                placeholder="Título de la sesión..."
                              />
                            )}
                          </div>

                          {/* INICIO */}
                          {((session.actividades?.inicio && session.actividades.inicio.length > 0) || !isPrintOnly) && (
                            <div className="space-y-1.5">
                              <h5 className="text-[11.5px] font-black text-slate-950 uppercase tracking-wide">
                                INICIO
                              </h5>
                              <div className="space-y-1 text-[11px] pl-1">
                                {session.actividades?.inicio?.map((act, actIdx) => (
                                  <div key={actIdx} className="group flex gap-2 items-start relative">
                                    {isPrintOnly ? (
                                      <div className="w-full">
                                        {renderParagraphWithBoldPrefix(act)}
                                      </div>
                                    ) : (
                                      <div className="w-full flex items-start gap-1">
                                        <textarea
                                          value={act}
                                          onChange={(e) => handleSessionActivityChange(fIdx, sIdx, "inicio", actIdx, e.target.value)}
                                          className="w-full text-[11px] p-0.5 border-none focus:outline-none focus:ring-0 bg-transparent resize-none leading-relaxed text-slate-700 font-medium hover:bg-slate-50 focus:bg-slate-100 rounded"
                                          rows={Math.max(1, Math.ceil(act.length / 85))}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeActivity(fIdx, sIdx, "inicio", actIdx)}
                                          className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-700 p-0.5 mt-0.5 transition non-printable shrink-0"
                                          title="Eliminar paso de apertura"
                                        >
                                          <Trash className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {!isPrintOnly && (
                                  <button
                                    type="button"
                                    onClick={() => addActivity(fIdx, sIdx, "inicio")}
                                    className="text-[9px] text-indigo-600 hover:text-indigo-800 font-extrabold mt-1 uppercase tracking-wider flex items-center gap-1 non-printable cursor-pointer"
                                  >
                                    + Añadir Paso a Apertura
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Pregunta meta cognitiva */}
                          <div className="bg-amber-50/40 p-2.5 border border-dashed border-amber-200 rounded-lg text-[10.5px] leading-relaxed">
                            <span className="font-extrabold text-amber-900 block mb-1 uppercase tracking-wider">Pregunta meta cognitiva:</span>
                            {isPrintOnly ? (
                              <p className="text-slate-800 italic">{session.preguntaMetacognitiva || "¿Qué cosas interesantes creen que podemos hacer con este tema?"}</p>
                            ) : (
                              <textarea
                                value={session.preguntaMetacognitiva || ""}
                                onChange={(e) => handleSessionPreguntaChange(fIdx, sIdx, e.target.value)}
                                className="w-full text-xs p-1.5 mt-1 bg-white border border-slate-200 rounded focus:ring-0 focus:outline-none focus:border-amber-400 italic"
                                rows={2}
                                placeholder="ej. ¿Qué cosas interesantes podemos hacer con este objeto?"
                              />
                            )}
                          </div>

                          {/* DESARROLLO */}
                          {((session.actividades?.desarrollo && session.actividades.desarrollo.length > 0) || !isPrintOnly) && (
                            <div className="space-y-1.5">
                              <h5 className="text-[11.5px] font-black text-slate-950 uppercase tracking-wide">
                                DESARROLLO
                              </h5>
                              <div className="space-y-1 text-[11px] pl-1">
                                {session.actividades?.desarrollo?.map((act, actIdx) => (
                                  <div key={actIdx} className="group flex gap-2 items-start relative">
                                    {isPrintOnly ? (
                                      <div className="w-full">
                                        {renderParagraphWithBoldPrefix(act)}
                                      </div>
                                    ) : (
                                      <div className="w-full flex items-start gap-1">
                                        <textarea
                                          value={act}
                                          onChange={(e) => handleSessionActivityChange(fIdx, sIdx, "desarrollo", actIdx, e.target.value)}
                                          className="w-full text-[11px] p-0.5 border-none focus:outline-none focus:ring-0 bg-transparent resize-none leading-relaxed text-slate-700 font-medium hover:bg-slate-50 focus:bg-slate-100 rounded"
                                          rows={Math.max(1, Math.ceil(act.length / 85))}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeActivity(fIdx, sIdx, "desarrollo", actIdx)}
                                          className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-700 p-0.5 mt-0.5 transition non-printable shrink-0"
                                          title="Eliminar paso de desarrollo"
                                        >
                                          <Trash className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {!isPrintOnly && (
                                  <button
                                    type="button"
                                    onClick={() => addActivity(fIdx, sIdx, "desarrollo")}
                                    className="text-[9px] text-indigo-600 hover:text-indigo-800 font-extrabold mt-1 uppercase tracking-wider flex items-center gap-1 non-printable cursor-pointer"
                                  >
                                    + Añadir Paso a Desarrollo
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* CIERRE */}
                          {((session.actividades?.cierre && session.actividades.cierre.length > 0) || !isPrintOnly) && (
                            <div className="space-y-1.5">
                              <h5 className="text-[11.5px] font-black text-slate-950 uppercase tracking-wide">
                                CIERRE
                              </h5>
                              <div className="space-y-1 text-[11px] pl-1">
                                {session.actividades?.cierre?.map((act, actIdx) => (
                                  <div key={actIdx} className="group flex gap-2 items-start relative">
                                    {isPrintOnly ? (
                                      <div className="w-full">
                                        {renderParagraphWithBoldPrefix(act)}
                                      </div>
                                    ) : (
                                      <div className="w-full flex items-start gap-1">
                                        <textarea
                                          value={act}
                                          onChange={(e) => handleSessionActivityChange(fIdx, sIdx, "cierre", actIdx, e.target.value)}
                                          className="w-full text-[11px] p-0.5 border-none focus:outline-none focus:ring-0 bg-transparent resize-none leading-relaxed text-slate-700 font-medium hover:bg-slate-50 focus:bg-slate-100 rounded"
                                          rows={Math.max(1, Math.ceil(act.length / 85))}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => removeActivity(fIdx, sIdx, "cierre", actIdx)}
                                          className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-700 p-0.5 mt-0.5 transition non-printable shrink-0"
                                          title="Eliminar paso de cierre"
                                        >
                                          <Trash className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {!isPrintOnly && (
                                  <button
                                    type="button"
                                    onClick={() => addActivity(fIdx, sIdx, "cierre")}
                                    className="text-[9px] text-indigo-600 hover:text-indigo-800 font-extrabold mt-1 uppercase tracking-wider flex items-center gap-1 non-printable cursor-pointer"
                                  >
                                    + Añadir Paso a Cierre
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Column 3: Material de Apoyo */}
                        <td className="p-4 align-top">
                          {isPrintOnly ? (
                            <ul className="space-y-1 text-[11px] text-slate-800 list-disc pl-3">
                              {session.materiales && session.materiales.length > 0 ? (
                                session.materiales.map((mat, mIdx) => <li key={mIdx}>{mat}</li>)
                              ) : (
                                <span className="text-slate-400 italic">Ninguno especificado</span>
                              )}
                            </ul>
                          ) : (
                            <textarea
                              value={session.materiales ? session.materiales.join("\n") : ""}
                              onChange={(e) => handleSessionMaterialesTextareaChange(fIdx, sIdx, e.target.value)}
                              className="w-full h-full min-h-[160px] text-[11px] p-1.5 bg-white border border-slate-200 rounded focus:ring-0 focus:outline-none"
                              placeholder="Un material de apoyo por línea (ej. Cuaderno de trabajo, Marcadores, PC)..."
                            />
                          )}
                        </td>

                        {/* Column 4: Evaluación Formativa */}
                        <td className="p-4 align-top">
                          {isPrintOnly ? (
                            <div className="text-[11px] text-slate-800 uppercase font-bold text-center sm:text-left">
                              {session.evaluacion || "CUESTIONARIO"}
                            </div>
                          ) : (
                            <textarea
                              value={session.evaluacion || ""}
                              onChange={(e) => handleSessionEvaluacionChange(fIdx, sIdx, e.target.value)}
                              className="w-full h-full min-h-[160px] text-[11px] p-1.5 bg-white border border-slate-200 rounded focus:ring-0 focus:outline-none uppercase font-bold"
                              placeholder="ej. CUESTIONARIO, RÚBRICA, LISTA DE COTEJO..."
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}

              {/* Row: ACTIVIDADES COMPLEMENTARIAS */}
              <tr className="divide-x divide-slate-950 align-top">
                <td className="p-3 text-center align-middle font-black text-[10px] uppercase bg-slate-50/30">
                  Actividades Complementarias
                </td>
                <td colSpan={3} className="p-4 text-[11px]">
                  {isPrintOnly ? (
                    <p className="text-slate-800 whitespace-pre-wrap">{plan.actividadesComplementarias || "- Casos de uso adicionales y aplicaciones de repaso."}</p>
                  ) : (
                    <textarea
                      value={plan.actividadesComplementarias || ""}
                      onChange={(e) => handleFieldChange("actividadesComplementarias", e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-0 focus:outline-none"
                      rows={3}
                      placeholder="Describa las actividades complementarias recomendadas..."
                    />
                  )}
                </td>
              </tr>

              {/* Row: INSTRUMENTOS DE EVALUACIÓN */}
              <tr className="divide-x divide-slate-950 align-top">
                <td className="p-3 text-center align-middle font-black text-[10px] uppercase bg-slate-50/30">
                  Instrumentos de Evaluación
                </td>
                <td colSpan={3} className="p-4 text-[11px]">
                  {isPrintOnly ? (
                    <ul className="list-disc pl-4 space-y-1">
                      {plan.evaluacionFormativa?.instrumentos && plan.evaluacionFormativa.instrumentos.length > 0 ? (
                        plan.evaluacionFormativa.instrumentos.map((ins, iIdx) => <li key={iIdx}>{ins}</li>)
                      ) : (
                        <li>- Cuestionario</li>
                      )}
                    </ul>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] text-slate-500 italic">Configura los instrumentos globales separados por comas:</p>
                      <input
                        type="text"
                        value={plan.evaluacionFormativa?.instrumentos ? plan.evaluacionFormativa.instrumentos.join(", ") : ""}
                        onChange={(e) => handleFieldChange("evaluacionFormativa", {
                          ...plan.evaluacionFormativa,
                          instrumentos: e.target.value.split(",").map(i => i.trim()).filter(i => i.length > 0)
                        })}
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-0 focus:outline-none"
                        placeholder="ej. Cuestionario, Rúbrica, Lista de cotejo"
                      />
                    </div>
                  )}
                </td>
              </tr>

              {/* Row: OBSERVACIONES */}
              <tr className="divide-x divide-slate-950 align-top">
                <td className="p-3 text-center align-middle font-black text-[10px] uppercase bg-slate-50/30">
                  Observaciones
                </td>
                <td colSpan={3} className="p-4 text-[11px]">
                  {isPrintOnly ? (
                    <p className="text-slate-800 whitespace-pre-wrap">{plan.notasAdicionales || "Sin observaciones específicas."}</p>
                  ) : (
                    <textarea
                      value={plan.notasAdicionales || ""}
                      onChange={(e) => handleFieldChange("notasAdicionales", e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded focus:ring-0 focus:outline-none"
                      rows={3}
                      placeholder="Escriba las observaciones del docente o directivo..."
                    />
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PRINT SIGNATURE BLOCK */}
        <div className="border-t border-slate-400 pt-10 mt-12 grid grid-cols-2 gap-10 text-center select-none">
          <div className="space-y-1">
            <div className="w-1/2 border-b border-slate-900 mx-auto h-12" />
            <div className="text-[10px] font-bold text-slate-950 uppercase">PROFESOR(A) GRUPAL</div>
            <div className="text-[9px] text-slate-500">FIRMA DEL DOCENTE: <span className="font-semibold text-slate-900 uppercase">{plan.docente || "Docente"}</span></div>
          </div>
          <div className="space-y-1">
            <div className="w-1/2 border-b border-slate-900 mx-auto h-12" />
            <div className="text-[10px] font-bold text-slate-950 uppercase">DIRECCIÓN ESCOLAR</div>
            <div className="text-[9px] text-slate-500">NOMBRE, FIRMA Y SELLO: <span className="font-semibold text-slate-900 uppercase">{plan.escuela || "Dirección de la Escuela"}</span></div>
          </div>
        </div>

      </div>
    );
  };

  // Sync state if initialPlan changes
  useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  // Handle direct text updates for general fields
  const handleFieldChange = (field: keyof Planeacion, value: any) => {
    setPlan((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle updates inside secuencia didáctica
  const handleFaseChange = (faseIdx: number, value: string) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      updatedSecuencia[faseIdx] = {
        ...updatedSecuencia[faseIdx],
        nombre: value
      };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  const handleFaseDescChange = (faseIdx: number, value: string) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      updatedSecuencia[faseIdx] = {
        ...updatedSecuencia[faseIdx],
        descripcion: value
      };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  const handleSessionActivityChange = (faseIdx: number, sIdx: number, momentKey: "inicio" | "desarrollo" | "cierre", actIdx: number, value: string) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      const updatedSessions = [...updatedSecuencia[faseIdx].sesiones];
      const updatedActivities = { ...updatedSessions[sIdx].actividades };
      const updatedList = [...updatedActivities[momentKey]];
      updatedList[actIdx] = value;
      
      updatedActivities[momentKey] = updatedList;
      updatedSessions[sIdx] = {
        ...updatedSessions[sIdx],
        actividades: updatedActivities
      };
      updatedSecuencia[faseIdx] = {
        ...updatedSecuencia[faseIdx],
        sesiones: updatedSessions
      };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  const handleSessionMaterialChange = (faseIdx: number, sIdx: number, matIdx: number, value: string) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      const updatedSessions = [...updatedSecuencia[faseIdx].sesiones];
      const updatedMaterials = [...updatedSessions[sIdx].materiales];
      updatedMaterials[matIdx] = value;
      
      updatedSessions[sIdx] = {
        ...updatedSessions[sIdx],
        materiales: updatedMaterials
      };
      updatedSecuencia[faseIdx] = {
        ...updatedSecuencia[faseIdx],
        sesiones: updatedSessions
      };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  const handleSessionTitleChange = (faseIdx: number, sIdx: number, value: string) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      const updatedSessions = [...updatedSecuencia[faseIdx].sesiones];
      updatedSessions[sIdx] = {
        ...updatedSessions[sIdx],
        titulo: value
      };
      updatedSecuencia[faseIdx] = {
        ...updatedSecuencia[faseIdx],
        sesiones: updatedSessions
      };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  const handleSessionPreguntaChange = (faseIdx: number, sIdx: number, value: string) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      const updatedSessions = [...updatedSecuencia[faseIdx].sesiones];
      updatedSessions[sIdx] = {
        ...updatedSessions[sIdx],
        preguntaMetacognitiva: value
      };
      updatedSecuencia[faseIdx] = {
        ...updatedSecuencia[faseIdx],
        sesiones: updatedSessions
      };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  const handleSessionEvaluacionChange = (faseIdx: number, sIdx: number, value: string) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      const updatedSessions = [...updatedSecuencia[faseIdx].sesiones];
      updatedSessions[sIdx] = {
        ...updatedSessions[sIdx],
        evaluacion: value
      };
      updatedSecuencia[faseIdx] = {
        ...updatedSecuencia[faseIdx],
        sesiones: updatedSessions
      };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  const handleSessionMaterialesTextareaChange = (faseIdx: number, sIdx: number, value: string) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      const updatedSessions = [...updatedSecuencia[faseIdx].sesiones];
      updatedSessions[sIdx] = {
        ...updatedSessions[sIdx],
        materiales: value.split("\n").filter(m => m.trim().length > 0)
      };
      updatedSecuencia[faseIdx] = {
        ...updatedSecuencia[faseIdx],
        sesiones: updatedSessions
      };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  // Add/Remove activities helper
  const addActivity = (faseIdx: number, sIdx: number, momentKey: "inicio" | "desarrollo" | "cierre") => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      const updatedSessions = [...updatedSecuencia[faseIdx].sesiones];
      const updatedActivities = { ...updatedSessions[sIdx].actividades };
      updatedActivities[momentKey] = [...updatedActivities[momentKey], "Siguiente paso de la actividad..."];
      
      updatedSessions[sIdx] = { ...updatedSessions[sIdx], actividades: updatedActivities };
      updatedSecuencia[faseIdx] = { ...updatedSecuencia[faseIdx], sesiones: updatedSessions };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  const removeActivity = (faseIdx: number, sIdx: number, momentKey: "inicio" | "desarrollo" | "cierre", actIdx: number) => {
    setPlan((prev) => {
      const updatedSecuencia = [...prev.secuenciaDidactica];
      const updatedSessions = [...updatedSecuencia[faseIdx].sesiones];
      const updatedActivities = { ...updatedSessions[sIdx].actividades };
      const updatedList = [...updatedActivities[momentKey]];
      updatedList.splice(actIdx, 1);
      
      updatedActivities[momentKey] = updatedList;
      updatedSessions[sIdx] = { ...updatedSessions[sIdx], actividades: updatedActivities };
      updatedSecuencia[faseIdx] = { ...updatedSecuencia[faseIdx], sesiones: updatedSessions };
      return { ...prev, secuenciaDidactica: updatedSecuencia };
    });
  };

  // Support saving changes to Firestore database
  const handleSaveToCloudAndLocal = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      let finalId = plan.id;
      
      // Save/overwrite in cloud Firestore
      if (finalId) {
        // Update existing document
        const planRef = doc(db, "planeaciones", finalId);
        await updateDoc(planRef, {
          ...plan,
          updatedAt: serverTimestamp()
        } as any);
      } else {
        // Create new document in cloud Firestore
        const docRef = await addDoc(collection(db, "planeaciones"), {
          ...plan,
          createdAt: serverTimestamp()
        });
        finalId = docRef.id;
      }

      // Update state
      const updatedWithId: Planeacion = {
        ...plan,
        id: finalId,
        createdAt: plan.createdAt || new Date()
      };
      setPlan(updatedWithId);

      // Save to local storage for instant cache/offline persistence
      let cachedPlans: Planeacion[] = [];
      try {
        const cacheStr = localStorage.getItem("nem_planeaciones");
        if (cacheStr) {
          cachedPlans = JSON.parse(cacheStr);
        }
      } catch (e) {
        console.error("Failed parsing local cache", e);
      }

      const existingIdx = cachedPlans.findIndex(p => p.id === finalId);
      if (existingIdx !== -1) {
        cachedPlans[existingIdx] = updatedWithId;
      } else {
        cachedPlans.unshift(updatedWithId);
      }
      localStorage.setItem("nem_planeaciones", JSON.stringify(cachedPlans));

      setSaveMessage("Planeación guardada con éxito en la Nube y Memoria Local.");
      onSaveSuccess(updatedWithId);
    } catch (err: any) {
      console.error(err);
      // Fallback save to Local Storage if Firestore offline
      const updatedLocal: Planeacion = { ...plan, createdAt: plan.createdAt || new Date() };
      let cachedPlans: Planeacion[] = [];
      try {
        const cacheStr = localStorage.getItem("nem_planeaciones");
        if (cacheStr) {
          cachedPlans = JSON.parse(cacheStr);
        }
      } catch (e) {
        console.error("Failed parsing local cache in fallback", e);
      }
      cachedPlans.unshift(updatedLocal);
      localStorage.setItem("nem_planeaciones", JSON.stringify(cachedPlans));
      setSaveMessage("Guardado local exitoso. (La Nube no está disponible por el momento)");
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  // Support exporting layout to JSON Backup file
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Planeacion_${plan.tituloProyecto.replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadWord = () => {
    const totalSesiones = plan.secuenciaDidactica?.reduce((acc, f) => {
      const activeSesiones = f.sesiones?.filter(isSessionActive) || [];
      return acc + activeSesiones.length;
    }, 0) || 0;
    
    const ejesArtRow = (plan.ejesArticuladores && plan.ejesArticuladores.length > 0) 
      ? "<tr><td><strong>Ejes Transversales:</strong></td><td>" + plan.ejesArticuladores.join(", ") + "</td></tr>"
      : "";

    const aprendizajesHtml = plan.aprendizajeEsperado 
      ? plan.aprendizajeEsperado.split("\n").filter(line => line.trim().length > 0).map(line => {
          const cleanLine = line.replace(/^\d+[\s.\-)]+/, "").trim();
          return "<li>" + cleanLine + "</li>";
        }).join("")
      : "<li>No se han definido aprendizajes esperados.</li>";

    let secuenciaHtml = "";
    if (plan.secuenciaDidactica) {
      secuenciaHtml = plan.secuenciaDidactica.map((fase) => {
        if (!fase.sesiones) return "";
        return fase.sesiones.filter(isSessionActive).map((session) => {
          let blockLabel = "Sesión " + session.numero;
          if (plan.tipoPlaneacion === "Semanal") {
            const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
            if (session.diasSelected && session.diasSelected.length > 0) {
              blockLabel = session.diasSelected.join(", ");
            } else {
              blockLabel = days[session.numero - 1] || ("Día " + session.numero);
            }
          } else if (plan.tipoPlaneacion === "Mensual") {
            blockLabel = "Semana " + session.numero;
          } else if (plan.tipoPlaneacion === "Bimestral") {
            blockLabel = "Bloque " + session.numero;
          } else if (plan.tipoPlaneacion === "Anual") {
            blockLabel = "Trimestre " + session.numero;
          }

          const inicioHtml = (session.actividades?.inicio && session.actividades.inicio.length > 0) 
            ? "<div class='moment-title'>Apertura (" + (session.duracion || "10") + " min)</div>" + session.actividades.inicio.map(act => "<p class='activity-text'>• " + act + "</p>").join("")
            : "";

          const desarrolloHtml = (session.actividades?.desarrollo && session.actividades.desarrollo.length > 0)
            ? "<div class='moment-title'>Desarrollo (" + (session.duracion || "25") + " min)</div>" + session.actividades.desarrollo.map(act => "<p class='activity-text'>• " + act + "</p>").join("")
            : "";

          const cierreHtml = (session.actividades?.cierre && session.actividades.cierre.length > 0)
            ? "<div class='moment-title'>Cierre (" + (session.duracion || "10") + " min)</div>" + session.actividades.cierre.map(act => "<p class='activity-text'>• " + act + "</p>").join("")
            : "";

          const ejesHtml = (plan.ejesArticuladores && plan.ejesArticuladores.length > 0)
            ? "<div class='integration-box'><div style='font-size: 8.5pt; font-weight: bold; color: #475569; text-transform: uppercase;'>Integración de Ejes Transversales</div>" + 
                plan.ejesArticuladores.map(eje => {
                  const cleanEje = eje.split(" (")[0];
                  const desc = getTransversalIntegrationDesc(cleanEje, session.numero, plan.tituloProyecto);
                  return "<p style='font-size: 10pt; margin: 4px 0;'><strong>" + cleanEje + ":</strong> " + desc + "</p>";
                }).join("") + "</div>"
            : "";

          return "<div class='session-card'><div class='session-title'>" + blockLabel + ": " + (session.titulo || "Tema sin asignar") + "</div>" + inicioHtml + desarrolloHtml + cierreHtml + ejesHtml + "</div>";
        }).join("");
      }).join("");
    }

    const activeSes = plan.secuenciaDidactica?.flatMap(f => f.sesiones || []).filter(isSessionActive) || [];
    const guiaMat = activeSes.flatMap(s => s.materiales || []).filter(m => m.toLowerCase().includes("guía") || m.toLowerCase().includes("pdf") || m.toLowerCase().includes("artículo")) || [];
    const videoMat = activeSes.flatMap(s => s.materiales || []).filter(m => m.toLowerCase().includes("video") || m.toLowerCase().includes("youtube") || m.toLowerCase().includes("clase")) || [];
    const digMat = activeSes.flatMap(s => s.materiales || []).filter(m => !m.toLowerCase().includes("video") && !m.toLowerCase().includes("guía") && !m.toLowerCase().includes("pdf")) || [];

    const htmlContent = 
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>" +
      "<head>" +
        "<title>" + (plan.tituloProyecto || "Planeación") + "</title>" +
        "<meta charset='utf-8'>" +
        "<!--[if gte mso 9]>" +
        "<xml>" +
          "<w:WordDocument>" +
            "<w:View>Print</w:View>" +
            "<w:Zoom>100</w:Zoom>" +
          "</w:WordDocument>" +
        "</xml>" +
        "<![endif]-->" +
        "<style>" +
          "body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #000000; margin: 1in; }" +
          "h1 { font-family: 'Times New Roman', serif; font-size: 24pt; font-weight: bold; border-bottom: 2px solid #000000; padding-bottom: 5px; margin-bottom: 15px; }" +
          "h2 { font-family: 'Arial', sans-serif; font-size: 14pt; font-weight: bold; color: #1a365d; margin-top: 25px; margin-bottom: 10px; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; }" +
          "h3 { font-family: 'Arial', sans-serif; font-size: 12pt; font-weight: bold; color: #0f172a; margin-top: 15px; margin-bottom: 5px; text-transform: uppercase; }" +
          ".metadata-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }" +
          ".metadata-table td { padding: 6px; vertical-align: top; }" +
          ".section { margin-bottom: 25px; }" +
          ".session-card { border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px; }" +
          ".session-title { font-size: 12pt; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 3px; margin-bottom: 10px; }" +
          ".moment-title { font-size: 9.5pt; font-weight: bold; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 10px; margin-bottom: 4px; }" +
          ".activity-text { font-size: 11pt; color: #334155; margin-bottom: 6px; margin-left: 15px; }" +
          ".integration-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; margin-top: 10px; border-radius: 4px; }" +
          ".signature-table { width: 100%; margin-top: 50px; }" +
          ".signature-line { border-top: 1px solid #000000; width: 80%; margin: 0 auto; margin-top: 40px; padding-top: 5px; font-size: 9pt; font-weight: bold; text-align: center; }" +
        "</style>" +
      "</head>" +
      "<body>" +
        "<h1>Plan de Clase: " + (plan.tituloProyecto || "Tema sin asignar") + "</h1>" +
        "<div class='section'>" +
          "<h2>Datos Generales</h2>" +
          "<table class='metadata-table'>" +
            "<tr><td style='width: 30%'><strong>Docente:</strong></td><td>" + (plan.docente || "No especificado") + "</td></tr>" +
            "<tr><td><strong>Escuela:</strong></td><td>" + (plan.escuela || "No especificada") + "</td></tr>" +
            "<tr><td><strong>Nivel Educativo:</strong></td><td>" + (plan.fase || "Primaria") + " " + (plan.grado ? ("(" + plan.grado + ")") : "") + "</td></tr>" +
            "<tr><td><strong>Asignatura / Campo Formativo:</strong></td><td>" + (plan.campoFormativo || "No especificado") + "</td></tr>" +
            "<tr><td><strong>Tema de Clase:</strong></td><td>" + (plan.tituloProyecto || "No especificado") + "</td></tr>" +
            "<tr><td><strong>Sesiones planeadas:</strong></td><td>" + totalSesiones + " sesiones</td></tr>" +
            "<tr><td><strong>Duración por Sesión:</strong></td><td>" + (plan.temporalidad || "No especificado") + "</td></tr>" +
            "<tr><td><strong>Horas por Sesión:</strong></td><td>" + (plan.horasSesion || "No especificado") + "</td></tr>" +
            "<tr><td><strong>Metodología:</strong></td><td>" + (plan.metodologia || "No especificado") + "</td></tr>" +
            ejesArtRow +
          "</table>" +
        "</div>" +
        "<div class='section'>" +
          "<h2>Propósito Formativo</h2>" +
          "<p>" + (plan.propositoFormativo || plan.proposito || "No definido").replace(/\n/g, "<br>") + "</p>" +
        "</div>" +
        "<div class='section'>" +
          "<h2>Aprendizajes Esperados</h2>" +
          "<ol>" + aprendizajesHtml + "</ol>" +
        "</div>" +
        "<div class='section'>" +
          "<h2>Secuencia Didáctica</h2>" +
          secuenciaHtml +
        "</div>" +
        "<div class='section'>" +
          "<h2>Recursos y Materiales</h2>" +
          "<h3>Artículos y Publicaciones</h3>" +
          "<ul>" +
            "<li><strong>[Guía del Docente - Plan NEM]:</strong> Documento pedagógico de orientación y metodologías oficiales de educación básica.</li>" +
            guiaMat.map(mat => "<li>" + mat + "</li>").join("") +
          "</ul>" +
          "<h3>Videos Educativos</h3>" +
          "<ul>" +
            "<li><strong>[Video Introductorio de Apoyo]:</strong> Recurso audiovisual complementario para activar el canal sensorial y explicaciones dinámicas.</li>" +
            videoMat.map(mat => "<li>" + mat + "</li>").join("") +
          "</ul>" +
          "<h3>Herramientas Digitales</h3>" +
          "<ul>" +
            "<li><strong>[Software Interactivo de Aula]:</strong> Aplicaciones multimedia y proyectores escolares para la práctica guiada de los estudiantes.</li>" +
            digMat.map(mat => "<li>" + mat + "</li>").join("") +
          "</ul>" +
        "</div>" +
        "<table class='signature-table'>" +
          "<tr>" +
            "<td style='width: 50%'>" +
              "<div class='signature-line'>" +
                "PROFESOR(A) GRUPAL<br>" +
                "<span style='font-size: 8pt; font-weight: normal; color: #64748b;'>Firma del Docente: " + (plan.docente || "Docente") + "</span>" +
              "</div>" +
            "</td>" +
            "<td style='width: 50%'>" +
              "<div class='signature-line'>" +
                "DIRECCIÓN ESCOLAR<br>" +
                "<span style='font-size: 8pt; font-weight: normal; color: #64748b;'>Nombre, Firma y Sello: " + (plan.escuela || "Dirección de la Escuela") + "</span>" +
              "</div>" +
            "</td>" +
          "</tr>" +
        "</table>" +
      "</body>" +
      "</html>";

    const blob = new Blob([htmlContent], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.setAttribute("download", "Planeacion_" + (plan.tituloProyecto || "NEM").replace(/\s+/g, "_") + ".doc");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const totalSesiones = plan.secuenciaDidactica?.reduce((acc, f) => {
      const activeSesiones = f.sesiones?.filter(isSessionActive) || [];
      return acc + activeSesiones.length;
    }, 0) || 0;
    
    const ejesArtRow = (plan.ejesArticuladores && plan.ejesArticuladores.length > 0) 
      ? "<li class='metadata-item'>• <strong>Ejes transversales:</strong> " + plan.ejesArticuladores.join(", ") + "</li>"
      : "";

    const aprendizajesHtml = plan.aprendizajeEsperado 
      ? plan.aprendizajeEsperado.split("\n").filter(line => line.trim().length > 0).map(line => {
          const cleanLine = line.replace(/^\d+[\s.\-)]+/, "").trim();
          return "<li style='margin-bottom: 6px;'>" + cleanLine + "</li>";
        }).join("")
      : "No se han definido aprendizajes esperados.";

    let secuenciaHtml = "";
    if (plan.secuenciaDidactica) {
      secuenciaHtml = plan.secuenciaDidactica.map((fase) => {
        if (!fase.sesiones) return "";
        return fase.sesiones.filter(isSessionActive).map((session) => {
          let blockLabel = "Sesión " + session.numero;
          if (plan.tipoPlaneacion === "Semanal") {
            const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
            if (session.diasSelected && session.diasSelected.length > 0) {
              blockLabel = session.diasSelected.join(", ");
            } else {
              blockLabel = days[session.numero - 1] || ("Día " + session.numero);
            }
          } else if (plan.tipoPlaneacion === "Mensual") {
            blockLabel = "Semana " + session.numero;
          } else if (plan.tipoPlaneacion === "Bimestral") {
            blockLabel = "Bloque " + session.numero;
          } else if (plan.tipoPlaneacion === "Anual") {
            blockLabel = "Trimestre " + session.numero;
          }

          const inicioHtml = (session.actividades?.inicio && session.actividades.inicio.length > 0) 
            ? "<div class='moment-title'>APERTURA (" + (session.duracion || "10") + " min)</div><div class='moment-content'>" + session.actividades.inicio.map(act => {
                const prefixes = ["Objetivo específico:", "Técnica:", "Actividad 1:", "Actividad 2:", "Actividad 3:", "Inclusión:", "Pensamiento crítico:", "Interculturalidad crítica:", "Fomento a la lectura:"];
                let formatted = act;
                for (const prefix of prefixes) {
                  if (act.startsWith(prefix)) {
                    formatted = "<strong>" + prefix + "</strong>" + act.substring(prefix.length);
                    break;
                  }
                }
                return "<div class='moment-item'>" + formatted + "</div>";
              }).join("") + "</div>"
            : "";

          const desarrolloHtml = (session.actividades?.desarrollo && session.actividades.desarrollo.length > 0)
            ? "<div class='moment-title'>DESARROLLO (" + (session.duracion || "25") + " min)</div><div class='moment-content'>" + session.actividades.desarrollo.map(act => {
                const prefixes = ["Objetivo específico:", "Técnica:", "Actividad 1:", "Actividad 2:", "Actividad 3:", "Inclusión:", "Pensamiento crítico:", "Interculturalidad crítica:", "Fomento a la lectura:"];
                let formatted = act;
                for (const prefix of prefixes) {
                  if (act.startsWith(prefix)) {
                    formatted = "<strong>" + prefix + "</strong>" + act.substring(prefix.length);
                    break;
                  }
                }
                return "<div class='moment-item'>" + formatted + "</div>";
              }).join("") + "</div>"
            : "";

          const cierreHtml = (session.actividades?.cierre && session.actividades.cierre.length > 0)
            ? "<div class='moment-title'>CIERRE (" + (session.duracion || "10") + " min)</div><div class='moment-content'>" + session.actividades.cierre.map(act => {
                const prefixes = ["Objetivo específico:", "Técnica:", "Actividad 1:", "Actividad 2:", "Actividad 3:", "Inclusión:", "Pensamiento crítico:", "Interculturalidad crítica:", "Fomento a la lectura:"];
                let formatted = act;
                for (const prefix of prefixes) {
                  if (act.startsWith(prefix)) {
                    formatted = "<strong>" + prefix + "</strong>" + act.substring(prefix.length);
                    break;
                  }
                }
                return "<div class='moment-item'>" + formatted + "</div>";
              }).join("") + "</div>"
            : "";

          const ejesHtml = (plan.ejesArticuladores && plan.ejesArticuladores.length > 0)
            ? "<div class='integration-container'><div class='integration-title'>INTEGRACIÓN DE EJES TRANSVERSALES</div>" + 
                plan.ejesArticuladores.map(eje => {
                  const cleanEje = eje.split(" (")[0];
                  const desc = getTransversalIntegrationDesc(cleanEje, session.numero, plan.tituloProyecto);
                  return "<div class='integration-item'><strong>" + cleanEje + ":</strong> " + desc + "</div>";
                }).join("") + "</div>"
            : "";

          return "<div class='session-block'><div class='session-title'>" + blockLabel + ": " + (session.titulo || "Tema sin asignar") + "</div>" + inicioHtml + desarrolloHtml + cierreHtml + ejesHtml + "</div>";
        }).join("");
      }).join("");
    }

    const activeSes = plan.secuenciaDidactica?.flatMap(f => f.sesiones || []).filter(isSessionActive) || [];
    const guiaMat = activeSes.flatMap(s => s.materiales || []).filter(m => m.toLowerCase().includes("guía") || m.toLowerCase().includes("pdf") || m.toLowerCase().includes("artículo")) || [];
    const videoMat = activeSes.flatMap(s => s.materiales || []).filter(m => m.toLowerCase().includes("video") || m.toLowerCase().includes("youtube") || m.toLowerCase().includes("clase")) || [];
    const digMat = activeSes.flatMap(s => s.materiales || []).filter(m => !m.toLowerCase().includes("video") && !m.toLowerCase().includes("guía") && !m.toLowerCase().includes("pdf")) || [];

    const htmlContent = 
      "<!DOCTYPE html>" +
      "<html>" +
      "<head>" +
        "<title>" + (plan.tituloProyecto || "Planeación") + "</title>" +
        "<meta charset='utf-8'>" +
        "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
        "<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' rel='stylesheet'>" +
        "<style>" +
          "body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 20px; display: flex; justify-content: center; }" +
          ".paper { background-color: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 12px; max-width: 800px; width: 100%; padding: 40px; box-sizing: border-box; }" +
          ".title-section { border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 24px; }" +
          "h1 { font-size: 32px; font-weight: 900; margin: 0; color: #020617; letter-spacing: -0.025em; }" +
          ".project-title { font-size: 16px; font-weight: 700; margin-top: 10px; color: #1e293b; }" +
          "h3 { font-size: 14px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-top: 30px; margin-bottom: 14px; color: #020617; }" +
          ".metadata-list { list-style: none; padding: 0; margin: 0; }" +
          ".metadata-item { font-size: 14px; margin-bottom: 8px; color: #334155; }" +
          ".metadata-item strong { color: #0f172a; }" +
          ".text-block { font-size: 14px; line-height: 1.6; color: #334155; text-align: justify; }" +
          ".session-block { border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; }" +
          ".session-title { font-size: 15px; font-weight: 900; color: #020617; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 12px; }" +
          ".moment-title { font-size: 11px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; color: #0f172a; margin-top: 12px; margin-bottom: 6px; }" +
          ".moment-content { border-left: 1px solid #e2e8f0; padding-left: 16px; margin-bottom: 12px; }" +
          ".moment-item { font-size: 13.5px; line-height: 1.5; color: #334155; margin-bottom: 8px; }" +
          ".moment-item strong { color: #0f172a; }" +
          ".integration-container { background-color: #fafafa; border: 1px solid #f1f5f9; padding: 16px; border-radius: 8px; margin-top: 14px; }" +
          ".integration-title { font-size: 10px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; color: #020617; margin-bottom: 8px; }" +
          ".integration-item { font-size: 13px; line-height: 1.5; color: #475569; margin-bottom: 6px; }" +
          ".integration-item strong { color: #0f172a; }" +
          ".signature-section { border-top: 1px solid #94a3b8; padding-top: 40px; margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; text-align: center; }" +
          ".signature-box { display: flex; flex-direction: column; align-items: center; }" +
          ".signature-line { width: 80%; border-bottom: 1px solid #020617; height: 48px; margin-bottom: 8px; }" +
          ".signature-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #020617; }" +
          ".signature-subtitle { font-size: 9px; color: #64748b; margin-top: 2px; }" +
          ".non-printable-toolbar { position: fixed; top: 20px; right: 20px; background: white; padding: 10px 16px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); display: flex; gap: 10px; z-index: 9999; }" +
          ".btn { background-color: #1e293b; color: white; border: none; padding: 8px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; text-decoration: none; }" +
          ".btn-print { background-color: #4f46e5; }" +
          "@media print { body { background-color: white; padding: 0; } .paper { box-shadow: none; padding: 0; border-radius: 0; } .non-printable-toolbar { display: none; } }" +
        "</style>" +
      "</head>" +
      "<body>" +
        "<div class='non-printable-toolbar'>" +
          "<button class='btn btn-print' onclick='window.print()'>Imprimir / Guardar PDF</button>" +
          "<button class='btn' onclick='window.close()'>Cerrar</button>" +
        "</div>" +
        "<div class='paper'>" +
          "<div class='title-section'>" +
            "<h1>Plan de Clase</h1>" +
            "<div class='project-title'>" + (plan.tituloProyecto || "Tema sin asignar") + "</div>" +
          "</div>" +
          "<h3>DATOS GENERALES</h3>" +
          "<ul class='metadata-list'>" +
            "<li class='metadata-item'>• <strong>Docente:</strong> " + (plan.docente || "No especificado") + "</li>" +
            "<li class='metadata-item'>• <strong>Escuela:</strong> " + (plan.escuela || "No especificada") + "</li>" +
            "<li class='metadata-item'>• <strong>Nivel educativo:</strong> " + (plan.fase || "Primaria") + " " + (plan.grado ? ("(" + plan.grado + ")") : "") + "</li>" +
            "<li class='metadata-item'>• <strong>Materia:</strong> " + (plan.campoFormativo || "Asignatura") + "</li>" +
            "<li class='metadata-item'>• <strong>Tema:</strong> " + plan.tituloProyecto + "</li>" +
            "<li class='metadata-item'>• <strong>Sesiones:</strong> " + totalSesiones + "</li>" +
            "<li class='metadata-item'>• <strong>Duración por sesión:</strong> " + (plan.temporalidad || "45 minutos") + "</li>" +
            "<li class='metadata-item'>• <strong>Horas por sesión:</strong> " + (plan.horasSesion || "No especificado") + "</li>" +
            "<li class='metadata-item'>• <strong>Metodología:</strong> " + (plan.metodologia || "Colaborativo") + "</li>" +
            ejesArtRow +
          "</ul>" +
          "<h3>PROPÓSITO FORMATIVO</h3>" +
          "<div class='text-block'>" + (plan.propositoFormativo || plan.proposito || "No definido").replace(/\n/g, "<br>") + "</div>" +
          "<h3>APRENDIZAJES ESPERADOS</h3>" +
          "<div class='text-block'><ol style='margin: 0; padding-left: 20px;'>" + aprendizajesHtml + "</ol></div>" +
          "<h3>SECUENCIA DIDÁCTICA</h3>" +
          "<div>" + secuenciaHtml + "</div>" +
          "<h3>RECURSOS Y MATERIALES</h3>" +
          "<div class='text-block'>" +
            "<strong>Artículos y Publicaciones</strong>" +
            "<ul style='margin: 4px 0 16px 0; padding-left: 20px;'>" +
              "<li><strong>[Guía del Docente - Plan NEM]:</strong> Documento pedagógico de orientación y metodologías oficiales de educación básica.</li>" +
              guiaMat.map(mat => "<li>" + mat + "</li>").join("") +
            "</ul>" +
            "<strong>Videos Educativos</strong>" +
            "<ul style='margin: 4px 0 16px 0; padding-left: 20px;'>" +
              "<li><strong>[Video Introductorio de Apoyo]:</strong> Recurso audiovisual complementario para activar el canal sensorial y explicaciones dinámicas.</li>" +
              videoMat.map(mat => "<li>" + mat + "</li>").join("") +
            "</ul>" +
            "<strong>Herramientas Digitales</strong>" +
            "<ul style='margin: 4px 0 16px 0; padding-left: 20px;'>" +
              "<li><strong>[Software Interactivo de Aula]:</strong> Aplicaciones multimedia y proyectores escolares para la práctica guiada de los estudiantes.</li>" +
              digMat.map(mat => "<li>" + mat + "</li>").join("") +
            "</ul>" +
          "</div>" +
          "<div class='signature-section'>" +
            "<div class='signature-box'>" +
              "<div class='signature-line'></div>" +
              "<div class='signature-title'>PROFESOR(A) GRUPAL</div>" +
              "<div class='signature-subtitle'>Firma del Docente: " + (plan.docente || "Docente") + "</div>" +
            "</div>" +
            "<div class='signature-box'>" +
              "<div class='signature-line'></div>" +
              "<div class='signature-title'>DIRECCIÓN ESCOLAR</div>" +
              "<div class='signature-subtitle'>Nombre, Firma y Sello: " + (plan.escuela || "Dirección de la Escuela") + "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +
        "<script>" +
          "window.onload = function() { setTimeout(function() { window.print(); }, 500); }" +
        "</script>" +
      "</body>" +
      "</html>";

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.setAttribute("download", "Planeacion_" + (plan.tituloProyecto || "NEM").replace(/\s+/g, "_") + ".html");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  // Helper print view trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left" id="planeacion-document-workspace">
      {/* Visual notification bar */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #nem-navigation-navbar,
          #nem-tabs-selector,
          #nem-action-pockets,
          #nem-alert-box,
          #planeacion-document-workspace-controls,
          #nem-tab-buttons,
          .non-printable,
          button,
          input[type="button"],
          footer {
            display: none !important;
          }
          #planeacion-printable-grid {
            display: none !important;
          }
          #planeacion-cinzel-print-container {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          textarea, input {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            width: 100% !important;
            resize: none !important;
            outline: none !important;
          }
        }
      `}</style>

      {/* Control Actions Row (Non-printable) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl non-printable" id="planeacion-document-workspace-controls">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 bg-white text-slate-650 hover:text-indigo-600 border border-slate-200 rounded-lg hover:shadow-xs transition"
            title="Volver"
          >
            <CornerUpLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ajuste e Impresión Directa</h3>
            <p className="text-xs text-slate-500 mt-0.5">Visualiza tu planeación en el formato final antes de imprimir o realiza ediciones rápidas.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSaveToCloudAndLocal}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Guardando..." : "Guardar en Nube"}
          </button>
          <button
            type="button"
            onClick={handleDownloadWord}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
            title="Descargar planeación editable en formato Word"
          >
            <FileText className="w-4 h-4" />
            Descargar Word (.doc)
          </button>
          <button
            type="button"
            onClick={handleDownloadHtml}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
            title="Descargar archivo HTML de alta fidelidad que se imprime automáticamente al abrirlo"
          >
            <Download className="w-4 h-4" />
            Descargar HTML
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-200 rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            Exportar JSON
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs md:text-sm font-semibold transition flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Descargar PDF
          </button>
        </div>
      </div>

      {isInIframe && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs md:text-sm space-y-2.5 non-printable" id="nem-iframe-warning">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900 flex items-center gap-1">
                <span>⚠️ Limitación de la Vista Previa de AI Studio</span>
              </p>
              <p className="mt-1 leading-relaxed text-amber-800">
                Los navegadores web bloquean la opción de <strong>Imprimir / Guardar en PDF</strong> cuando el sistema se ejecuta dentro de un marco interactivo (iframe). 
              </p>
              <p className="mt-1 leading-relaxed font-semibold">
                Para imprimir o guardar tu planeación, tienes dos opciones 100% efectivas:
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7.5 mt-2">
            <div className="bg-white/80 p-3 rounded-lg border border-amber-100/50 space-y-1">
              <p className="font-bold text-amber-950 text-xs flex items-center gap-1">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                <span>1. Abrir en pestaña nueva (Recomendado)</span>
              </p>
              <p className="text-[11px] text-amber-850 leading-normal">
                Haz clic en el botón de la esquina superior derecha del panel de vista previa: <strong>"Open in a new tab"</strong> (icono de flecha ↗️). Esto abrirá la app en pantalla completa donde el botón "Imprimir / Descargar PDF" funcionará a la perfección.
              </p>
            </div>
            <div className="bg-white/80 p-3 rounded-lg border border-amber-100/50 space-y-1">
              <p className="font-bold text-amber-950 text-xs flex items-center gap-1">
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Descargar formatos alternativos</span>
              </p>
              <p className="text-[11px] text-amber-850 leading-normal">
                Haz clic en el botón <strong>"Descargar Word (.doc)"</strong> para obtener un archivo totalmente editable, o en <strong>"Descargar HTML"</strong>, un archivo que al abrirlo en tu computadora activa el menú de impresión de inmediato.
              </p>
            </div>
          </div>
        </div>
      )}

      {saveMessage && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2 non-printable" id="nem-alert-box">
          <Sparkles className="w-4 h-4 text-emerald-600 animate-bounce" />
          <span className="font-semibold">{saveMessage}</span>
        </div>
      )}

      {/* RENDER DE LA HOJA CONTINUA CINZEL */}
      {viewStyle === "cinzel" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-14 space-y-8 printable-sheet" id="planeacion-printable-grid">
          {renderCinzelSheet(false)}
        </div>
      )}

      {/* Screen Mode Tab headers (non-printable) - ONLY SHOWS IN EDITOR VIEW */}
      {viewStyle === "editor" && (
        <div className="flex border-b border-slate-100 non-printable" id="nem-tab-buttons">
          {(["general", "secuencia", "evaluacion", "inclusión"] as const).map((tab) => {
            let label = "";
            if (tab === "general") {
              label = "1. Datos y Propósito";
            } else if (tab === "secuencia") {
              if (plan.tipoPlaneacion === "Anual") label = "2. Estructura Trimestral";
              else if (plan.tipoPlaneacion === "Bimestral") label = "2. Cronograma Quincenal";
              else if (plan.tipoPlaneacion === "Mensual") label = "2. Distribución Semanal";
              else if (plan.tipoPlaneacion === "Semanal") label = "2. Horario Diario (L-V)";
              else label = "2. Secuencia de Sesiones";
            } else if (tab === "evaluacion") {
              label = "3. Evaluación";
            } else {
              label = "4. Ajustes Inclusivos";
            }

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-bold border-b-2 capitalize transition ${
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Screen UI Panels - ONLY SHOWS IN EDITOR VIEW */}
      {viewStyle === "editor" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-8 printable-sheet" id="planeacion-printable-grid">
        
        {/* PHYSICAL PAPER HEADER (Visible primarily on PRINT or standard layout) */}
        <div className="border-b-2 border-double border-slate-350 pb-5 mb-5 select-none text-center">
          <div className="text-md font-bold uppercase tracking-widest text-slate-750">
            {plan.tipoPlaneacion && plan.tipoPlaneacion !== "Proyecto" 
              ? `PLANEACIÓN DIDÁCTICA ESCOLAR (${plan.tipoPlaneacion.toUpperCase()})` 
              : "PLANEACIÓN DIDÁCTICA ESCOLAR"}
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">PLAN DE ESTUDIOS DE EDUCACIÓN BÁSICA (NUEVA ESCUELA MEXICANA)</div>
        </div>

        {/* TAB 1: GENERAL DATA */}
        {(activeTab === "general" || window.matchMedia("print").matches) && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-600 pl-3 uppercase">
              {plan.tipoPlaneacion && plan.tipoPlaneacion !== "Proyecto" 
                ? `Datos Generales de la Planeación ${plan.tipoPlaneacion}` 
                : "Datos Generales del Proyecto"}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Título del Proyecto</label>
                <input
                  type="text"
                  value={plan.tituloProyecto}
                  onChange={(e) => handleFieldChange("tituloProyecto", e.target.value)}
                  className="w-full text-sm font-semibold border-b border-slate-200 py-1.5 focus:border-indigo-500 focus:outline-none bg-transparent"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Fase y Grado</label>
                <div className="text-sm font-semibold text-slate-800 py-1.5">
                  {plan.grado} ({plan.fase})
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Docente</label>
                <input
                  type="text"
                  value={plan.docente}
                  onChange={(e) => handleFieldChange("docente", e.target.value)}
                  className="w-full text-sm font-medium border-b border-slate-200 py-1.5 focus:border-indigo-500 focus:outline-none bg-transparent"
                  placeholder="Docente..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Escuela</label>
                <input
                  type="text"
                  value={plan.escuela}
                  onChange={(e) => handleFieldChange("escuela", e.target.value)}
                  className="w-full text-sm font-medium border-b border-slate-200 py-1.5 focus:border-indigo-500 focus:outline-none bg-transparent"
                  placeholder="Escuela..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Campo Formativo</label>
                <div className="text-sm font-bold text-indigo-700 py-1">{plan.campoFormativo}</div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Metodología Didáctica</label>
                <div className="text-sm font-bold text-emerald-700 py-1">{plan.metodologia}</div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Escenario y Plazo</label>
                <div className="text-sm font-medium text-slate-800 py-1">
                  {plan.escenario} • {plan.temporalidad} {plan.horasSesion ? `• ${plan.horasSesion}` : ""}
                </div>
                {plan.tipoPlaneacion === "Semanal" && plan.frecuenciaSemanal && (
                  <div className="text-[10px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md mt-1 inline-block">
                    📅 Días: {plan.frecuenciaSemanal}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ejes Articuladores Asignados</label>
                <div className="flex flex-wrap gap-2 py-1">
                  {plan.ejesArticuladores?.map((e, idx) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              {plan.estrategiaNacional && (
                <div>
                  <label className="block text-[11px] font-bold text-rose-700 uppercase">Estrategia Nacional Vinculada</label>
                  <div className="text-xs font-semibold text-rose-900 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 mt-1 inline-block">
                    {plan.estrategiaNacional}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Contenido (Oficial Co-diseño)</label>
                <textarea
                  value={plan.contenido}
                  rows={2}
                  onChange={(e) => handleFieldChange("contenido", e.target.value)}
                  className="w-full text-xs md:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Proceso de Desarrollo de Aprendizaje (PDA)</label>
                <textarea
                  value={plan.pda}
                  rows={2}
                  onChange={(e) => handleFieldChange("pda", e.target.value)}
                  className="w-full text-xs md:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Propósito General Didáctico</label>
                <textarea
                  value={plan.proposito}
                  rows={2}
                  onChange={(e) => handleFieldChange("proposito", e.target.value)}
                  className="w-full text-xs md:text-sm p-3.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none resize-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Propósito Formativo</label>
                <textarea
                  value={plan.propositoFormativo || ""}
                  rows={2}
                  onChange={(e) => handleFieldChange("propositoFormativo", e.target.value)}
                  className="w-full text-xs md:text-sm p-3.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none resize-none font-semibold text-slate-800"
                  placeholder="Sin asignar. Defina o edite el propósito formativo..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Aprendizaje Esperado</label>
                <textarea
                  value={plan.aprendizajeEsperado || ""}
                  rows={2}
                  onChange={(e) => handleFieldChange("aprendizajeEsperado", e.target.value)}
                  className="w-full text-xs md:text-sm p-3.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none resize-none font-semibold text-slate-800"
                  placeholder="Sin asignar. Defina o edite el aprendizaje esperado..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SECUENCIA DIDÁCTICA */}
        {(activeTab === "secuencia" || window.matchMedia("print").matches) && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-3">
              <h2 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-600 pl-3 uppercase">
                {plan.tipoPlaneacion === "Anual" ? "Estructura Trimestral y Programación" : "Secuencia Didáctica (Fases del Plan)"}
              </h2>

              {/* Selector de Modo de Visualización (Ventanas vs Lista) */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto non-printable">
                <button
                  type="button"
                  onClick={() => setViewMode("ventanas")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === "ventanas"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-850"
                  }`}
                  title="Muestra una clase/sesión a la vez, separadas en ventanas independientes"
                >
                  📂 Ventanas de Clase
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("lista")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    viewMode === "lista"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-850"
                  }`}
                  title="Muestra todas las sesiones una tras otra en forma de lista continua"
                >
                  📋 Lista Completa
                </button>
              </div>
            </div>

            {viewMode === "ventanas" && (
              <p className="text-xs text-indigo-950/75 bg-indigo-50/50 border border-indigo-100/60 p-3 rounded-xl leading-relaxed non-printable">
                💡 <strong>Modo Ventanas Activado:</strong> Cada número de sesión está separado en una pestaña-ventana interactiva. Haz clic en las pestañas numeradas para navegar clase por clase. Te proporcionamos la lista completa al imprimir para tu comodidad.
              </p>
            )}
            
            {plan.secuenciaDidactica?.map((fase, fIdx) => (
              <div key={fIdx} className="bg-slate-50/50 rounded-2xl border border-slate-200 p-5 md:p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-250/70 pb-3.5">
                  <div>
                    <span className="block text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Módulo / Fase curricular</span>
                    <input
                      type="text"
                      value={fase.nombre}
                      onChange={(e) => handleFaseChange(fIdx, e.target.value)}
                      className="w-full text-base font-bold text-slate-850 p-1 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none capitalize bg-transparent"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Enfoque Pedagógico / Propósito del Módulo</span>
                    <input
                      type="text"
                      value={fase.descripcion}
                      onChange={(e) => handleFaseDescChange(fIdx, e.target.value)}
                      className="w-full text-xs font-medium text-slate-500 p-1 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none bg-transparent"
                      placeholder="Descripción de la fase o módulo..."
                    />
                  </div>
                </div>

                {/* SELECTOR DE VENTANAS DE SESIÓN (Pestañas horizontales para cada número con diseño premium de pestañas Cinzel/Escolar) */}
                {viewMode === "ventanas" && fase.sesiones && fase.sesiones.length > 0 && (
                  <div className="flex flex-row flex-nowrap overflow-x-auto gap-2 border-b border-slate-200/80 pt-3 pb-2 non-printable scrollbar-thin scrollbar-thumb-slate-350 scrollbar-track-transparent">
                    {fase.sesiones.map((session, sIdx) => {
                      const isSelected = (selectedSessionMap[fIdx] ?? 0) === sIdx;
                      const isInactive = !isSessionActive(session);
                      
                      // Naming helper based on plan context
                      let labelPestaña = `Sesión ${session.numero}`;
                      const hasCustomDays = session.diasSelected && session.diasSelected.length > 0;
                      if (hasCustomDays) {
                        labelPestaña = session.diasSelected.join(", ");
                      } else if (plan.tipoPlaneacion === "Semanal") {
                        const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
                        labelPestaña = days[session.numero - 1] || `Día ${session.numero}`;
                      } else if (plan.tipoPlaneacion === "Mensual") {
                        labelPestaña = `Semana ${session.numero}`;
                      } else if (plan.tipoPlaneacion === "Bimestral") {
                        labelPestaña = `Bloque ${session.numero}`;
                      } else if (plan.tipoPlaneacion === "Anual") {
                        labelPestaña = `Eje ${session.numero}`;
                      }

                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => setSelectedSessionMap(prev => ({ ...prev, [fIdx]: sIdx }))}
                          className={`flex items-center gap-3 px-4.5 py-3 rounded-t-xl rounded-b-none border transition-all duration-200 font-bold text-xs relative -mb-[9px] shrink-0 outline-none select-none ${
                            isSelected
                              ? "bg-white border-slate-300 border-b-transparent text-indigo-700 z-10 shadow-[0_-3px_8px_rgba(79,70,229,0.08)]"
                              : "bg-slate-50 hover:bg-slate-100/80 border-slate-200/70 text-slate-500 hover:text-slate-800 border-b-slate-200"
                          } ${isInactive ? "opacity-55 hover:opacity-85" : ""}`}
                        >
                          {isSelected && (
                            <span className="absolute left-0 right-0 top-0 h-[3px] bg-indigo-600 rounded-t-xl" />
                          )}
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-200 border-2 ${
                            isSelected 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100" 
                              : "bg-slate-200/55 border-slate-300 text-slate-600"
                          }`}>
                            {session.numero}
                          </span>
                          <div className="flex flex-col items-start leading-none gap-0.5 text-left">
                            <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-60">
                              {plan.tipoPlaneacion === "Semanal" ? "Día" : 
                               plan.tipoPlaneacion === "Mensual" ? "Semana" : 
                               plan.tipoPlaneacion === "Bimestral" ? "Bloque" : 
                               plan.tipoPlaneacion === "Anual" ? "Trimestre" : "Fase"}
                            </span>
                            <span className="text-xs truncate max-w-[130px] font-bold">
                              {labelPestaña}{isInactive && " (Inactiva)"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* RENDERING DE SESIONES */}
                <div className="space-y-6">
                  {fase.sesiones?.map((session, sIdx) => {
                    const isSelected = (selectedSessionMap[fIdx] ?? 0) === sIdx;
                    // Always show everything on print, and in "lista" mode. In "ventanas" mode, show only selected.
                    const showOnScreen = viewMode === "lista" || isSelected;
                    const isInactive = !isSessionActive(session);

                    // Compute clean window title
                    let windowLabel = `SESIÓN DIRECTA PEDAGÓGICA #${session.numero}`;
                    const customDaysActive = session.diasSelected && session.diasSelected.length > 0;
                    if (customDaysActive) {
                      windowLabel = `CLASE PROGRAMADA LOS DÍAS: ${session.diasSelected.join(", ").toUpperCase()}`;
                    } else if (plan.tipoPlaneacion === "Semanal") {
                      const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
                      windowLabel = `${days[session.numero - 1]} - CLASE EN DÍA #${session.numero}`;
                    } else if (plan.tipoPlaneacion === "Mensual") {
                      windowLabel = `SEMANA CO-DISEÑO #${session.numero}`;
                    } else if (plan.tipoPlaneacion === "Bimestral") {
                      windowLabel = `BLOQUE QUINCENAL #${session.numero}`;
                    } else if (plan.tipoPlaneacion === "Anual") {
                      windowLabel = `TRIMESTRE / PERIODO ACADÉMICO #${session.numero}`;
                    }

                    return (
                      <div
                        key={sIdx}
                        className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-150 ${
                          showOnScreen ? "block" : "hidden print:block"
                        } ${isInactive ? "opacity-65 print:hidden border-dashed bg-slate-50/40" : ""}`}
                      >
                        {isInactive && (
                          <div className="bg-amber-50 border-b border-amber-150 text-amber-800 px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 non-printable">
                            <span>⚠️ Esta sesión no tiene días programados, por lo que se ocultará en la vista de impresión, PDF y descargas.</span>
                          </div>
                        )}
                        {/* DISEÑO DE CABECERA DE VENTANA DE SISTEMA */}
                        {viewMode === "ventanas" && (
                          <div className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between gap-3 select-none non-printable">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-sm inline-block"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm inline-block"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm inline-block"></span>
                            </div>
                            <div className="font-mono text-[9px] font-bold tracking-widest text-slate-400 mr-8">
                              {windowLabel}
                            </div>
                            <div className="w-4"></div>
                          </div>
                        )}

                        <div className="p-4 md:p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="bg-indigo-600 text-white w-7 h-7 rounded-lg text-xs flex items-center justify-center font-black shadow-sm">
                                {session.numero}
                              </span>
                              <input
                                type="text"
                                value={session.titulo}
                                onChange={(e) => handleSessionTitleChange(fIdx, sIdx, e.target.value)}
                                className="text-sm md:text-base font-bold text-slate-800 border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none bg-transparent"
                                placeholder="Título de la sesión o tema focal..."
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-extrabold uppercase mr-1">DURACIÓN Estimada:</span>
                              <input 
                                type="text"
                                value={session.duracion}
                                onChange={(e) => {
                                  // Update duration dynamically
                                  const updatedSec = [...plan.secuenciaDidactica];
                                  updatedSec[fIdx].sesiones[sIdx].duracion = e.target.value;
                                  handleFieldChange("secuenciaDidactica", updatedSec);
                                }}
                                className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-md font-bold focus:bg-white focus:outline-none w-[110px]"
                              />
                            </div>
                          </div>

                          {/* Días de la semana para esta clase */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pb-2.5 border-b border-slate-100">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase shrink-0">Días programados:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((dia) => {
                                // Logic for standard sequential defaults
                                const isDefault = !session.diasSelected && (
                                  (dia === "Lunes" && session.numero === 1) ||
                                  (dia === "Martes" && session.numero === 2) ||
                                  (dia === "Miércoles" && session.numero === 3) ||
                                  (dia === "Jueves" && session.numero === 4) ||
                                  (dia === "Viernes" && session.numero === 5)
                                );
                                
                                const isSelected = session.diasSelected ? session.diasSelected.includes(dia) : isDefault;

                                return (
                                  <button
                                    key={dia}
                                    type="button"
                                    onClick={() => {
                                      const currentSelected = session.diasSelected || (isDefault ? [dia] : []);
                                      let updatedList: string[];
                                      if (currentSelected.includes(dia)) {
                                        updatedList = currentSelected.filter(d => d !== dia);
                                      } else {
                                        updatedList = [...currentSelected, dia];
                                      }
                                      
                                      const updatedSec = [...plan.secuenciaDidactica];
                                      updatedSec[fIdx].sesiones[sIdx].diasSelected = updatedList;
                                      handleFieldChange("secuenciaDidactica", updatedSec);
                                    }}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition duration-150 flex items-center gap-1 ${
                                      isSelected
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100 print:bg-slate-100 print:border-slate-300 print:text-slate-800"
                                        : "bg-slate-55 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 print:hidden"
                                    }`}
                                  >
                                    {isSelected && <span className="text-[10px] print:hidden">✓</span>}
                                    {dia}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* INICIO */}
                            <div className="bg-indigo-50/20 border border-indigo-100/40 p-4 rounded-xl space-y-3">
                              <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-indigo-800 flex items-center justify-between border-b border-indigo-100/30 pb-2">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                  Apertura / Inicio
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addActivity(fIdx, sIdx, "inicio")}
                                  className="bg-indigo-150 hover:bg-indigo-250 p-1 rounded-md text-indigo-800 transition non-printable"
                                  title="Añadir paso a apertura"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </h4>
                              <div className="space-y-2">
                                {session.actividades?.inicio?.map((act, actIdx) => (
                                  <div key={actIdx} className="flex gap-2 group bg-white border border-slate-150 rounded-lg p-2 focus-within:border-indigo-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <textarea
                                      value={act}
                                      rows={2}
                                      onChange={(e) => handleSessionActivityChange(fIdx, sIdx, "inicio", actIdx, e.target.value)}
                                      className="w-full text-xs p-0 border-none focus:outline-none focus:ring-0 bg-transparent resize-none leading-relaxed text-slate-700 font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeActivity(fIdx, sIdx, "inicio", actIdx)}
                                      className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-700 p-0.5 self-start transition non-printable"
                                      title="Eliminar paso"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* DESARROLLO */}
                            <div className="bg-emerald-50/15 border border-emerald-100/35 p-4 rounded-xl space-y-3">
                              <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center justify-between border-b border-emerald-100/30 pb-2">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  Desarrollo / Acción
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addActivity(fIdx, sIdx, "desarrollo")}
                                  className="bg-emerald-100/70 hover:bg-emerald-200 p-1 rounded-md text-emerald-900 transition non-printable"
                                  title="Añadir paso a desarrollo"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </h4>
                              <div className="space-y-2">
                                {session.actividades?.desarrollo?.map((act, actIdx) => (
                                  <div key={actIdx} className="flex gap-2 group bg-white border border-slate-150 rounded-lg p-2 focus-within:border-emerald-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <textarea
                                      value={act}
                                      rows={2}
                                      onChange={(e) => handleSessionActivityChange(fIdx, sIdx, "desarrollo", actIdx, e.target.value)}
                                      className="w-full text-xs p-0 border-none focus:outline-none focus:ring-0 bg-transparent resize-none leading-relaxed text-slate-700 font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeActivity(fIdx, sIdx, "desarrollo", actIdx)}
                                      className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-700 p-0.5 self-start transition non-printable"
                                      title="Eliminar paso"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* CIERRE */}
                            <div className="bg-amber-50/15 border border-amber-100/30 p-4 rounded-xl space-y-3">
                              <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-amber-850 flex items-center justify-between border-b border-amber-100/30 pb-2">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                  Metacognición / Cierre
                                </span>
                                <button
                                  type="button"
                                  onClick={() => addActivity(fIdx, sIdx, "cierre")}
                                  className="bg-amber-100 hover:bg-amber-180 p-1 rounded-md text-amber-900 transition non-printable"
                                  title="Añadir paso a cierre"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </h4>
                              <div className="space-y-2">
                                {session.actividades?.cierre?.map((act, actIdx) => (
                                  <div key={actIdx} className="flex gap-2 group bg-white border border-slate-150 rounded-lg p-2 focus-within:border-amber-400 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <textarea
                                      value={act}
                                      rows={2}
                                      onChange={(e) => handleSessionActivityChange(fIdx, sIdx, "cierre", actIdx, e.target.value)}
                                      className="w-full text-xs p-0 border-none focus:outline-none focus:ring-0 bg-transparent resize-none leading-relaxed text-slate-700 font-medium"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeActivity(fIdx, sIdx, "cierre", actIdx)}
                                      className="text-rose-500 opacity-0 group-hover:opacity-100 hover:text-rose-700 p-0.5 self-start transition non-printable"
                                      title="Eliminar paso"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Materials and notes */}
                          <div className="border-t border-slate-100 pt-3.5 mt-2.5 text-xs flex flex-col gap-2">
                            <span className="font-extrabold text-slate-500 uppercase text-[9px] tracking-wider flex items-center gap-1">
                              🛠️ Recursos y Materiales de Apoyo:
                            </span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {session.materiales?.map((mat, mIdx) => (
                                <div key={mIdx} className="flex items-center bg-slate-55 shadow-[0_1px_2.5px_rgba(0,0,0,0.03)] border border-slate-200 rounded-lg px-2 py-1 max-w-[200px]">
                                  <input
                                    type="text"
                                    value={mat}
                                    onChange={(e) => handleSessionMaterialChange(fIdx, sIdx, mIdx, e.target.value)}
                                    className="bg-transparent border-none text-slate-700 text-xs font-medium focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = [...session.materiales];
                                      list.splice(mIdx, 1);
                                      const updatedSec = [...plan.secuenciaDidactica];
                                      updatedSec[fIdx].sesiones[sIdx].materiales = list;
                                      handleFieldChange("secuenciaDidactica", updatedSec);
                                    }}
                                    className="text-slate-400 hover:text-rose-500 ml-1.5 non-printable"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const list = [...(session.materiales || []), "Nuevo material"];
                                  const updatedSec = [...plan.secuenciaDidactica];
                                  updatedSec[fIdx].sesiones[sIdx].materiales = list;
                                  handleFieldChange("secuenciaDidactica", updatedSec);
                                }}
                                className="bg-indigo-50 border border-dashed border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-indigo-100 transition non-printable"
                              >
                                + Añadir Material
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: EVALUACIÓN */}
        {(activeTab === "evaluacion" || window.matchMedia("print").matches) && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-600 pl-3 uppercase">Esquema de Evaluación Formativa</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-xl border border-slate-250 p-5 space-y-3">
                <h3 className="text-xs font-bold text-indigo-700 uppercase tracking-widest border-b border-slate-150 pb-2">Instrumentos Sugeridos</h3>
                <ul className="space-y-2">
                  {plan.evaluacionFormativa?.instrumentos?.map((ins, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <input
                        type="text"
                        value={ins}
                        onChange={(e) => {
                          const list = [...plan.evaluacionFormativa.instrumentos];
                          list[idx] = e.target.value;
                          handleFieldChange("evaluacionFormativa", { ...plan.evaluacionFormativa, instrumentos: list });
                        }}
                        className="w-full bg-transparent border-none focus:outline-none"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-250 p-5 space-y-3">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest border-b border-slate-150 pb-2">Criterios de Evaluación</h3>
                <ul className="space-y-2">
                  {plan.evaluacionFormativa?.criterios?.map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <input
                        type="text"
                        value={crit}
                        onChange={(e) => {
                          const list = [...plan.evaluacionFormativa.criterios];
                          list[idx] = e.target.value;
                          handleFieldChange("evaluacionFormativa", { ...plan.evaluacionFormativa, criterios: list });
                        }}
                        className="w-full bg-transparent border-none focus:outline-none"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-xl border border-slate-250 p-5 space-y-3">
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest border-b border-slate-150 pb-2">Evidencias Tangibles</h3>
                <ul className="space-y-2">
                  {plan.evaluacionFormativa?.evidencias?.map((ev, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <input
                        type="text"
                        value={ev}
                        onChange={(e) => {
                          const list = [...plan.evaluacionFormativa.evidencias];
                          list[idx] = e.target.value;
                          handleFieldChange("evaluacionFormativa", { ...plan.evaluacionFormativa, evidencias: list });
                        }}
                        className="w-full bg-transparent border-none focus:outline-none"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AJUSTES RAZONABLES */}
        {(activeTab === "inclusión" || window.matchMedia("print").matches) && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-l-4 border-indigo-600 pl-3 uppercase">Ajustes Razonables e Inclusión</h2>
            <p className="text-xs text-slate-500 italic">
              Estrategias de equidad de acuerdo al diseño universal para el aprendizaje (DUA), adaptadas al contexto y BAP identificadas:
            </p>

            <div className="bg-slate-50 border border-slate-150 p-5 rounded-xl space-y-3">
              {plan.ajustesRazonables?.map((ajust, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded uppercase mt-0.5">Adaptación {idx+1}</span>
                  <input
                    type="text"
                    value={ajust}
                    onChange={(e) => {
                      const list = [...plan.ajustesRazonables];
                      list[idx] = e.target.value;
                      handleFieldChange("ajustesRazonables", list);
                    }}
                    className="w-full text-xs md:text-sm font-medium focus:outline-none bg-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRINT SIGNATURE BLOCK */}
        <div className="border-t border-slate-350 pt-10 mt-10 grid grid-cols-2 gap-10 text-center select-none">
          <div className="space-y-1">
            <div className="w-1/2 border-b border-slate-350 mx-auto h-12" />
            <div className="text-[10px] font-bold text-slate-600 uppercase">PROFESOR(A) GRUPAL</div>
            <div className="text-[9px] text-slate-400">FIRMA DEL DOCENTE</div>
          </div>
          <div className="space-y-1">
            <div className="w-1/2 border-b border-slate-350 mx-auto h-12" />
            <div className="text-[10px] font-bold text-slate-600 uppercase">DIRECCIÓN ESCOLAR</div>
            <div className="text-[9px] text-slate-400">NOMBRE, FIRMA Y SELLO</div>
          </div>
        </div>
      </div>
    )}

    {/* ALWAYS RENDERED FOR PRINT ONLY - HIDDEN ON SCREEN */}
      <div className="hidden print:block text-black bg-white w-full" id="planeacion-cinzel-print-container" style={{ fontFamily: "Inter, sans-serif" }}>
        {renderCinzelSheet(true)}
      </div>
    </div>
  );
}

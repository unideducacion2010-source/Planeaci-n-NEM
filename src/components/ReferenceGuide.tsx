import { useState } from "react";
import { CAMPOS_FORMATIVOS, METODOLOGIAS, EJES_ARTICULADORES } from "../data/schoolReference";
import { BookOpen, Award, Layers, Sparkles } from "lucide-react";

export default function ReferenceGuide() {
  const [activeSubTab, setActiveSubTab] = useState<"campos" | "metodologias" | "ejes">("campos");

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8" id="nem-reference-guide">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-850 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Marco Técnico Curricular - NEM
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Consulta rápida de las bases teóricas de la Nueva Escuela Mexicana (NEM) vigentes para Educación Básica.
          </p>
        </div>

        {/* Sub-tabs buttons */}
        <div className="flex bg-slate-50 p-1 rounded-xl self-start border border-slate-100">
          <button
            onClick={() => setActiveSubTab("campos")}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
              activeSubTab === "campos"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Campos Formativos
          </button>
          <button
            onClick={() => setActiveSubTab("metodologias")}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
              activeSubTab === "metodologias"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Metodologías
          </button>
          <button
            onClick={() => setActiveSubTab("ejes")}
            className={`px-4 py-2 text-xs md:text-sm font-medium rounded-lg transition-all ${
              activeSubTab === "ejes"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Ejes Articuladores
          </button>
        </div>
      </div>

      {activeSubTab === "campos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CAMPOS_FORMATIVOS.map((campo) => (
            <div key={campo.id} className="p-5 rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50/50 to-white hover:shadow-md transition-all">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 ${campo.color}`}>
                {campo.nombre}
              </span>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {campo.id === "lenguajes" && "Trabaja la competencia de comunicación, expresión artística, lectura de textos científicos, idiomas locales y lenguas extranjeras."}
                {campo.id === "saberes" && "Integra el pensamiento científico y el razonamiento matemático para interpretar, modelar y resolver retos ambientales y lógicos."}
                {campo.id === "etica" && "Configura la comprensión de procesos históricos, geografía participativa, cuidado del ecosistema y fortalecimiento cívico ético."}
                {campo.id === "humano" && "Desarrolla habilidades socioemocionales, deportes saludables, higiene corporal, autocuidado grupal y tecnología de impacto."}
              </p>
              <div className="text-xs font-medium text-indigo-600 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  Metodología asociada:{" "}
                  <strong>
                    {campo.id === "lenguajes" && "A. B. Proyectos Comunitarios"}
                    {campo.id === "saberes" && "Indagación Enfoque STEAM"}
                    {campo.id === "etica" && "A. B. Problemas (ABP)"}
                    {campo.id === "humano" && "Aprendizaje Servicio (AS)"}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "metodologias" && (
        <div className="space-y-6">
          {METODOLOGIAS.map((met, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-slate-100 bg-slate-50/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <span className="bg-slate-250 text-indigo-750 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
                      {met.abreviatura}
                    </span>
                    {met.nombre}
                  </h3>
                  <p className="text-xs text-indigo-600 font-medium mt-1">
                    Vinculación habitual: Campo <strong>{met.campoComun}</strong>
                  </p>
                </div>
                <div className="text-xs text-slate-500 italic max-w-md md:text-right bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  {met.justificacion}
                </div>
              </div>

              {/* Phases visual stepper list */}
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-slate-500 tracking-wider uppercase mb-3">Estadios / Fases oficiales de la ruta:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {met.fases.map((fas, fIdx) => (
                    <div key={fIdx} className="bg-white p-3 rounded-xl border border-slate-150 shadow-xs">
                      <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-150 text-slate-700 flex items-center justify-center text-[10px] font-mono leading-none">
                          {fIdx + 1}
                        </span>
                        {fas.n}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{fas.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSubTab === "ejes" && (
        <div>
          <p className="text-sm text-slate-600 mb-4 bg-amber-50 border border-amber-100 text-amber-900 rounded-xl p-4">
            Los <strong>Ejes Articuladores</strong> conectan los contenidos de los diferentes campos formativos con situaciones de la vida cotidiana del alumno. Son temas transversales obligatorios.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {EJES_ARTICULADORES.map((eje) => (
              <div key={eje.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-350 shadow-xs transition-all flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-slate-850 flex items-center gap-2 mb-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shrink-0"></span>
                    {eje.nombre}
                  </h4>
                  <p className="text-xs text-slate-500 leading-normal">
                    {eje.id === "inclusion" && "Garantiza la educación integral para todos, eliminando barreras sociales, físicas y formativas."}
                    {eje.id === "critico" && "Guía al estudiante a cuestionar la realidad, analizar situaciones y proponer hipótesis lógicas independientes."}
                    {eje.id === "interculturalidad" && "Fomenta la convivencia simétrica de identidades lingüísticas, culturales y de comunidades agrícolas u originarias."}
                    {eje.id === "genero" && "Promueve la igualdad de derechos, erradicando estereotipos y fomentando el respeto mutuo sano."}
                    {eje.id === "saludable" && "Favorece buenos hábitos alimentarios, higiene activa escolar y convivencia armónica con el ambiente."}
                    {eje.id === "lectura" && "Usa los textos literarios, leyendas e informes de indagación para valorar el legado sociocultural histórico."}
                    {eje.id === "artes" && "Disfruta de la imaginación visual, musical, teatral y dancística para expresar el mundo vivencial del alumno."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

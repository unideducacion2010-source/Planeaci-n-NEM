import { useState, useEffect } from "react";
import { Planeacion } from "./types";
import { db, collection, addDoc, serverTimestamp } from "./lib/firebase";
import Library from "./components/Library";
import PlaneacionForm from "./components/PlaneacionForm";
import PlaneacionViewer from "./components/PlaneacionViewer";
import ReferenceGuide from "./components/ReferenceGuide";
import { Sparkles, Library as LibraryIcon, GraduationCap, BookOpen, AlertTriangle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"crear" | "biblioteca" | "guia">("crear");
  const [activePlan, setActivePlan] = useState<Planeacion | null>(null);
  const [duplicatePrefill, setDuplicatePrefill] = useState<Planeacion | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [systemHealth, setSystemHealth] = useState<{ configured: boolean; message: string }>({
    configured: true,
    message: "Verificando conexión..."
  });

  // Verify health of express backend and gemini keys
  const verifyHealth = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        setSystemHealth({
          configured: data.geminiConfigured,
          message: data.message
        });
      }
    } catch (e) {
      console.warn("Backend API not reachable yet. Operating client-fallback.", e);
    }
  };

  useEffect(() => {
    verifyHealth();
  }, []);

  // Handle generation call
  const handleGenerate = async (formData: any) => {
    setIsGenerating(true);
    setActivePlan(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        let errMsg = "No se pudo generar la planeación.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg += ` Detalle: ${errData.error}` + (errData.details ? ` (${errData.details})` : "");
          } else if (errData && errData.details) {
            errMsg += ` Detalle: ${errData.details}`;
          }
        } catch (e) {
          errMsg += " Confirme que la clave de Secrets de OpenAI/Gemini sea correcta.";
        }
        throw new Error(errMsg);
      }

      const planResult: Planeacion = await response.json();
      
      // Attempt to save to Cloud Firestore immediately
      try {
        const docRef = await addDoc(collection(db, "planeaciones"), {
          ...planResult,
          createdAt: serverTimestamp()
        });
        planResult.id = docRef.id;
      } catch (dbErr) {
        console.warn("Database save failed. Saving locally.", dbErr);
      }

      // Save to local storage for local backup list
      let localPlans: Planeacion[] = [];
      try {
        const cached = localStorage.getItem("nem_planeaciones");
        if (cached) localPlans = JSON.parse(cached);
      } catch (e) {
        console.error("Failed to parse cached planeaciones", e);
      }
      
      planResult.createdAt = new Date();
      localPlans.unshift(planResult);
      localStorage.setItem("nem_planeaciones", JSON.stringify(localPlans));

      // Load into active viewer to preview!
      setActivePlan(planResult);
      setDuplicatePrefill(null); // Reset prefill
    } catch (err: any) {
      alert("Error en la generación: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync loaded plan edits
  const handleSaveSuccess = (updated: Planeacion) => {
    setActivePlan(updated);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans" id="nem-root-application">
      {/* Platform banner indicator if key is missing */}
      {!systemHealth.configured && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-center gap-2 non-printable" id="nem-key-warning">
          <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
          <span>
            Atención: Falta configurar tu clave <strong>GEMINI_API_KEY</strong> en la pestaña de Secretos (esquina superior derecha en AI Studio). Las sugerencias e IA no podrán activarse hasta añadirla.
          </span>
        </div>
      )}

      {/* Main Header */}
      <header className="bg-slate-900 text-white py-5 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between border-b border-slate-800 shadow-sm non-printable" id="nem-navigation-navbar">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl shadow-md text-white">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              Planeador Escolar NEM
            </h1>
            <p className="text-xs text-indigo-200 mt-0.5 tracking-wide">
              Sistema de Alineación y Codiseño Curricular • Plan de Estudios 2022 México
            </p>
          </div>
        </div>

        {/* Global tab Switchers */}
        <div className="flex bg-slate-800 p-1 rounded-xl mt-4 md:mt-0 border border-slate-700" id="nem-tabs-selector">
          <button
            onClick={() => {
              setActivePlan(null);
              setActiveTab("crear");
            }}
            className={`px-4.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
              activeTab === "crear" && !activePlan
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-350 hover:text-white"
            }`}
          >
            Alineación con IA
          </button>
          
          <button
            onClick={() => {
              setActivePlan(null);
              setActiveTab("biblioteca");
            }}
            className={`px-4.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
              activeTab === "biblioteca" && !activePlan
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-350 hover:text-white"
            }`}
          >
            Mis Planeaciones
          </button>

          <button
            onClick={() => {
              setActivePlan(null);
              setActiveTab("guia");
            }}
            className={`px-4.5 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
              activeTab === "guia" && !activePlan
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-350 hover:text-white"
            }`}
          >
            Guía Escolar (NEM)
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-12 py-8">
        {/* VIEW ACTIVE GENERATED DOCUMENT / WORKSPACE */}
        {activePlan ? (
          <PlaneacionViewer 
            plan={activePlan} 
            onBack={() => setActivePlan(null)} 
            onSaveSuccess={handleSaveSuccess} 
          />
        ) : isGenerating ? (
          /* Rich loading animation */
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-slate-150 p-6 shadow-sm">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-indigo-150 border-t-indigo-600 rounded-full animate-spin"></div>
              <Sparkles className="w-6 h-6 text-amber-500 absolute animate-pulse" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mt-6 tracking-tight">
              Estructurando tu Planeación Pedagógica
            </h3>
            
            <p className="text-xs text-slate-500 max-w-md text-center mt-2 leading-relaxed">
              El asistente de Inteligencia Artificial está alineando los campos formativos elegidos, organizando las actividades por momentos/fases de co-diseño e incorporando los ejes articuladores. Tardará unos segundos...
            </p>

            <div className="bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600 px-4 py-2 mt-6 rounded-lg animate-pulse uppercase tracking-widest">
              Conectado de forma segura con la API de Gemini
            </div>
          </div>
        ) : (
          /* WORKSPACE PANELS BASED ON TAB STATE */
          <div className="space-y-6">
            {activeTab === "crear" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-150 p-6 md:p-8 shadow-xs">
                  <h2 className="text-lg font-bold text-slate-850 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                    Asistente de Planeación Inteligente
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                    Especifica la problemática del centro escolar, elige la fase escolar, campo formativo, y usa la IA para redactar la planeación basada exactamente en los programas SEP vigentes de la Nueva Escuela Mexicana.
                  </p>
                </div>

                <PlaneacionForm 
                  onGenerate={handleGenerate} 
                  isLoading={isGenerating} 
                  prefillData={duplicatePrefill} 
                />
              </div>
            )}

            {activeTab === "biblioteca" && (
              <Library
                onSelectPlan={(plan) => setActivePlan(plan)}
                onDuplicatePlan={(plan) => {
                  setDuplicatePrefill({
                    ...plan,
                    id: undefined, // Clear id for duplication
                    tituloProyecto: plan.tituloProyecto + " (Copia)"
                  });
                  setActiveTab("crear");
                }}
                onNewPlanRequest={() => {
                  setDuplicatePrefill(null);
                  setActiveTab("crear");
                }}
                activePlanId={activePlan?.id}
              />
            )}

            {activeTab === "guia" && <ReferenceGuide />}
          </div>
        )}
      </main>

      {/* Humble educational footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-16 text-center text-xs text-slate-400 font-medium non-printable" id="nem-root-footer">
        <p>Planeador de Clases Inteligente según la Nueva Escuela Mexicana (NEM)</p>
        <p className="mt-1 font-mono text-[10px]">Compilación de Grados SEP • Realizado con API Gemini • Guardado Local y Nube Activado</p>
      </footer>
    </div>
  );
}

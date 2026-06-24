import { useEffect, useState } from "react";
import { Planeacion } from "../types";
import { db, collection, getDocs, deleteDoc, doc, query, orderBy } from "../lib/firebase";
import { CAMPOS_FORMATIVOS } from "../data/schoolReference";
import { Library as LibraryIcon, Calendar, User, School, Trash2, Printer, Copy, FileEdit, Network, CloudRain, HeartHandshake, CloudOff, RefreshCw } from "lucide-react";

interface LibraryProps {
  onSelectPlan: (plan: Planeacion) => void;
  onDuplicatePlan: (plan: Planeacion) => void;
  onNewPlanRequest: () => void;
  activePlanId?: string;
}

export default function Library({ onSelectPlan, onDuplicatePlan, onNewPlanRequest, activePlanId }: LibraryProps) {
  const [plans, setPlans] = useState<Planeacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string | undefined; index: number; title: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Load plans from cloud and local cache
  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    let loadedPlans: Planeacion[] = [];

    // Try LocalStorage first
    try {
      const localStr = localStorage.getItem("nem_planeaciones");
      if (localStr) {
        loadedPlans = JSON.parse(localStr);
      }
    } catch (e) {
      console.error("Error reading from localstorage", e);
    }

    // Then attempt Firestore load
    try {
      const q = query(collection(db, "planeaciones"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const cloudPlans: Planeacion[] = [];
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        let safeDate = new Date();
        if (d.createdAt) {
          if (typeof d.createdAt.toDate === "function") {
            safeDate = d.createdAt.toDate();
          } else {
            safeDate = new Date(d.createdAt);
          }
        }
        cloudPlans.push({
          id: docSnap.id,
          ...d,
          createdAt: safeDate
        } as Planeacion);
      });

      // Merge and remove duplicates (prefer cloud records, but keep unique local ones)
      if (cloudPlans.length > 0) {
        // Create map by comparison of titles or ids
        const mergedMap = new Map<string, Planeacion>();
        
        // Add local ones first
        loadedPlans.forEach(lp => {
          if (lp.id) mergedMap.set(lp.id, lp);
          else mergedMap.set(lp.tituloProyecto + lp.createdAt, lp);
        });

        // Overwrite or add cloud ones
        cloudPlans.forEach(cp => {
          if (cp.id) mergedMap.set(cp.id, cp);
        });

        loadedPlans = Array.from(mergedMap.values());
        
        // Save merged list back to local for cache
        localStorage.setItem("nem_planeaciones", JSON.stringify(loadedPlans));
        setIsOffline(false);
      }
    } catch (err: any) {
      console.warn("Could not load from firestore. Showing cached/local plans.", err);
      setIsOffline(true);
      // We still have local ones loaded, so it's fine!
    }

    // Sort by date desc
    loadedPlans.sort((a,b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    setPlans(loadedPlans);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeleteRequest = (id: string | undefined, index: number, title: string) => {
    setDeleteConfirm({ id, index, title });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    const { id, index } = deleteConfirm;
    const targetKey = id || `local-${index}`;

    try {
      setDeletingId(targetKey);
      // 1. Delete from Firestore if it has an id
      if (id && !isOffline) {
        await deleteDoc(doc(db, "planeaciones", id));
      }

      // 2. Delete from local cache list
      const updated = [...plans];
      updated.splice(index, 1);
      setPlans(updated);
      localStorage.setItem("nem_planeaciones", JSON.stringify(updated));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert("Error al eliminar la planeación: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getCampoColor = (campoName: string) => {
    const c = CAMPOS_FORMATIVOS.find(item => item.nombre.toLowerCase().trim() === campoName.toLowerCase().trim() || campoName.toLowerCase().includes(item.id));
    return c ? c.color : "bg-slate-100 text-slate-800 border-slate-200";
  };

  return (
    <div className="space-y-6" id="nem-library-panel">
      {/* Search and sync row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 shrink-0">
            <LibraryIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Mi Biblioteca de Planeaciones</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Administra todas tus planeaciones didácticas guardadas localmente y en la nube.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isOffline ? (
            <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs px-2.5 py-1.5 rounded-lg border border-amber-200">
              <CloudOff className="w-3.5 h-3.5" />
              Solo Local
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1.5 rounded-lg border border-emerald-200">
              <CloudRain className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              Nube Sincronizada
            </span>
          )}

          <button
            onClick={fetchPlans}
            title="Recargar Biblioteca"
            className="p-2 bg-white text-slate-650 hover:text-indigo-600 border border-slate-200 rounded-lg hover:shadow-xs transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onNewPlanRequest}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-medium rounded-lg transition shadow-xs"
          >
            Nueva Planeación
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-xs">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm mt-4 font-medium">Buscando archivos de planeación...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-150 p-6">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400 mb-4">
            <LibraryIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-800">No tienes planeaciones guardadas</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Comienza a estructurar tus clases utilizando el asistente con Inteligencia Artificial. Podrás guardar y reutilizar todas tus planeaciones en cualquier momento.
          </p>
          <button
            onClick={onNewPlanRequest}
            className="mt-5 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-semibold transition"
          >
            Crear primera planeación
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan, index) => {
            const dateStr = plan.createdAt 
              ? new Date(plan.createdAt).toLocaleDateString("es-MX", { day: 'numeric', month: 'short', year: 'numeric' })
              : "Reciente";

            const isActive = plan.id === activePlanId;

            return (
              <div 
                key={plan.id || index}
                className={`flex flex-col justify-between bg-white rounded-2xl border text-left hover:shadow-md transition-all relative ${
                  isActive 
                    ? "border-indigo-500 ring-2 ring-indigo-500/15" 
                    : "border-slate-200/70"
                }`}
              >
                {/* Header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50/75 border border-indigo-100 px-2.5 py-0.5 rounded-full font-mono uppercase">
                      {plan.grado} • {plan.fase}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-slate-850 hover:text-indigo-600 transition leading-snug line-clamp-2">
                    {plan.tituloProyecto}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed italic">
                    {plan.resumen || "Sin resumen descriptor disponible."}
                  </p>

                  {/* Badge Campo */}
                  <div className="mt-4 flex flex-wrap gap-1.5 items-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${getCampoColor(plan.campoFormativo)}`}>
                      {plan.campoFormativo}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-semibold">
                      {plan.metodologia?.replace(/\(.*?\)/g, "").trim() || "Proyectos"}
                    </span>
                    {plan.tipoPlaneacion && plan.tipoPlaneacion !== "Proyecto" && (
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold uppercase">
                        {plan.tipoPlaneacion}
                      </span>
                    )}
                  </div>

                  {/* Metadata teacher/school */}
                  <div className="border-t border-slate-100 pt-3 mt-4 space-y-1 text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Prof: {plan.docente || "No registrado"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <School className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">Esc: {plan.escuela || "No registrada"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 rounded-b-2xl flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectPlan(plan)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white border border-slate-250 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 text-xs font-semibold rounded-lg shadow-2xs transition"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Abrir Editor
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDuplicatePlan(plan)}
                      title="Duplicar / Ajustar"
                      className="p-2 bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-lg hover:shadow-xs transition"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRequest(plan.id, index, plan.tituloProyecto)}
                      title="Eliminar"
                      className="p-2 bg-white text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg hover:shadow-xs transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 p-6 shadow-2xl relative transform transition duration-300 scale-100 flex flex-col">
            <div className="w-12 h-12 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>

            <h3 className="text-base md:text-lg font-bold text-slate-900">
              ¿Eliminar esta planeación?
            </h3>
            
            <p className="text-xs md:text-sm text-slate-500 mt-2 leading-relaxed">
              Estás a punto de eliminar la planeación <strong className="text-slate-800 font-semibold">"{deleteConfirm.title}"</strong> de tu biblioteca de manera permanente. Esta acción no se puede deshacer.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deletingId !== null}
                onClick={executeDelete}
                className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-100 hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {deletingId !== null ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Eliminando...
                  </>
                ) : (
                  "Eliminar para siempre"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

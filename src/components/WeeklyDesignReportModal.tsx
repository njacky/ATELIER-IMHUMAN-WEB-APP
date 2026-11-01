import React, { useState } from 'react';
import { ClientGroup, Deliverable, DesignStagesReport, DesignStageStatus, WeeklyStageReport } from '../types';
import {
  X,
  Lightbulb,
  Compass,
  Box,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Save,
  ChevronRight,
  TrendingUp,
  FileCheck,
  RotateCcw,
} from 'lucide-react';

interface WeeklyDesignReportModalProps {
  isOpen: boolean;
  deliverable: Deliverable | null;
  client: ClientGroup | null;
  onClose: () => void;
  onSave: (clientId: string, deliverableId: string, updatedStages: DesignStagesReport) => void;
  isDark: boolean;
  initialStageTab?: 'ideation' | 'concepting' | 'modeling';
}

const STATUS_CONFIG: Record<DesignStageStatus, { label: string; color: string; bg: string; border: string }> = {
  'not started': {
    label: 'Not Started',
    color: 'text-[#888888]',
    bg: 'bg-[#141414]',
    border: 'border-[#262626]',
  },
  'in progress': {
    label: 'In Progress',
    color: 'text-sky-400',
    bg: 'bg-sky-950/30',
    border: 'border-sky-800/50',
  },
  'in review': {
    label: 'In Review',
    color: 'text-[#E63946]',
    bg: 'bg-[#E63946]/10',
    border: 'border-[#E63946]/30',
  },
  'completed': {
    label: 'Completed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-800/50',
  },
};

const STATUS_LIST: DesignStageStatus[] = ['not started', 'in progress', 'in review', 'completed'];

const WEEKS_LIST = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4', 'Minggu 5', 'Minggu 6', 'Minggu 7', 'Minggu 8'];

export const WeeklyDesignReportModal: React.FC<WeeklyDesignReportModalProps> = ({
  isOpen,
  deliverable,
  client,
  onClose,
  onSave,
  isDark,
  initialStageTab = 'ideation',
}) => {
  if (!isOpen || !deliverable || !client) return null;

  const [activeTab, setActiveTab] = useState<'all' | 'ideation' | 'concepting' | 'modeling'>('all');
  const [currentWeek, setCurrentWeek] = useState<string>(deliverable.designStages?.currentWeek || 'Minggu 1');

  // Form states initialized from deliverable
  const [ideation, setIdeation] = useState<WeeklyStageReport>({
    status: deliverable.designStages?.ideation?.status || 'in progress',
    week: deliverable.designStages?.ideation?.week || 'Minggu 1',
    progress: deliverable.designStages?.ideation?.progress ?? 50,
    note: deliverable.designStages?.ideation?.note || '',
  });

  const [concepting, setConcepting] = useState<WeeklyStageReport>({
    status: deliverable.designStages?.concepting?.status || 'not started',
    week: deliverable.designStages?.concepting?.week || 'Minggu 2',
    progress: deliverable.designStages?.concepting?.progress ?? 0,
    note: deliverable.designStages?.concepting?.note || '',
  });

  const [modeling, setModeling] = useState<WeeklyStageReport>({
    status: deliverable.designStages?.modeling?.status || 'not started',
    week: deliverable.designStages?.modeling?.week || 'Minggu 3',
    progress: deliverable.designStages?.modeling?.progress ?? 0,
    note: deliverable.designStages?.modeling?.note || '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdateStage = (
    stageKey: 'ideation' | 'concepting' | 'modeling',
    updated: Partial<WeeklyStageReport>
  ) => {
    setHasChanges(true);
    if (stageKey === 'ideation') setIdeation((prev) => ({ ...prev, ...updated }));
    if (stageKey === 'concepting') setConcepting((prev) => ({ ...prev, ...updated }));
    if (stageKey === 'modeling') setModeling((prev) => ({ ...prev, ...updated }));
  };

  const handleResetStage = (stageKey: 'ideation' | 'concepting' | 'modeling') => {
    if (confirm(`Kosongkan & reset data tahap ${stageKey.toUpperCase()}? (Status, progres, dan catatan akan direset)`)) {
      handleUpdateStage(stageKey, {
        status: 'not started',
        progress: 0,
        note: '',
      });
    }
  };

  const handleSave = () => {
    const updatedStages: DesignStagesReport = {
      currentWeek,
      ideation,
      concepting,
      modeling,
    };
    onSave(client.id, deliverable.id, updatedStages);
    setHasChanges(false);
    onClose();
  };

  // Quick preset notes for architectural studio
  const IDEATION_PROMPTS = [
    'Survey tapak, analisis iklim mikrokosmik & topografi',
    'Studi preseden vernakular & riset regulasi tata ruang',
    'Sketsa diagram bubble sirkulasi & zonasi spasial',
  ];

  const CONCEPTING_PROMPTS = [
    'Artikulasi massa arsitektural & narasi filosofi konsep',
    'Skema pencahayaan alami, bukaan ventilasi silang & akustik',
    'Pemilihan mood material primer: beton, kayu ulin, & baja',
  ];

  const MODELING_PROMPTS = [
    'Pemodelan digital 3D Rhino / SketchUp massa utama',
    'Penyusunan BIM Revit, denah elevasi & shop drawing awal',
    'Render preliminary visualisasi eksterior & simulasi bayangan solar',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div
        id="weekly-report-modal"
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg border shadow-2xl overflow-hidden ${
          isDark ? 'bg-[#0E0E0E] border-[#222222] text-[#E0E0E0]' : 'bg-white border-neutral-300 text-neutral-800'
        }`}
      >
        {/* MODAL HEADER */}
        <div className={`p-5 border-b flex items-start justify-between ${
          isDark ? 'border-[#1A1A1A] bg-[#0A0A0A]' : 'border-neutral-200 bg-neutral-50'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-[#E63946] font-medium">{deliverable.projectNumber}</span>
              <span className="text-xs text-[#666666]">•</span>
              <span className="text-xs text-[#888888] font-normal">{client.name}</span>
            </div>
            <h2 className="text-base font-medium text-white tracking-wide">
              {deliverable.name} — <span className="text-[#E63946]">Laporan Perminggu Tahapan Desain</span>
            </h2>
            <p className="text-xs text-[#777777] mt-0.5 font-normal">
              Monitoring berkala tiga tahapan perancangan arsitektur: Ideation, Concepting, dan Modeling.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-close-weekly-report"
              onClick={onClose}
              className="p-1.5 rounded text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WEEK SELECTION BAR */}
        <div className={`px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs ${
          isDark ? 'border-[#1A1A1A] bg-[#111111]' : 'border-neutral-200 bg-neutral-100'
        }`}>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
            <span className="text-[#888888] font-medium uppercase tracking-wider text-[10px]">Fokus Periode Laporan:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {WEEKS_LIST.map((w) => (
                <button
                  key={w}
                  id={`btn-select-week-${w.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => {
                    setCurrentWeek(w);
                    setHasChanges(true);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-normal transition-colors ${
                    currentWeek === w
                      ? 'bg-[#E63946] text-white'
                      : isDark
                      ? 'bg-[#1A1A1A] text-[#888888] hover:text-white'
                      : 'bg-white text-neutral-600 hover:text-black border border-neutral-200'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filter tabs */}
          <div className="flex items-center gap-1 bg-[#0A0A0A] p-0.5 rounded border border-[#1E1E1E]">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium tracking-wider transition-colors ${
                activeTab === 'all' ? 'bg-[#1E1E1E] text-white' : 'text-[#777777] hover:text-white'
              }`}
            >
              Semua Tahap
            </button>
            <button
              onClick={() => setActiveTab('ideation')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium tracking-wider transition-colors ${
                activeTab === 'ideation' ? 'bg-[#1E1E1E] text-white' : 'text-[#777777] hover:text-white'
              }`}
            >
              Ideation
            </button>
            <button
              onClick={() => setActiveTab('concepting')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium tracking-wider transition-colors ${
                activeTab === 'concepting' ? 'bg-[#1E1E1E] text-white' : 'text-[#777777] hover:text-white'
              }`}
            >
              Concepting
            </button>
            <button
              onClick={() => setActiveTab('modeling')}
              className={`px-2 py-0.5 rounded text-[10px] uppercase font-medium tracking-wider transition-colors ${
                activeTab === 'modeling' ? 'bg-[#1E1E1E] text-white' : 'text-[#777777] hover:text-white'
              }`}
            >
              Modeling
            </button>
          </div>
        </div>

        {/* MODAL BODY: 3 STAGES CARDS */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* 1. IDEATION */}
          {(activeTab === 'all' || activeTab === 'ideation') && (
            <div
              id="card-stage-ideation"
              className={`p-4 rounded-lg border transition-all ${
                isDark ? 'bg-[#121212] border-[#222222]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white tracking-wide">1. Ideation</h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] font-normal">
                        Riset & Analisis Tapak
                      </span>
                    </div>
                    <span className="text-[11px] text-[#777777] font-normal">Target: {ideation.week}</span>
                  </div>
                </div>

                {/* Status selector & progress */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#777777]">Status:</span>
                    <select
                      id="select-ideation-status"
                      value={ideation.status}
                      onChange={(e) => handleUpdateStage('ideation', { status: e.target.value as DesignStageStatus })}
                      className={`text-[11px] font-normal px-2.5 py-1 rounded border focus:outline-none cursor-pointer ${
                        STATUS_CONFIG[ideation.status].bg
                      } ${STATUS_CONFIG[ideation.status].color} ${STATUS_CONFIG[ideation.status].border}`}
                    >
                      {STATUS_LIST.map((s) => (
                        <option key={s} value={s} className="bg-[#111111] text-white">
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-[#0A0A0A] px-2.5 py-1 rounded border border-[#1E1E1E]">
                    <span className="text-[10px] text-[#888888]">Progres:</span>
                    <span className="font-mono text-xs text-white font-medium">{ideation.progress}%</span>
                  </div>

                  <button
                    type="button"
                    title="Kosongkan & reset tahap Ideation jika salah input"
                    onClick={() => handleResetStage('ideation')}
                    className="p-1 text-[#666666] hover:text-[#E63946] hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={ideation.progress}
                  onChange={(e) => handleUpdateStage('ideation', { progress: Number(e.target.value) })}
                  className="w-full accent-[#E63946] cursor-pointer h-1.5 bg-[#1A1A1A] rounded-lg"
                />
              </div>

              {/* Weekly report note / narrative textbox */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-amber-400 font-medium">
                    Ceritakan Sudah Sampai Mana (Ideation):
                  </label>
                  <span className="text-[10px] text-[#777777] font-mono">
                    {ideation.note ? `${ideation.note.length} karakter` : 'Isi narasi progres'}
                  </span>
                </div>
                <textarea
                  id="textarea-ideation-note"
                  rows={3}
                  value={ideation.note}
                  onChange={(e) => handleUpdateStage('ideation', { note: e.target.value })}
                  placeholder="Ceritakan secara mendalam di tahap Ideation ini sudah sampai mana (misal: sketsa denah tangan, site visit & analisis iklim, bubble diagram hubungan ruang, moodboard material arsitektur)..."
                  className={`w-full p-2.5 text-xs rounded border transition-colors resize-y leading-relaxed focus:outline-none focus:border-[#E63946] ${
                    isDark ? 'bg-[#0A0A0A] border-[#222222] text-[#E0E0E0] placeholder-[#555555]' : 'bg-white border-neutral-300 text-neutral-800'
                  }`}
                />
                {/* Prompt suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] text-[#555555] uppercase font-medium">Quick Tag:</span>
                  {IDEATION_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleUpdateStage('ideation', { note: ideation.note ? `${ideation.note}; ${p}` : p })}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#888888] hover:text-white border border-[#262626] transition-colors"
                    >
                      + {p.split(' ')[0]} {p.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. CONCEPTING */}
          {(activeTab === 'all' || activeTab === 'concepting') && (
            <div
              id="card-stage-concepting"
              className={`p-4 rounded-lg border transition-all ${
                isDark ? 'bg-[#121212] border-[#222222]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white tracking-wide">2. Concepting</h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] font-normal">
                        Artikulasi & Skematik
                      </span>
                    </div>
                    <span className="text-[11px] text-[#777777] font-normal">Target: {concepting.week}</span>
                  </div>
                </div>

                {/* Status selector & progress */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#777777]">Status:</span>
                    <select
                      id="select-concepting-status"
                      value={concepting.status}
                      onChange={(e) => handleUpdateStage('concepting', { status: e.target.value as DesignStageStatus })}
                      className={`text-[11px] font-normal px-2.5 py-1 rounded border focus:outline-none cursor-pointer ${
                        STATUS_CONFIG[concepting.status].bg
                      } ${STATUS_CONFIG[concepting.status].color} ${STATUS_CONFIG[concepting.status].border}`}
                    >
                      {STATUS_LIST.map((s) => (
                        <option key={s} value={s} className="bg-[#111111] text-white">
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-[#0A0A0A] px-2.5 py-1 rounded border border-[#1E1E1E]">
                    <span className="text-[10px] text-[#888888]">Progres:</span>
                    <span className="font-mono text-xs text-white font-medium">{concepting.progress}%</span>
                  </div>

                  <button
                    type="button"
                    title="Kosongkan & reset tahap Concepting jika salah input"
                    onClick={() => handleResetStage('concepting')}
                    className="p-1 text-[#666666] hover:text-[#E63946] hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={concepting.progress}
                  onChange={(e) => handleUpdateStage('concepting', { progress: Number(e.target.value) })}
                  className="w-full accent-[#E63946] cursor-pointer h-1.5 bg-[#1A1A1A] rounded-lg"
                />
              </div>

              {/* Weekly report note / narrative textbox */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-indigo-400 font-medium">
                    Ceritakan Sudah Sampai Mana (Concepting):
                  </label>
                  <span className="text-[10px] text-[#777777] font-mono">
                    {concepting.note ? `${concepting.note.length} karakter` : 'Isi narasi progres'}
                  </span>
                </div>
                <textarea
                  id="textarea-concepting-note"
                  rows={3}
                  value={concepting.note}
                  onChange={(e) => handleUpdateStage('concepting', { note: e.target.value })}
                  placeholder="Ceritakan secara mendalam di tahap Concepting ini sudah sampai mana (misal: formulasi filosofi konsep desain, skema proporsi volumetrik, zoning sirkulasi, studi materialitas)..."
                  className={`w-full p-2.5 text-xs rounded border transition-colors resize-y leading-relaxed focus:outline-none focus:border-[#E63946] ${
                    isDark ? 'bg-[#0A0A0A] border-[#222222] text-[#E0E0E0] placeholder-[#555555]' : 'bg-white border-neutral-300 text-neutral-800'
                  }`}
                />
                {/* Prompt suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] text-[#555555] uppercase font-medium">Quick Tag:</span>
                  {CONCEPTING_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleUpdateStage('concepting', { note: concepting.note ? `${concepting.note}; ${p}` : p })}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#888888] hover:text-white border border-[#262626] transition-colors"
                    >
                      + {p.split(' ')[0]} {p.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. MODELING */}
          {(activeTab === 'all' || activeTab === 'modeling') && (
            <div
              id="card-stage-modeling"
              className={`p-4 rounded-lg border transition-all ${
                isDark ? 'bg-[#121212] border-[#222222]' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-[#E63946]">
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white tracking-wide">3. Modeling</h3>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[#888888] font-normal">
                        Digital 3D & Visualisasi
                      </span>
                    </div>
                    <span className="text-[11px] text-[#777777] font-normal">Target: {modeling.week}</span>
                  </div>
                </div>

                {/* Status selector & progress */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#777777]">Status:</span>
                    <select
                      id="select-modeling-status"
                      value={modeling.status}
                      onChange={(e) => handleUpdateStage('modeling', { status: e.target.value as DesignStageStatus })}
                      className={`text-[11px] font-normal px-2.5 py-1 rounded border focus:outline-none cursor-pointer ${
                        STATUS_CONFIG[modeling.status].bg
                      } ${STATUS_CONFIG[modeling.status].color} ${STATUS_CONFIG[modeling.status].border}`}
                    >
                      {STATUS_LIST.map((s) => (
                        <option key={s} value={s} className="bg-[#111111] text-white">
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 bg-[#0A0A0A] px-2.5 py-1 rounded border border-[#1E1E1E]">
                    <span className="text-[10px] text-[#888888]">Progres:</span>
                    <span className="font-mono text-xs text-white font-medium">{modeling.progress}%</span>
                  </div>

                  <button
                    type="button"
                    title="Kosongkan & reset tahap Modeling jika salah input"
                    onClick={() => handleResetStage('modeling')}
                    className="p-1 text-[#666666] hover:text-[#E63946] hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Slider */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={modeling.progress}
                  onChange={(e) => handleUpdateStage('modeling', { progress: Number(e.target.value) })}
                  className="w-full accent-[#E63946] cursor-pointer h-1.5 bg-[#1A1A1A] rounded-lg"
                />
              </div>

              {/* Weekly report note / narrative textbox */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-rose-400 font-medium">
                    Ceritakan Sudah Sampai Mana (Modeling):
                  </label>
                  <span className="text-[10px] text-[#777777] font-mono">
                    {modeling.note ? `${modeling.note.length} karakter` : 'Isi narasi progres'}
                  </span>
                </div>
                <textarea
                  id="textarea-modeling-note"
                  rows={3}
                  value={modeling.note}
                  onChange={(e) => handleUpdateStage('modeling', { note: e.target.value })}
                  placeholder="Ceritakan secara mendalam di tahap Modeling ini sudah sampai mana (misal: pemodelan BIM 3D Revit/Rhino, rendering visual eksterior/interior, persiapan gambar kerja DED, detail konstruksi)..."
                  className={`w-full p-2.5 text-xs rounded border transition-colors resize-y leading-relaxed focus:outline-none focus:border-[#E63946] ${
                    isDark ? 'bg-[#0A0A0A] border-[#222222] text-[#E0E0E0] placeholder-[#555555]' : 'bg-white border-neutral-300 text-neutral-800'
                  }`}
                />
                {/* Prompt suggestions */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[9px] text-[#555555] uppercase font-medium">Quick Tag:</span>
                  {MODELING_PROMPTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleUpdateStage('modeling', { note: modeling.note ? `${modeling.note}; ${p}` : p })}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#1A1A1A] text-[#888888] hover:text-white border border-[#262626] transition-colors"
                    >
                      + {p.split(' ')[0]} {p.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-[#1A1A1A] bg-[#0A0A0A]' : 'border-neutral-200 bg-neutral-50'
        }`}>
          <div className="text-[11px] text-[#777777] font-normal flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Perubahan otomatis disinkronisasi ke Notion Table & Vault Atelier Inhuman</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-weekly-report"
              onClick={onClose}
              className="px-3 py-1.5 rounded text-xs font-normal text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition-colors"
            >
              Batal
            </button>
            <button
              id="btn-save-weekly-report"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium uppercase tracking-wider bg-[#E63946] hover:bg-[#A01A26] text-white transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Laporan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  ClientGroup,
  Deliverable,
  ProjectType,
  ProjectStatus,
  ProjectFile,
  DesignStageStatus,
  DesignStagesReport,
} from '../types';
import {
  Plus,
  ChevronDown,
  ChevronRight,
  Upload,
  FileText,
  Trash2,
  Calendar,
  ExternalLink,
  MapPin,
  Maximize2,
  Users,
  Film,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  MoreVertical,
  Paperclip,
  Lightbulb,
  Compass,
  Box,
  SlidersHorizontal,
  Pencil,
} from 'lucide-react';
import { formatDisplayDate, getDeadlineUrgency } from '../lib/dateUtils';
import { formatFileSize, getDefaultDesignStages } from '../lib/storage';
import { WeeklyDesignReportModal } from './WeeklyDesignReportModal';
import { EditProjectModal } from './EditProjectModal';
import { EditClientModal } from './EditClientModal';

interface NotionTableViewProps {
  clients: ClientGroup[];
  onUpdateClient: (clientId: string, updated: Partial<ClientGroup>) => void;
  onUpdateDeliverable: (clientId: string, deliverableId: string, updated: Partial<Deliverable>) => void;
  onDeleteDeliverable: (clientId: string, deliverableId: string) => void;
  onDeleteClient: (clientId: string) => void;
  onAddDeliverable: (clientId: string) => void;
  onOpenFileDrawer: (deliverable: Deliverable, client: ClientGroup) => void;
  isDark: boolean;
  selectedClientId: string | null;
  searchQuery: string;
  statusFilter: string;
}

export const NotionTableView: React.FC<NotionTableViewProps> = ({
  clients,
  onUpdateClient,
  onUpdateDeliverable,
  onDeleteDeliverable,
  onDeleteClient,
  onAddDeliverable,
  onOpenFileDrawer,
  isDark,
  selectedClientId,
  searchQuery,
  statusFilter,
}) => {
  const [collapsedClients, setCollapsedClients] = useState<Record<string, boolean>>({});
  const [stageModalData, setStageModalData] = useState<{
    deliverable: Deliverable;
    client: ClientGroup;
    initialStage?: 'ideation' | 'concepting' | 'modeling';
  } | null>(null);
  const [editingDeliverableData, setEditingDeliverableData] = useState<{
    deliverable: Deliverable;
    client: ClientGroup;
  } | null>(null);
  const [editingClientData, setEditingClientData] = useState<ClientGroup | null>(null);

  const toggleClientCollapse = (clientId: string) => {
    setCollapsedClients((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const STAGE_STATUS_STYLES: Record<DesignStageStatus, { bg: string; text: string; border: string; label: string }> = {
    'not started': {
      bg: 'bg-[#141414]',
      text: 'text-[#888888]',
      border: 'border-[#262626]',
      label: 'Not Started',
    },
    'in progress': {
      bg: 'bg-sky-950/40',
      text: 'text-sky-400',
      border: 'border-sky-800/50',
      label: 'In Progress',
    },
    'in review': {
      bg: 'bg-[#E63946]/10',
      text: 'text-[#E63946]',
      border: 'border-[#E63946]/30',
      label: 'In Review',
    },
    'completed': {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-800/50',
      label: 'Completed',
    },
  };

  // Filter clients based on selected client, search query, and status filter
  const filteredClients = clients
    .filter((client) => !selectedClientId || client.id === selectedClientId)
    .map((client) => {
      const matchingDeliverables = client.deliverables.filter((del) => {
        const matchesSearch =
          !searchQuery ||
          del.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          del.projectNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          del.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          del.detailType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.concept.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = !statusFilter || del.status === statusFilter;

        return matchesSearch && matchesStatus;
      });

      return {
        ...client,
        deliverables: matchingDeliverables,
      };
    })
    .filter((client) => client.deliverables.length > 0 || !searchQuery);

  const PROJECT_TYPES: ProjectType[] = [
    'residential',
    'office',
    'retail',
    'hospitality',
    'public spaces',
  ];

  const STATUS_OPTIONS: { value: ProjectStatus; label: string; color: string }[] = [
    { value: 'not started', label: 'Not Started', color: 'bg-[#1A1A1A] text-[#888888] border-[#333333]' },
    { value: 'in review', label: 'In Review', color: 'bg-[#1A1A1A] text-[#E63946] border-[#E63946]/40 font-medium' },
    { value: 'completed', label: 'Completed', color: 'bg-[#1A1A1A] text-emerald-400 border-emerald-500/40 font-medium' },
  ];

  // Helper for type tag styling
  const getTypeTagColor = (type: ProjectType) => {
    switch (type) {
      case 'residential':
        return 'bg-[#1A1A1A] text-[#E0E0E0] border-[#333333]';
      case 'office':
        return 'bg-[#1A1A1A] text-[#E0E0E0] border-[#333333]';
      case 'retail':
        return 'bg-[#1A1A1A] text-[#E0E0E0] border-[#333333]';
      case 'hospitality':
        return 'bg-[#1A1A1A] text-[#E0E0E0] border-[#333333]';
      case 'public spaces':
        return 'bg-[#1A1A1A] text-[#E0E0E0] border-[#333333]';
      default:
        return 'bg-[#1A1A1A] text-[#888888] border-[#333333]';
    }
  };

  const renderFileIcon = (category: string) => {
    switch (category) {
      case 'pdf':
        return <span className="px-1 py-0.2 bg-[#E63946]/20 text-[#E63946] border border-[#E63946]/40 rounded font-medium text-[9px]">PDF</span>;
      case 'presentation':
        return <span className="px-1 py-0.2 bg-amber-950/40 text-amber-400 border border-amber-800/60 rounded font-medium text-[9px]">PPT</span>;
      case 'video':
        return <span className="px-1 py-0.2 bg-purple-950/40 text-purple-400 border border-purple-800/60 rounded font-medium text-[9px]">MP4</span>;
      case 'sheet':
        return <span className="px-1 py-0.2 bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 rounded font-medium text-[9px]">XLS</span>;
      case 'document':
        return <span className="px-1 py-0.2 bg-blue-950/40 text-blue-400 border border-blue-800/60 rounded font-medium text-[9px]">DOC</span>;
      default:
        return <span className="px-1 py-0.2 bg-[#1A1A1A] text-[#888888] border border-[#333333] rounded font-medium text-[9px]">FILE</span>;
    }
  };

  return (
    <div id="notion-database-view" className="space-y-8 pb-20">
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center rounded-lg border border-dashed border-[#1A1A1A] bg-[#111111]/60">
          <Layers className="w-10 h-10 mx-auto text-[#555555] mb-3" />
          <h3 className="text-sm font-medium text-[#E0E0E0] uppercase tracking-wider">No matching projects found</h3>
          <p className="text-xs text-[#666666] mt-1 max-w-sm mx-auto">
            Try adjusting your search keyword or status filter, or create a new deliverable using the + New Project button.
          </p>
        </div>
      ) : (
        filteredClients.map((client) => {
          const isCollapsed = !!collapsedClients[client.id];
          const totalDeliverables = client.deliverables.length;

          return (
            <div
              key={client.id}
              id={`client-group-${client.id}`}
              className={`rounded-lg border transition-all duration-200 overflow-hidden ${
                isDark
                  ? 'bg-[#111111] border-[#1A1A1A]'
                  : 'bg-white border-neutral-200 shadow-sm'
              }`}
            >
              {/* CLIENT HEADER SECTION */}
              <div
                className={`px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b ${
                  isDark ? 'border-[#1A1A1A] bg-[#0F0F0F]' : 'border-neutral-200 bg-neutral-50/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleClientCollapse(client.id)}
                    className="p-1 text-[#666666] hover:text-white rounded hover:bg-[#1A1A1A] transition-colors"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-[#666666]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#E63946]" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className={`text-sm font-medium tracking-wider flex items-center gap-2 uppercase ${
                        isDark ? 'text-white' : 'text-neutral-900'
                      }`}>
                        {client.name}
                      </h2>
                      <span className={`px-2 py-0.5 text-[9px] font-medium rounded border ${
                        isDark ? 'bg-[#1A1A1A] text-[#888888] border-[#1A1A1A]' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}>
                        {totalDeliverables} {totalDeliverables === 1 ? 'Phase' : 'Phases'}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#555555] flex items-center gap-2 mt-0.5">
                      <span className="text-[#E63946] font-medium uppercase tracking-wider">Atelier INHM</span>
                      <span>•</span>
                      <span>Client Directory</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id={`btn-edit-client-${client.id}`}
                    title="Edit info client & konsep"
                    onClick={() => setEditingClientData(client)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-normal rounded transition-colors cursor-pointer ${
                      isDark
                        ? 'text-[#888888] hover:text-white hover:bg-[#1A1A1A] border border-[#222222]'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200'
                    }`}
                  >
                    <Pencil className="w-3 h-3 text-[#E63946]" />
                    <span>Edit Client</span>
                  </button>

                  <button
                    id={`btn-delete-client-${client.id}`}
                    title="Hapus client beserta seluruh phase"
                    onClick={() => {
                      if (confirm(`Hapus client "${client.name}" beserta ${client.deliverables.length} phase di dalamnya?`)) {
                        onDeleteClient(client.id);
                      }
                    }}
                    className={`inline-flex items-center p-1.5 text-xs rounded transition-colors cursor-pointer ${
                      isDark
                        ? 'text-[#666666] hover:text-[#E63946] hover:bg-[#1A1A1A] border border-[#222222]'
                        : 'text-neutral-500 hover:text-red-600 hover:bg-red-50 border border-neutral-200'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    id={`btn-add-phase-${client.id}`}
                    onClick={() => onAddDeliverable(client.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded transition-all active:scale-95 cursor-pointer ${
                      isDark
                        ? 'bg-[#1A1A1A] hover:bg-[#E63946] text-[#E0E0E0] hover:text-white border border-[#333333] hover:border-[#E63946]'
                        : 'bg-white hover:bg-[#E63946] text-neutral-800 hover:text-white border border-neutral-300 hover:border-[#E63946] shadow-sm'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Phase</span>
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <div>
                  {/* NOTION-STYLE CRISP DATA TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr
                          className={`border-b text-[10px] uppercase tracking-wider font-medium ${
                            isDark
                              ? 'bg-[#161616] text-[#666666] border-[#1A1A1A]'
                              : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                          }`}
                        >
                          <th className="py-2.5 px-3 w-28 whitespace-nowrap"># Project</th>
                          <th className="py-2.5 px-3 min-w-[200px] whitespace-nowrap">Project Name</th>
                          <th className="py-2.5 px-3 min-w-[130px] whitespace-nowrap">Type</th>
                          <th className="py-2.5 px-3 min-w-[180px] whitespace-nowrap">Detail</th>
                          <th className="py-2.5 px-3 min-w-[150px] whitespace-nowrap">Location</th>
                          <th className="py-2.5 px-3 min-w-[120px] whitespace-nowrap">Status</th>
                          <th className="py-2.5 px-3 min-w-[260px] whitespace-nowrap bg-amber-500/5 border-l border-r border-[#222222]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-amber-400">
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>Ideation (Tahap 1)</span>
                              </div>
                              <span className="text-[9px] text-[#888888] font-mono font-normal">Sudah Sampai Mana</span>
                            </div>
                          </th>
                          <th className="py-2.5 px-3 min-w-[260px] whitespace-nowrap bg-indigo-500/5 border-r border-[#222222]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-indigo-400">
                                <Compass className="w-3.5 h-3.5" />
                                <span>Concepting (Tahap 2)</span>
                              </div>
                              <span className="text-[9px] text-[#888888] font-mono font-normal">Sudah Sampai Mana</span>
                            </div>
                          </th>
                          <th className="py-2.5 px-3 min-w-[260px] whitespace-nowrap bg-rose-500/5 border-r border-[#222222]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-[#E63946]">
                                <Box className="w-3.5 h-3.5" />
                                <span>Modeling (Tahap 3)</span>
                              </div>
                              <span className="text-[9px] text-[#888888] font-mono font-normal">Sudah Sampai Mana</span>
                            </div>
                          </th>
                          <th className="py-2.5 px-3 w-24 whitespace-nowrap">Size</th>
                          <th className="py-2.5 px-3 w-20 whitespace-nowrap">Year</th>
                          <th className="py-2.5 px-3 min-w-[150px] whitespace-nowrap">Made By</th>
                          <th className="py-2.5 px-3 min-w-[130px] whitespace-nowrap">Deadline</th>
                          <th className="py-2.5 px-3 min-w-[160px] whitespace-nowrap">Files & Vault</th>
                          <th className="py-2.5 px-2 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-[#1A1A1A]' : 'divide-neutral-200'}`}>
                        {client.deliverables.map((del) => {
                          const urgency = getDeadlineUrgency(del.deadline);
                          return (
                            <tr
                              key={del.id}
                              id={`row-${del.id}`}
                              className={`transition-colors group ${
                                isDark
                                  ? 'hover:bg-[#151515] text-[#E0E0E0]'
                                  : 'hover:bg-neutral-50 text-neutral-800'
                              }`}
                            >
                              {/* 1. NOMOR PROJECT */}
                              <td className="py-2.5 px-3 font-mono text-[#E63946] whitespace-nowrap">
                                <input
                                  type="text"
                                  value={del.projectNumber}
                                  onChange={(e) =>
                                    onUpdateDeliverable(client.id, del.id, { projectNumber: e.target.value })
                                  }
                                  className="w-full bg-transparent border-b border-transparent focus:border-[#E63946] focus:outline-none font-mono text-xs"
                                />
                              </td>

                              {/* 2. PROJECT NAME */}
                              <td className={`py-2.5 px-3 min-w-[200px] ${
                                isDark ? 'text-white' : 'text-neutral-900'
                              }`}>
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    value={del.name}
                                    onChange={(e) =>
                                      onUpdateDeliverable(client.id, del.id, { name: e.target.value })
                                    }
                                    className={`w-full bg-transparent border-b border-transparent focus:border-[#E63946] focus:outline-none text-xs ${
                                      isDark ? 'text-white' : 'text-neutral-900'
                                    }`}
                                  />
                                </div>
                              </td>

                              {/* 3. PROJECT TYPE (DROPDOWN) */}
                              <td className="py-2.5 px-3 min-w-[130px]">
                                <select
                                  value={del.projectType}
                                  onChange={(e) =>
                                    onUpdateDeliverable(client.id, del.id, {
                                      projectType: e.target.value as ProjectType,
                                    })
                                  }
                                  className={`text-[10px] font-normal px-2 py-0.5 rounded border appearance-none cursor-pointer focus:outline-none focus:border-[#E63946] capitalize ${getTypeTagColor(
                                    del.projectType
                                  )}`}
                                >
                                  {PROJECT_TYPES.map((t) => (
                                    <option key={t} value={t} className="bg-[#111111] text-white capitalize">
                                      {t}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* 4. DETAIL TYPE (Penjelasan tipe projek) */}
                              <td className="py-2.5 px-3 min-w-[180px]">
                                <input
                                  type="text"
                                  value={del.detailType}
                                  placeholder="e.g. Kinetic Sculpture Roof..."
                                  onChange={(e) =>
                                    onUpdateDeliverable(client.id, del.id, { detailType: e.target.value })
                                  }
                                  className="w-full bg-transparent text-[#888888] placeholder-[#555555] border-b border-transparent focus:border-[#E63946] focus:outline-none text-xs"
                                />
                              </td>

                              {/* 5. LOCATION */}
                              <td className="py-2.5 px-3 min-w-[150px]">
                                <div className="flex items-center gap-1.5 text-[#888888]">
                                  <MapPin className="w-3 h-3 text-[#E63946] shrink-0" />
                                  <input
                                    type="text"
                                    value={del.location}
                                    placeholder="Place or Challenge Site"
                                    onChange={(e) =>
                                      onUpdateDeliverable(client.id, del.id, { location: e.target.value })
                                    }
                                    className="w-full bg-transparent text-[#888888] placeholder-[#555555] border-b border-transparent focus:border-[#E63946] focus:outline-none text-xs"
                                  />
                                </div>
                              </td>

                              {/* 6. PROJECT STATUS (DROPDOWN) */}
                              <td className="py-2.5 px-3 min-w-[120px]">
                                <select
                                  value={del.status}
                                  onChange={(e) =>
                                    onUpdateDeliverable(client.id, del.id, {
                                      status: e.target.value as ProjectStatus,
                                    })
                                  }
                                  className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded border cursor-pointer focus:outline-none ${
                                    STATUS_OPTIONS.find((s) => s.value === del.status)?.color || ''
                                  }`}
                                >
                                  {STATUS_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value} className="bg-[#111111] text-white">
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                              </td>

                              {/* 6A. TAHAPAN: IDEATION (Laporan Mingguan) */}
                              <td className="py-2.5 px-3 min-w-[260px] border-l border-r border-[#1E1E1E] bg-[#0A0A0A]/40">
                                {(() => {
                                  const stages = del.designStages || getDefaultDesignStages();
                                  const stage = stages.ideation;
                                  return (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1.5">
                                          <select
                                            value={stage.status}
                                            onChange={(e) => {
                                              const newStatus = e.target.value as DesignStageStatus;
                                              onUpdateDeliverable(client.id, del.id, {
                                                designStages: {
                                                  ...stages,
                                                  ideation: {
                                                    ...stage,
                                                    status: newStatus,
                                                    progress: newStatus === 'completed' ? 100 : stage.progress,
                                                  },
                                                },
                                              });
                                            }}
                                            className={`text-[9px] font-normal px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer ${
                                              STAGE_STATUS_STYLES[stage.status]?.bg || ''
                                            } ${STAGE_STATUS_STYLES[stage.status]?.text || ''} ${
                                              STAGE_STATUS_STYLES[stage.status]?.border || ''
                                            }`}
                                          >
                                            <option value="not started">Not Started</option>
                                            <option value="in progress">In Progress</option>
                                            <option value="in review">In Review</option>
                                            <option value="completed">Completed</option>
                                          </select>
                                          <span className="text-[9px] font-mono text-[#777777]">
                                            {stage.week} • {stage.progress}%
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          id={`btn-open-report-ideation-${del.id}`}
                                          onClick={() => setStageModalData({ deliverable: del, client, initialStage: 'ideation' })}
                                          title="Buka laporan mingguan lengkap Ideation"
                                          className="p-1 rounded text-[#666666] hover:text-[#E63946] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                                        >
                                          <SlidersHorizontal className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-between text-[9px] text-[#777777] mb-1">
                                          <span className="font-medium text-amber-500/80">Sudah sampai mana:</span>
                                          {stage.note && (
                                            <span className="text-[9px] text-[#555555] font-mono">
                                              {stage.note.length} kar
                                            </span>
                                          )}
                                        </div>
                                        <textarea
                                          id={`textarea-stage-ideation-${del.id}`}
                                          rows={2}
                                          value={stage.note}
                                          placeholder="Ceritakan progres tahap Ideation (mis. sketsa tangan, zonasi ruang, moodboard material)..."
                                          onChange={(e) => {
                                            onUpdateDeliverable(client.id, del.id, {
                                              designStages: {
                                                ...stages,
                                                ideation: {
                                                  ...stage,
                                                  note: e.target.value,
                                                },
                                              },
                                            });
                                          }}
                                          className={`w-full p-2 text-[11px] leading-relaxed rounded border focus:outline-none focus:border-[#E63946] resize-y transition-colors ${
                                            isDark
                                              ? 'bg-[#111111] border-[#222222] text-[#E0E0E0] placeholder-[#555555] focus:bg-[#151515]'
                                              : 'bg-white border-neutral-200 text-neutral-800 placeholder-neutral-400'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* 6B. TAHAPAN: CONCEPTING (Laporan Mingguan) */}
                              <td className="py-2.5 px-3 min-w-[260px] border-r border-[#1E1E1E] bg-[#0A0A0A]/40">
                                {(() => {
                                  const stages = del.designStages || getDefaultDesignStages();
                                  const stage = stages.concepting;
                                  return (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1.5">
                                          <select
                                            value={stage.status}
                                            onChange={(e) => {
                                              const newStatus = e.target.value as DesignStageStatus;
                                              onUpdateDeliverable(client.id, del.id, {
                                                designStages: {
                                                  ...stages,
                                                  concepting: {
                                                    ...stage,
                                                    status: newStatus,
                                                    progress: newStatus === 'completed' ? 100 : stage.progress,
                                                  },
                                                },
                                              });
                                            }}
                                            className={`text-[9px] font-normal px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer ${
                                              STAGE_STATUS_STYLES[stage.status]?.bg || ''
                                            } ${STAGE_STATUS_STYLES[stage.status]?.text || ''} ${
                                              STAGE_STATUS_STYLES[stage.status]?.border || ''
                                            }`}
                                          >
                                            <option value="not started">Not Started</option>
                                            <option value="in progress">In Progress</option>
                                            <option value="in review">In Review</option>
                                            <option value="completed">Completed</option>
                                          </select>
                                          <span className="text-[9px] font-mono text-[#777777]">
                                            {stage.week} • {stage.progress}%
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          id={`btn-open-report-concepting-${del.id}`}
                                          onClick={() => setStageModalData({ deliverable: del, client, initialStage: 'concepting' })}
                                          title="Buka laporan mingguan lengkap Concepting"
                                          className="p-1 rounded text-[#666666] hover:text-[#E63946] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                                        >
                                          <SlidersHorizontal className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-between text-[9px] text-[#777777] mb-1">
                                          <span className="font-medium text-indigo-400/80">Sudah sampai mana:</span>
                                          {stage.note && (
                                            <span className="text-[9px] text-[#555555] font-mono">
                                              {stage.note.length} kar
                                            </span>
                                          )}
                                        </div>
                                        <textarea
                                          id={`textarea-stage-concepting-${del.id}`}
                                          rows={2}
                                          value={stage.note}
                                          placeholder="Ceritakan progres tahap Concepting (mis. articulasi gubahan massa, skema sirkulasi)..."
                                          onChange={(e) => {
                                            onUpdateDeliverable(client.id, del.id, {
                                              designStages: {
                                                ...stages,
                                                concepting: {
                                                  ...stage,
                                                  note: e.target.value,
                                                },
                                              },
                                            });
                                          }}
                                          className={`w-full p-2 text-[11px] leading-relaxed rounded border focus:outline-none focus:border-[#E63946] resize-y transition-colors ${
                                            isDark
                                              ? 'bg-[#111111] border-[#222222] text-[#E0E0E0] placeholder-[#555555] focus:bg-[#151515]'
                                              : 'bg-white border-neutral-200 text-neutral-800 placeholder-neutral-400'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* 6C. TAHAPAN: MODELING (Laporan Mingguan) */}
                              <td className="py-2.5 px-3 min-w-[260px] border-r border-[#1E1E1E] bg-[#0A0A0A]/40">
                                {(() => {
                                  const stages = del.designStages || getDefaultDesignStages();
                                  const stage = stages.modeling;
                                  return (
                                    <div className="space-y-1.5">
                                      <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1.5">
                                          <select
                                            value={stage.status}
                                            onChange={(e) => {
                                              const newStatus = e.target.value as DesignStageStatus;
                                              onUpdateDeliverable(client.id, del.id, {
                                                designStages: {
                                                  ...stages,
                                                  modeling: {
                                                    ...stage,
                                                    status: newStatus,
                                                    progress: newStatus === 'completed' ? 100 : stage.progress,
                                                  },
                                                },
                                              });
                                            }}
                                            className={`text-[9px] font-normal px-1.5 py-0.5 rounded border focus:outline-none cursor-pointer ${
                                              STAGE_STATUS_STYLES[stage.status]?.bg || ''
                                            } ${STAGE_STATUS_STYLES[stage.status]?.text || ''} ${
                                              STAGE_STATUS_STYLES[stage.status]?.border || ''
                                            }`}
                                          >
                                            <option value="not started">Not Started</option>
                                            <option value="in progress">In Progress</option>
                                            <option value="in review">In Review</option>
                                            <option value="completed">Completed</option>
                                          </select>
                                          <span className="text-[9px] font-mono text-[#777777]">
                                            {stage.week} • {stage.progress}%
                                          </span>
                                        </div>
                                        <button
                                          type="button"
                                          id={`btn-open-report-modeling-${del.id}`}
                                          onClick={() => setStageModalData({ deliverable: del, client, initialStage: 'modeling' })}
                                          title="Buka laporan mingguan lengkap Modeling"
                                          className="p-1 rounded text-[#666666] hover:text-[#E63946] hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                                        >
                                          <SlidersHorizontal className="w-3 h-3" />
                                        </button>
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-between text-[9px] text-[#777777] mb-1">
                                          <span className="font-medium text-rose-400/80">Sudah sampai mana:</span>
                                          {stage.note && (
                                            <span className="text-[9px] text-[#555555] font-mono">
                                              {stage.note.length} kar
                                            </span>
                                          )}
                                        </div>
                                        <textarea
                                          id={`textarea-stage-modeling-${del.id}`}
                                          rows={2}
                                          value={stage.note}
                                          placeholder="Ceritakan progres tahap Modeling (mis. 3D BIM, rendering eksterior, detail DED)..."
                                          onChange={(e) => {
                                            onUpdateDeliverable(client.id, del.id, {
                                              designStages: {
                                                ...stages,
                                                modeling: {
                                                  ...stage,
                                                  note: e.target.value,
                                                },
                                              },
                                            });
                                          }}
                                          className={`w-full p-2 text-[11px] leading-relaxed rounded border focus:outline-none focus:border-[#E63946] resize-y transition-colors ${
                                            isDark
                                              ? 'bg-[#111111] border-[#222222] text-[#E0E0E0] placeholder-[#555555] focus:bg-[#151515]'
                                              : 'bg-white border-neutral-200 text-neutral-800 placeholder-neutral-400'
                                          }`}
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* 7. SIZE */}
                              <td className="py-2.5 px-3 w-24">
                                <input
                                  type="text"
                                  value={del.size}
                                  placeholder="4,200m²"
                                  onChange={(e) =>
                                    onUpdateDeliverable(client.id, del.id, { size: e.target.value })
                                  }
                                  className="w-full bg-transparent font-mono text-[#888888] placeholder-[#555555] border-b border-transparent focus:border-[#E63946] focus:outline-none text-xs"
                                />
                              </td>

                              {/* 8. YEAR */}
                              <td className="py-2.5 px-3 w-20">
                                <input
                                  type="text"
                                  value={del.year}
                                  placeholder="2026"
                                  onChange={(e) =>
                                    onUpdateDeliverable(client.id, del.id, { year: e.target.value })
                                  }
                                  className="w-full bg-transparent font-mono text-[#888888] placeholder-[#555555] border-b border-transparent focus:border-[#E63946] focus:outline-none text-xs"
                                />
                              </td>

                              {/* 9. MADE BY (Kosongkan jika sendiri, isi jika kolaborasi) */}
                              <td className="py-2.5 px-3 min-w-[150px]">
                                <input
                                  type="text"
                                  value={del.madeBy}
                                  placeholder="Solo (kosong jika sendiri)"
                                  onChange={(e) =>
                                    onUpdateDeliverable(client.id, del.id, { madeBy: e.target.value })
                                  }
                                  className={`w-full bg-transparent text-xs border-b border-transparent focus:border-[#E63946] focus:outline-none ${
                                    del.madeBy
                                      ? 'text-amber-500 font-normal'
                                      : isDark
                                      ? 'text-[#555555] italic'
                                      : 'text-neutral-400 italic'
                                  }`}
                                />
                              </td>

                              {/* 10. DEADLINE (for Weekly Calendar) */}
                              <td className="py-2.5 px-3 min-w-[130px]">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="date"
                                    value={del.deadline}
                                    onChange={(e) =>
                                      onUpdateDeliverable(client.id, del.id, { deadline: e.target.value })
                                    }
                                    className={`border px-1.5 py-0.5 rounded text-[11px] focus:outline-none focus:border-[#E63946] ${
                                      isDark ? 'bg-[#0A0A0A]' : 'bg-white'
                                    } ${
                                      urgency === 'today'
                                        ? 'border-[#E63946] text-[#E63946] font-medium'
                                        : urgency === 'upcoming'
                                        ? 'border-amber-600/80 text-amber-500 font-normal'
                                        : isDark
                                        ? 'border-[#1A1A1A] text-[#888888]'
                                        : 'border-neutral-300 text-neutral-700'
                                    }`}
                                  />
                                </div>
                              </td>

                              {/* 11. FILES & VAULT */}
                              <td className="py-2.5 px-3 min-w-[160px]">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {del.files.slice(0, 2).map((f) => (
                                    <span key={f.id} title={`${f.name} (${formatFileSize(f.size)})`}>
                                      {renderFileIcon(f.category)}
                                    </span>
                                  ))}
                                  {del.files.length > 2 && (
                                    <span className={`text-[9px] px-1 py-0.2 rounded border ${
                                      isDark ? 'text-[#666666] bg-[#141414] border-[#1A1A1A]' : 'text-neutral-500 bg-neutral-100 border-neutral-200'
                                    }`}>
                                      +{del.files.length - 2}
                                    </span>
                                  )}
                                  <button
                                    id={`btn-open-files-${del.id}`}
                                    onClick={() => onOpenFileDrawer(del, client)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-normal rounded border transition-colors shrink-0 ${
                                      isDark
                                        ? 'bg-[#1A1A1A] hover:bg-[#E63946] text-[#E0E0E0] hover:text-white border-[#333333] hover:border-[#E63946]'
                                        : 'bg-neutral-100 hover:bg-[#E63946] text-neutral-700 hover:text-white border-neutral-200 hover:border-[#E63946]'
                                    }`}
                                  >
                                    <Paperclip className="w-3 h-3" />
                                    <span>{del.files.length} Files</span>
                                  </button>
                                </div>
                              </td>

                              {/* 12. ROW ACTIONS */}
                              <td className="py-2.5 px-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    id={`btn-edit-row-${del.id}`}
                                    title="Edit atau perbaiki fase projek ini"
                                    onClick={() => setEditingDeliverableData({ deliverable: del, client })}
                                    className="p-1.5 text-[#777777] hover:text-white hover:bg-[#1E1E1E] rounded transition-colors cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    id={`btn-delete-row-${del.id}`}
                                    title="Hapus deliverable / fase ini"
                                    onClick={() => {
                                      if (confirm(`Hapus deliverable "${del.name}" (${del.projectNumber}) beserta seluruh berkasnya?`)) {
                                        onDeleteDeliverable(client.id, del.id);
                                      }
                                    }}
                                    className="p-1.5 text-[#666666] hover:text-[#E63946] hover:bg-[#1E1E1E] rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* BOTTOM PER CLIENT: BACKGROUND & CONCEPT TEXT BOXES */}
                  {/* "dan di bawah kolom" per client buatkan text box untuk background (menceritakan bagaimana projek itu terbentuk) concept (mengisi nama konsep dari projek)" */}
                  <div
                    id={`client-narratives-${client.id}`}
                    className={`p-4 border-t grid grid-cols-1 md:grid-cols-2 gap-6 ${
                      isDark ? 'border-[#1A1A1A] bg-[#0E0E0E]' : 'border-neutral-200 bg-neutral-50/50'
                    }`}
                  >
                    {/* Background Text Box */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-medium text-[#E63946] uppercase tracking-wider block">
                          Background
                        </label>
                        <span className="text-[10px] text-[#555555] italic">Menceritakan bagaimana projek terbentuk</span>
                      </div>
                      <textarea
                        rows={3}
                        value={client.background}
                        onChange={(e) => onUpdateClient(client.id, { background: e.target.value })}
                        placeholder="Tuliskan latar belakang bagaimana projek ini terbentuk, kebutuhan klien, lokasi, sayembara..."
                        className={`w-full p-3 text-xs rounded border transition-all resize-y leading-relaxed focus:outline-none focus:border-[#E63946] ${
                          isDark
                            ? 'bg-[#0A0A0A] border-[#1A1A1A] text-[#888888] placeholder-[#555555]'
                            : 'bg-white border-neutral-300 text-neutral-800 placeholder-neutral-400'
                        }`}
                      />
                    </div>

                    {/* Concept Text Box */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[9px] font-medium text-[#E63946] uppercase tracking-wider block">
                          Concept
                        </label>
                        <span className="text-[10px] text-[#555555] italic">Mengisi nama konsep dari projek</span>
                      </div>
                      <textarea
                        rows={3}
                        value={client.concept}
                        onChange={(e) => onUpdateClient(client.id, { concept: e.target.value })}
                        placeholder='Contoh: "Vapor & Void" — Translating hydraulic fluctuations into responsive kinetic membrane architecture...'
                        className={`w-full p-3 text-xs rounded border transition-all resize-y leading-relaxed focus:outline-none focus:border-[#E63946] font-normal ${
                          isDark
                            ? 'bg-[#0A0A0A] border-[#1A1A1A] text-white italic tracking-wide placeholder-[#555555]'
                            : 'bg-white border-neutral-300 text-neutral-800 placeholder-neutral-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* WEEKLY DESIGN STAGE REPORT MODAL */}
      {stageModalData && (
        <WeeklyDesignReportModal
          isOpen={Boolean(stageModalData)}
          deliverable={stageModalData.deliverable}
          client={stageModalData.client}
          initialStageTab={stageModalData.initialStage}
          isDark={isDark}
          onClose={() => setStageModalData(null)}
          onSave={(clientId, deliverableId, updatedStages) => {
            onUpdateDeliverable(clientId, deliverableId, { designStages: updatedStages });
            setStageModalData(null);
          }}
        />
      )}

      {/* EDIT DELIVERABLE / PROJECT PHASE MODAL */}
      {editingDeliverableData && (
        <EditProjectModal
          isOpen={Boolean(editingDeliverableData)}
          deliverable={editingDeliverableData.deliverable}
          client={editingDeliverableData.client}
          clients={clients}
          isDark={isDark}
          onClose={() => setEditingDeliverableData(null)}
          onSave={(sourceClientId, targetClientId, deliverableId, updatedData) => {
            onUpdateDeliverable(sourceClientId, deliverableId, {
              ...updatedData,
              clientId: targetClientId,
            });
            setEditingDeliverableData(null);
          }}
          onDelete={(clientId, deliverableId) => {
            onDeleteDeliverable(clientId, deliverableId);
            setEditingDeliverableData(null);
          }}
        />
      )}

      {/* EDIT CLIENT PROFILE & CONCEPT MODAL */}
      {editingClientData && (
        <EditClientModal
          isOpen={Boolean(editingClientData)}
          client={editingClientData}
          isDark={isDark}
          onClose={() => setEditingClientData(null)}
          onSave={(clientId, updated) => {
            onUpdateClient(clientId, updated);
            setEditingClientData(null);
          }}
          onDelete={(clientId) => {
            onDeleteClient(clientId);
            setEditingClientData(null);
          }}
        />
      )}
    </div>
  );
};

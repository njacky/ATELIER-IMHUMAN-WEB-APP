import React, { useState, useEffect } from 'react';
import { ClientGroup, Deliverable, ProjectType, ProjectStatus } from '../types';
import { X, Save, Trash2, Building, AlertTriangle, Layers, Calendar, MapPin, UserCheck } from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  deliverable: Deliverable | null;
  client: ClientGroup | null;
  clients: ClientGroup[];
  onClose: () => void;
  onSave: (
    sourceClientId: string,
    targetClientId: string,
    deliverableId: string,
    updatedData: Partial<Deliverable>
  ) => void;
  onDelete: (clientId: string, deliverableId: string) => void;
  isDark: boolean;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  deliverable,
  client,
  clients,
  onClose,
  onSave,
  onDelete,
  isDark,
}) => {
  if (!isOpen || !deliverable || !client) return null;

  const [projectNumber, setProjectNumber] = useState(deliverable.projectNumber);
  const [name, setName] = useState(deliverable.name);
  const [selectedClientId, setSelectedClientId] = useState(client.id);
  const [projectType, setProjectType] = useState<ProjectType>(deliverable.projectType);
  const [detailType, setDetailType] = useState(deliverable.detailType || '');
  const [location, setLocation] = useState(deliverable.location || '');
  const [status, setStatus] = useState<ProjectStatus>(deliverable.status);
  const [size, setSize] = useState(deliverable.size || '');
  const [year, setYear] = useState(deliverable.year || '2026');
  const [madeBy, setMadeBy] = useState(deliverable.madeBy || '');
  const [deadline, setDeadline] = useState(deliverable.deadline || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (deliverable && client) {
      setProjectNumber(deliverable.projectNumber);
      setName(deliverable.name);
      setSelectedClientId(client.id);
      setProjectType(deliverable.projectType);
      setDetailType(deliverable.detailType || '');
      setLocation(deliverable.location || '');
      setStatus(deliverable.status);
      setSize(deliverable.size || '');
      setYear(deliverable.year || '2026');
      setMadeBy(deliverable.madeBy || '');
      setDeadline(deliverable.deadline || '');
      setConfirmDelete(false);
    }
  }, [deliverable, client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Mohon isi nama projek/phase.');
      return;
    }

    const targetClient = clients.find((c) => c.id === selectedClientId) || client;

    onSave(client.id, selectedClientId, deliverable.id, {
      projectNumber,
      name: name.trim(),
      clientId: targetClient.id,
      clientName: targetClient.name,
      projectType,
      detailType: detailType.trim(),
      location: location.trim(),
      status,
      size: size.trim(),
      year: year.trim(),
      madeBy: madeBy.trim(),
      deadline,
    });

    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(client.id, deliverable.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  const projectTypes: ProjectType[] = [
    'residential',
    'office',
    'retail',
    'hospitality',
    'public spaces',
  ];

  const detailTypeSuggestions = [
    'Schematic Design (SD)',
    'Design Development (DD)',
    '3D BIM Modeling & Massing',
    'Detail Engineering Drawing (DED)',
    'Interior Fitout Concept',
    'Landscape & Site Plan',
    'Photorealistic Renderings',
    'Permit & IMB Approval',
  ];

  return (
    <div
      id="edit-project-modal-overlay"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="edit-project-modal-card"
        className={`w-full max-w-2xl rounded-lg border shadow-2xl overflow-hidden my-8 transition-all ${
          isDark
            ? 'bg-[#111111] border-[#222222] text-[#E0E0E0]'
            : 'bg-white border-neutral-300 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#222222] bg-[#0C0C0C]' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E63946]" />
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-white">
                Edit Projek / Phase Deliverable
              </h2>
              <p className="text-[11px] text-[#888888] font-mono mt-0.5">
                {deliverable.projectNumber} • {client.name}
              </p>
            </div>
          </div>
          <button
            id="btn-close-edit-project"
            onClick={onClose}
            className="p-1.5 rounded text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Project Code / ID
              </label>
              <input
                type="text"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
                placeholder="#INHM-045"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Nama Projek / Phase *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
                placeholder="Contoh: Villa Retreat & Paviliun Spa"
                required
              />
            </div>
          </div>

          {/* Row 2: Client & Project Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Client Group Assignment
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946] cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.deliverables.length} items)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Project Typology
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946] capitalize cursor-pointer"
              >
                {projectTypes.map((type) => (
                  <option key={type} value={type} className="capitalize">
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Detail Phase Type with quick suggestion pills */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888]">
                Phase Detail / Lingkup Kerja
              </label>
              <span className="text-[10px] text-[#666666]">Pilih saran atau ketik manual</span>
            </div>
            <input
              type="text"
              value={detailType}
              onChange={(e) => setDetailType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
              placeholder="Contoh: Schematic Design (SD) atau 3D Massing"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {detailTypeSuggestions.map((sug) => (
                <button
                  type="button"
                  key={sug}
                  onClick={() => setDetailType(sug)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    detailType === sug
                      ? 'bg-[#E63946]/20 border-[#E63946] text-white'
                      : 'bg-[#141414] border-[#222222] text-[#888888] hover:text-white hover:border-[#444444]'
                  }`}
                >
                  {sug}
                </button>
              ))}
            </div>
          </div>

          {/* Row 4: Status, Location, Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Status Pengerjaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946] cursor-pointer"
              >
                <option value="not started">Not Started</option>
                <option value="in review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Lokasi Tapak
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
                placeholder="Canggu, Bali"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Luas / Area (m²)
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
                placeholder="3,500m²"
              />
            </div>
          </div>

          {/* Row 5: Year, Made By, Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Tahun
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
                placeholder="2026"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Made By (Kolaborasi / Solo)
              </label>
              <input
                type="text"
                value={madeBy}
                onChange={(e) => setMadeBy(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
                placeholder="Kosong jika sendiri"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
                Deadline Pengiriman
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
              />
            </div>
          </div>

          {/* DANGER ZONE: Delete Deliverable / Phase */}
          <div className="pt-4 border-t border-[#222222]">
            <div className="p-3.5 rounded border border-red-950/40 bg-red-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Zona Hapus Fase / Projek</span>
                </div>
                <p className="text-[11px] text-[#888888] mt-0.5">
                  Hapus permanen fase ini beserta seluruh berkas repositori yang terlampir di dalamnya.
                </p>
              </div>

              {confirmDelete ? (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1.5 text-xs text-[#888888] hover:text-white rounded transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    Ya, Hapus Sekarang
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1.5 text-xs font-normal text-red-400 hover:text-white hover:bg-red-600/80 border border-red-900/50 rounded transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Projek Ini</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-normal text-[#888888] hover:text-white rounded transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              id="btn-save-project-edits"
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-normal text-white bg-[#E63946] hover:bg-[#C52B37] rounded transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

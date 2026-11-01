import React, { useState, useRef } from 'react';
import { ClientGroup, ProjectType, ProjectStatus, ProjectFile } from '../types';
import { X, Plus, Upload, Building, Sparkles, Calendar, Layers, MapPin } from 'lucide-react';
import { getFileCategory, saveFileBlob } from '../lib/storage';

interface AddProjectModalProps {
  clients: ClientGroup[];
  preselectedClientId?: string;
  preselectedDate?: string;
  onClose: () => void;
  onSave: (data: {
    clientMode: 'existing' | 'new';
    clientId: string;
    newClientName: string;
    newClientBackground: string;
    newClientConcept: string;
    projectNumber: string;
    projectName: string;
    projectType: ProjectType;
    detailType: string;
    location: string;
    status: ProjectStatus;
    size: string;
    year: string;
    madeBy: string;
    deadline: string;
    files: ProjectFile[];
  }) => void;
  isDark: boolean;
}

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  clients,
  preselectedClientId,
  preselectedDate,
  onClose,
  onSave,
  isDark,
}) => {
  const [clientMode, setClientMode] = useState<'existing' | 'new'>(
    preselectedClientId ? 'existing' : clients.length > 0 ? 'existing' : 'new'
  );
  const [selectedClientId, setSelectedClientId] = useState<string>(
    preselectedClientId || clients[0]?.id || ''
  );
  const [newClientName, setNewClientName] = useState('');
  const [newClientBackground, setNewClientBackground] = useState('');
  const [newClientConcept, setNewClientConcept] = useState('');

  // Auto-generate project number
  const totalExistingDeliverables = clients.reduce((sum, c) => sum + c.deliverables.length, 0);
  const nextNumber = String(totalExistingDeliverables + 45).padStart(3, '0');

  const [projectNumber, setProjectNumber] = useState(`#INHM-${nextNumber}`);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('residential');
  const [detailType, setDetailType] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('not started');
  const [size, setSize] = useState('');
  const [year, setYear] = useState('2026');
  const [madeBy, setMadeBy] = useState('');
  const [deadline, setDeadline] = useState(preselectedDate || '2026-09-09');
  const [uploadedFiles, setUploadedFiles] = useState<ProjectFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (filesList: FileList | null) => {
    if (!filesList) return;
    const files: ProjectFile[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const fileId = `file-${Date.now()}-${i}`;
      await saveFileBlob(fileId, file);

      files.push({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        category: getFileCategory(file.name, file.type),
        uploadDate: today,
        dataUrl: file.type.startsWith('image/') || file.type.startsWith('video/') ? URL.createObjectURL(file) : undefined,
      });
    }

    setUploadedFiles((prev) => [...prev, ...files]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      alert('Mohon isi nama project');
      return;
    }
    if (clientMode === 'new' && !newClientName.trim()) {
      alert('Mohon isi nama client baru');
      return;
    }

    onSave({
      clientMode,
      clientId: selectedClientId,
      newClientName: newClientName.trim(),
      newClientBackground: newClientBackground.trim(),
      newClientConcept: newClientConcept.trim(),
      projectNumber: projectNumber.trim(),
      projectName: projectName.trim(),
      projectType,
      detailType: detailType.trim(),
      location: location.trim(),
      status,
      size: size.trim(),
      year: year.trim(),
      madeBy: madeBy.trim(),
      deadline,
      files: uploadedFiles,
    });
  };

  return (
    <div
      id="add-project-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="add-project-modal-container"
        className={`max-w-2xl w-full rounded-lg border shadow-2xl overflow-hidden my-8 ${
          isDark ? 'bg-[#0F0F0F] border-[#1A1A1A] text-white' : 'bg-white border-neutral-300 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-[#1A1A1A] flex items-center justify-between bg-[#0A0A0A]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#E63946] flex items-center justify-center text-white text-xs font-medium">
              +
            </div>
            <div>
              <h3 className="text-sm font-medium uppercase tracking-wider">
                Add Project Deliverable / Phase
              </h3>
              <p className="text-[10px] text-[#888888]">
                atelier INHM project file and deadline entry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-white rounded hover:bg-[#1A1A1A]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* CLIENT SELECTION / GROUPING */}
          <div className="p-3.5 rounded-lg border border-[#1A1A1A] bg-[#141414] space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-medium text-[#888888] uppercase tracking-wider text-[9px]">
                Client Grouping (Multiple deliverables per client supported)
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setClientMode('existing')}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-colors ${
                    clientMode === 'existing'
                      ? 'bg-[#1A1A1A] text-white border border-[#333333]'
                      : 'text-[#666666] hover:text-white'
                  }`}
                >
                  Existing Client
                </button>
                <button
                  type="button"
                  onClick={() => setClientMode('new')}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-colors ${
                    clientMode === 'new'
                      ? 'bg-[#E63946] text-white'
                      : 'text-[#666666] hover:text-white'
                  }`}
                >
                  + New Client
                </button>
              </div>
            </div>

            {clientMode === 'existing' ? (
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white focus:outline-none focus:border-[#E63946] font-normal text-xs"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.deliverables.length} deliverables)
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Nama Klien Baru (e.g. PT. Ciputra Development / Studio Tokyo)"
                  required
                  className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white placeholder-[#555555] focus:outline-none focus:border-[#E63946] font-normal text-xs"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <textarea
                    rows={2}
                    value={newClientBackground}
                    onChange={(e) => setNewClientBackground(e.target.value)}
                    placeholder="Background (menceritakan bagaimana projek terbentuk)..."
                    className="p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-[#888888] placeholder-[#555555] focus:outline-none focus:border-[#E63946] text-[11px]"
                  />
                  <textarea
                    rows={2}
                    value={newClientConcept}
                    onChange={(e) => setNewClientConcept(e.target.value)}
                    placeholder="Concept (mengisi nama konsep dari projek)..."
                    className="p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white italic placeholder-[#555555] focus:outline-none focus:border-[#E63946] text-[11px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* PROJECT CORE FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nomor Project */}
            <div>
              <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">Nomor Project</label>
              <input
                type="text"
                value={projectNumber}
                onChange={(e) => setProjectNumber(e.target.value)}
                required
                className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-[#E63946] font-mono focus:outline-none focus:border-[#E63946] text-xs"
              />
            </div>

            {/* Project Name */}
            <div>
              <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Oakhaven Courtyard Residence"
                required
                className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white focus:outline-none focus:border-[#E63946] text-xs"
              />
            </div>

            {/* Project Type Dropdown */}
            <div>
              <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">
                Project Type (Dropdown)
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value as ProjectType)}
                className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white focus:outline-none focus:border-[#E63946] capitalize text-xs"
              >
                <option value="residential">Residential</option>
                <option value="office">Office</option>
                <option value="retail">Retail</option>
                <option value="hospitality">Hospitality</option>
                <option value="public spaces">Public Spaces</option>
              </select>
            </div>

            {/* Detail Type */}
            <div>
              <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">Detail Type</label>
              <input
                type="text"
                value={detailType}
                onChange={(e) => setDetailType(e.target.value)}
                placeholder="Penjelasan tipe projek (e.g. Eco-Villa Cantilever)"
                className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white placeholder-[#555555] focus:outline-none focus:border-[#E63946] text-xs"
              />
            </div>

            {/* Location */}
            <div>
              <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Tempat asli atau project challenge"
                className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white placeholder-[#555555] focus:outline-none focus:border-[#E63946] text-xs"
              />
            </div>

            {/* Project Status Dropdown */}
            <div>
              <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">
                Project Status (Dropdown)
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white focus:outline-none focus:border-[#E63946] uppercase text-xs"
              >
                <option value="not started">Not Started</option>
                <option value="in review">In Review</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Size & Year */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">Size</label>
                <input
                  type="text"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  placeholder="e.g. 750 m²"
                  className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white placeholder-[#555555] focus:outline-none focus:border-[#E63946] text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">Year</label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2026"
                  className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white font-mono focus:outline-none focus:border-[#E63946] text-xs"
                />
              </div>
            </div>

            {/* Deadline (for Weekly Calendar) */}
            <div>
              <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">
                Deadline (Weekly Calendar)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white focus:outline-none focus:border-[#E63946] text-xs"
              />
            </div>
          </div>

          {/* MADE BY: Kalau sendiri dikosongkan, kalau kolaborasi diisi */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-[#888888] uppercase tracking-wider text-[10px]">Made By</label>
              <span className="text-[10px] text-[#555555] italic">
                Kosongkan jika solo, isi jika kolaborasi
              </span>
            </div>
            <input
              type="text"
              value={madeBy}
              onChange={(e) => setMadeBy(e.target.value)}
              placeholder="Kosongkan jika sendiri (atau e.g. atelier INHM × Studio XYZ)"
              className="w-full p-2 rounded bg-[#0A0A0A] border border-[#1A1A1A] text-white placeholder-[#555555] focus:outline-none focus:border-[#E63946] text-xs"
            />
          </div>

          {/* INITIAL FILE UPLOAD */}
          <div>
            <label className="font-medium text-[#888888] block mb-1 uppercase tracking-wider text-[10px]">
              Attach Project Files (PDF, Excel, DOCX, PPTX, MP4, DWG)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="*/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 rounded-lg border border-dashed border-[#1A1A1A] hover:border-[#E63946] bg-[#0A0A0A] text-center cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4 mx-auto text-[#E63946] mb-1" />
              <span className="text-[11px] text-[#E0E0E0] font-medium">Click to upload files</span>
              <span className="text-[10px] text-[#555555] block">
                Excel (.xlsx, .xls, .csv), PDF blueprints, Word, PPTX, Video, CAD
              </span>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-1.5 rounded bg-[#141414] border border-[#1A1A1A] text-[11px]"
                  >
                    <span className="truncate max-w-xs text-[#E0E0E0]">{f.name}</span>
                    <span className="text-[#E63946] uppercase font-medium text-[9px]">{f.category}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-4 border-t border-[#1A1A1A] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-normal text-[#888888] hover:text-white rounded hover:bg-[#1A1A1A]"
            >
              Cancel
            </button>
            <button
              id="btn-submit-add-deliverable"
              type="submit"
              className="px-5 py-2 text-xs font-medium uppercase tracking-wider bg-[#E63946] hover:bg-[#A01A26] text-white rounded transition-all shadow"
            >
              Save Project Deliverable
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

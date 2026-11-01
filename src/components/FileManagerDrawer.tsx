import React, { useState, useRef } from 'react';
import { Deliverable, ClientGroup, ProjectFile, DesignStagesReport } from '../types';
import {
  X,
  Upload,
  Download,
  Trash2,
  Eye,
  FileText,
  Film,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  Paperclip,
  CheckCircle2,
  Calendar,
  MapPin,
  Maximize2,
  Building,
  Sparkles,
  Play,
  Lightbulb,
  Compass,
  Box,
  SlidersHorizontal,
  Pencil,
  RefreshCw
} from 'lucide-react';
import { formatFileSize, getFileCategory, saveFileBlob, getFileBlob, deleteFileBlob, getDefaultDesignStages } from '../lib/storage';
import { formatDisplayDate } from '../lib/dateUtils';
import { WeeklyDesignReportModal } from './WeeklyDesignReportModal';
import { EditFileModal } from './EditFileModal';

interface FileManagerDrawerProps {
  deliverable: Deliverable;
  client: ClientGroup;
  onClose: () => void;
  onUpdateDeliverable: (clientId: string, deliverableId: string, updated: Partial<Deliverable>) => void;
  isDark: boolean;
}

export const FileManagerDrawer: React.FC<FileManagerDrawerProps> = ({
  deliverable,
  client,
  onClose,
  onUpdateDeliverable,
  isDark,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<ProjectFile | null>(null);
  const [replaceTargetFileId, setReplaceTargetFileId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const stages = deliverable.designStages || getDefaultDesignStages();

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Handle uploading files
  const handleFiles = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setUploading(true);

    const newFiles: ProjectFile[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const category = getFileCategory(file.name, file.type);

      // Save blob into IndexedDB
      await saveFileBlob(fileId, file);

      // Create object URL for immediate session preview
      let dataUrl: string | undefined = undefined;
      if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type.includes('pdf')) {
        dataUrl = URL.createObjectURL(file);
      }

      newFiles.push({
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        category,
        uploadDate: today,
        dataUrl,
      });
    }

    const updatedFiles = [...deliverable.files, ...newFiles];
    onUpdateDeliverable(client.id, deliverable.id, { files: updatedFiles });
    setUploading(false);
    showToast(`${newFiles.length} berkas berhasil diunggah.`);
  };

  // Replace existing file (salah mengupload / revisi berkas)
  const handleReplaceFile = async (fileId: string, newFile: File) => {
    await saveFileBlob(fileId, newFile);
    const today = new Date().toISOString().split('T')[0];
    const category = getFileCategory(newFile.name, newFile.type);

    let dataUrl: string | undefined = undefined;
    if (newFile.type.startsWith('image/') || newFile.type.startsWith('video/') || newFile.type.includes('pdf')) {
      dataUrl = URL.createObjectURL(newFile);
    }

    const updatedFiles = deliverable.files.map((f) => {
      if (f.id !== fileId) return f;
      return {
        ...f,
        name: newFile.name,
        size: newFile.size,
        type: newFile.type || 'application/octet-stream',
        category,
        uploadDate: today,
        dataUrl,
      };
    });

    onUpdateDeliverable(client.id, deliverable.id, { files: updatedFiles });

    if (previewFile?.id === fileId) {
      setPreviewFile(updatedFiles.find((f) => f.id === fileId) || null);
      if (dataUrl) setPreviewBlobUrl(dataUrl);
    }

    showToast(`Berkas berhasil diganti dengan "${newFile.name}".`);
  };

  // Quick trigger replace from button on file item
  const handleTriggerQuickReplace = (fileId: string) => {
    setReplaceTargetFileId(fileId);
    replaceFileInputRef.current?.click();
  };

  const handleQuickReplaceInputChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !replaceTargetFileId) return;
    const newFile = files[0];
    await handleReplaceFile(replaceTargetFileId, newFile);
    setReplaceTargetFileId(null);
    if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
  };

  // Edit file metadata (rename, change category)
  const handleUpdateFile = (fileId: string, updated: Partial<ProjectFile>) => {
    const updatedFiles = deliverable.files.map((f) =>
      f.id === fileId ? { ...f, ...updated } : f
    );
    onUpdateDeliverable(client.id, deliverable.id, { files: updatedFiles });
    showToast('Informasi berkas berhasil diperbarui.');
  };

  // Delete a file
  const handleDeleteFile = async (fileId: string, fileName?: string) => {
    if (confirm(`Hapus berkas "${fileName || 'ini'}" dari repositori proyek?`)) {
      await deleteFileBlob(fileId);
      const filtered = deliverable.files.filter((f) => f.id !== fileId);
      onUpdateDeliverable(client.id, deliverable.id, { files: filtered });
      if (previewFile?.id === fileId) {
        setPreviewFile(null);
        setPreviewBlobUrl(null);
      }
      showToast('Berkas telah dihapus dari repositori.');
    }
  };

  // Download a file
  const handleDownloadFile = async (file: ProjectFile) => {
    let url = file.dataUrl;
    if (!url) {
      const blob = await getFileBlob(file.id);
      if (blob) {
        url = URL.createObjectURL(blob);
      }
    }

    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Create a mock download text file if no binary exists
      const dummyBlob = new Blob([`atelier INHM Project File: ${file.name}\nProject: ${deliverable.name}\nSize: ${file.size} bytes`], {
        type: file.type || 'text/plain',
      });
      const dummyUrl = URL.createObjectURL(dummyBlob);
      const a = document.createElement('a');
      a.href = dummyUrl;
      a.download = file.name;
      a.click();
    }
  };

  // Open Preview Modal
  const handleOpenPreview = async (file: ProjectFile) => {
    setPreviewFile(file);
    if (file.dataUrl) {
      setPreviewBlobUrl(file.dataUrl);
    } else {
      const blob = await getFileBlob(file.id);
      if (blob) {
        setPreviewBlobUrl(URL.createObjectURL(blob));
      } else {
        setPreviewBlobUrl(null);
      }
    }
  };

  const renderFileCategoryBadge = (category: string) => {
    switch (category) {
      case 'pdf':
        return <span className="px-2 py-0.5 bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 rounded font-medium text-[10px]">PDF</span>;
      case 'presentation':
        return <span className="px-2 py-0.5 bg-amber-950/30 text-amber-400 border border-amber-800/40 rounded font-medium text-[10px]">PPTX / SLIDES</span>;
      case 'video':
        return <span className="px-2 py-0.5 bg-purple-950/30 text-purple-400 border border-purple-800/40 rounded font-medium text-[10px]">VIDEO MP4</span>;
      case 'document':
        return <span className="px-2 py-0.5 bg-blue-950/30 text-blue-400 border border-blue-800/40 rounded font-medium text-[10px]">WORD / DOCX</span>;
      case 'sheet':
        return <span className="px-2 py-0.5 bg-emerald-950/30 text-emerald-400 border border-emerald-800/40 rounded font-medium text-[10px]">SPREADSHEET</span>;
      case 'cad':
        return <span className="px-2 py-0.5 bg-amber-950/30 text-amber-400 border border-amber-800/40 rounded font-medium text-[10px]">CAD / 3D MODEL</span>;
      default:
        return <span className="px-2 py-0.5 bg-[#1A1A1A] text-[#888888] border border-[#333333] rounded font-medium text-[10px]">FILE</span>;
    }
  };

  return (
    <div
      id="file-manager-drawer-overlay"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end transition-opacity"
      onClick={onClose}
    >
      <div
        id="file-manager-drawer-content"
        className={`w-full max-w-2xl h-full flex flex-col shadow-2xl overflow-hidden border-l transition-all ${
          isDark ? 'bg-[#0F0F0F] border-[#1A1A1A] text-[#E0E0E0]' : 'bg-white border-neutral-300 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* DRAWER TOP BAR */}
        <div className="p-4 border-b border-[#1A1A1A] flex items-start justify-between bg-[#0A0A0A]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-mono font-medium bg-[#1A1A1A] text-[#E63946] border border-[#1A1A1A] rounded">
                {deliverable.projectNumber}
              </span>
              <span className="text-xs font-medium text-[#888888] uppercase tracking-wider">
                {client.name}
              </span>
            </div>
            <h2 className="text-lg font-medium tracking-wide text-white">
              {deliverable.name}
            </h2>
            <p className="text-xs text-[#888888]">
              {deliverable.detailType || 'Architectural deliverable file repository'}
            </p>
          </div>

          <button
            id="btn-close-drawer"
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-white hover:bg-[#1A1A1A] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METADATA BAR */}
        <div className="px-4 py-3 border-b border-[#1A1A1A] bg-[#0D0D0D] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-medium text-[#666666] block">Type</span>
            <span className="font-normal capitalize text-[#E0E0E0]">{deliverable.projectType}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-medium text-[#666666] block">Status</span>
            <span className="font-normal uppercase text-[10px] text-[#E63946]">{deliverable.status}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-medium text-[#666666] block">Size / Year</span>
            <span className="font-normal text-[#E0E0E0]">{deliverable.size || '-'} • {deliverable.year}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-medium text-[#666666] block">Deadline</span>
            <span className="font-medium text-[#E63946]">{formatDisplayDate(deliverable.deadline)}</span>
          </div>
        </div>

        {/* TOAST FEEDBACK BANNER */}
        {feedbackToast && (
          <div className="mx-4 mt-3 px-3 py-2 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{feedbackToast}</span>
            </div>
            <button
              onClick={() => setFeedbackToast(null)}
              className="text-emerald-500 hover:text-white text-xs"
            >
              ×
            </button>
          </div>
        )}

        {/* HIDDEN INPUT FOR FILE REPLACEMENT */}
        <input
          type="file"
          ref={replaceFileInputRef}
          onChange={handleQuickReplaceInputChanged}
          className="hidden"
        />

        {/* SCROLLABLE MAIN CONTENT: DROPZONE & FILES LIST */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* WEEKLY DESIGN STAGE REPORT CARD */}
          <div className="p-3.5 rounded-lg border border-[#222222] bg-[#0E0E0E]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] uppercase font-medium tracking-wider text-[#E63946] block">
                  Tahapan Perancangan Desain
                </span>
                <h3 className="text-xs font-medium text-white flex items-center gap-1.5 mt-0.5">
                  <span>Laporan Mingguan</span>
                  <span className="text-[#666666] font-normal">•</span>
                  <span className="text-[11px] text-[#AAAAAA] font-normal">{stages.currentWeek}</span>
                </h3>
              </div>
              <button
                type="button"
                id="btn-drawer-edit-stages"
                onClick={() => setIsReportModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-normal text-white bg-[#1A1A1A] hover:bg-[#E63946] border border-[#2A2A2A] hover:border-[#E63946] rounded transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Kelola Laporan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Ideation */}
              <div className="p-2.5 rounded border border-[#1A1A1A] bg-[#141414]/70">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Lightbulb className="w-3 h-3" />
                    <span className="font-medium text-[11px]">Ideation</span>
                  </div>
                  <span className="font-mono text-[10px] text-white">{stages.ideation.progress}%</span>
                </div>
                <div className="w-full bg-[#202020] h-1 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${stages.ideation.progress}%` }} />
                </div>
                <div className="text-[10px] text-[#888888] flex items-center justify-between">
                  <span className="capitalize">{stages.ideation.status}</span>
                  <span className="text-[#666666] font-mono">{stages.ideation.week}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#202020]">
                  <div className="flex items-center justify-between text-[9px] text-[#777777] mb-1">
                    <span className="text-amber-400/90 font-medium">Sudah sampai mana:</span>
                    {stages.ideation.note && <span className="font-mono text-[#555555]">{stages.ideation.note.length} kar</span>}
                  </div>
                  <textarea
                    rows={2}
                    value={stages.ideation.note}
                    placeholder="Ceritakan progres Ideation..."
                    onChange={(e) => {
                      onUpdateDeliverable(client.id, deliverable.id, {
                        designStages: {
                          ...stages,
                          ideation: {
                            ...stages.ideation,
                            note: e.target.value,
                          },
                        },
                      });
                    }}
                    className="w-full p-1.5 text-[10px] leading-relaxed bg-[#0C0C0C] border border-[#222222] rounded text-[#D0D0D0] placeholder-[#555555] focus:outline-none focus:border-[#E63946] resize-y transition-colors"
                  />
                </div>
              </div>

              {/* Concepting */}
              <div className="p-2.5 rounded border border-[#1A1A1A] bg-[#141414]/70">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 text-indigo-400">
                    <Compass className="w-3 h-3" />
                    <span className="font-medium text-[11px]">Concepting</span>
                  </div>
                  <span className="font-mono text-[10px] text-white">{stages.concepting.progress}%</span>
                </div>
                <div className="w-full bg-[#202020] h-1 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: `${stages.concepting.progress}%` }} />
                </div>
                <div className="text-[10px] text-[#888888] flex items-center justify-between">
                  <span className="capitalize">{stages.concepting.status}</span>
                  <span className="text-[#666666] font-mono">{stages.concepting.week}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#202020]">
                  <div className="flex items-center justify-between text-[9px] text-[#777777] mb-1">
                    <span className="text-indigo-400/90 font-medium">Sudah sampai mana:</span>
                    {stages.concepting.note && <span className="font-mono text-[#555555]">{stages.concepting.note.length} kar</span>}
                  </div>
                  <textarea
                    rows={2}
                    value={stages.concepting.note}
                    placeholder="Ceritakan progres Concepting..."
                    onChange={(e) => {
                      onUpdateDeliverable(client.id, deliverable.id, {
                        designStages: {
                          ...stages,
                          concepting: {
                            ...stages.concepting,
                            note: e.target.value,
                          },
                        },
                      });
                    }}
                    className="w-full p-1.5 text-[10px] leading-relaxed bg-[#0C0C0C] border border-[#222222] rounded text-[#D0D0D0] placeholder-[#555555] focus:outline-none focus:border-[#E63946] resize-y transition-colors"
                  />
                </div>
              </div>

              {/* Modeling */}
              <div className="p-2.5 rounded border border-[#1A1A1A] bg-[#141414]/70">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 text-[#E63946]">
                    <Box className="w-3 h-3" />
                    <span className="font-medium text-[11px]">Modeling</span>
                  </div>
                  <span className="font-mono text-[10px] text-white">{stages.modeling.progress}%</span>
                </div>
                <div className="w-full bg-[#202020] h-1 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-[#E63946] h-full rounded-full" style={{ width: `${stages.modeling.progress}%` }} />
                </div>
                <div className="text-[10px] text-[#888888] flex items-center justify-between">
                  <span className="capitalize">{stages.modeling.status}</span>
                  <span className="text-[#666666] font-mono">{stages.modeling.week}</span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#202020]">
                  <div className="flex items-center justify-between text-[9px] text-[#777777] mb-1">
                    <span className="text-rose-400/90 font-medium">Sudah sampai mana:</span>
                    {stages.modeling.note && <span className="font-mono text-[#555555]">{stages.modeling.note.length} kar</span>}
                  </div>
                  <textarea
                    rows={2}
                    value={stages.modeling.note}
                    placeholder="Ceritakan progres Modeling..."
                    onChange={(e) => {
                      onUpdateDeliverable(client.id, deliverable.id, {
                        designStages: {
                          ...stages,
                          modeling: {
                            ...stages.modeling,
                            note: e.target.value,
                          },
                        },
                      });
                    }}
                    className="w-full p-1.5 text-[10px] leading-relaxed bg-[#0C0C0C] border border-[#222222] rounded text-[#D0D0D0] placeholder-[#555555] focus:outline-none focus:border-[#E63946] resize-y transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DRAG & DROP UPLOAD ZONE */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="*/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <input
              type="file"
              ref={excelFileInputRef}
              multiple
              accept=".xlsx,.xls,.csv,.tsv,.ods,.numbers,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div
              id="file-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-lg border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#E63946] bg-[#E63946]/10'
                  : 'border-[#1A1A1A] hover:border-[#E63946] bg-[#0A0A0A] hover:bg-[#111111]'
              }`}
            >
              <div className="w-10 h-10 mx-auto mb-2 rounded bg-[#141414] border border-[#1A1A1A] flex items-center justify-center text-[#E63946]">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-medium text-white">
                {uploading ? 'Memproses dan menyimpan berkas...' : 'Upload Berkas Proyek (Semua Format)'}
              </h3>
              <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto leading-relaxed">
                Tarik & lepas berkas ke sini atau klik untuk memilih. Mendukung penuh Excel (.xlsx, .xls, .csv), PDF denah, Word, PPTX, Video walkthrough, dan CAD.
              </p>
              <div className="flex items-center justify-center flex-wrap gap-2 mt-2.5 text-[10px] uppercase tracking-wider font-medium">
                <span className="text-emerald-400 font-semibold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">EXCEL & CSV (.xlsx/.csv)</span>
                <span className="text-[#666666]">•</span>
                <span className="text-[#AAAAAA]">PDF</span>
                <span className="text-[#666666]">•</span>
                <span className="text-[#AAAAAA]">WORD</span>
                <span className="text-[#666666]">•</span>
                <span className="text-[#AAAAAA]">PPTX</span>
                <span className="text-[#666666]">•</span>
                <span className="text-[#AAAAAA]">VIDEO</span>
                <span className="text-[#666666]">•</span>
                <span className="text-[#AAAAAA]">CAD / 3D</span>
              </div>
            </div>

            {/* Quick Action Button for Direct Excel / Spreadsheet Upload */}
            <div className="mt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                id="btn-upload-excel-direct"
                onClick={(e) => {
                  e.stopPropagation();
                  excelFileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-normal text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/50 hover:border-emerald-700 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
                <span>+ Upload Berkas Excel / Spreadsheet (.xlsx, .xls, .csv)</span>
              </button>
            </div>
          </div>

          {/* FILES REPOSITORY LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium uppercase tracking-wider text-[#888888] flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-[#E63946]" />
                <span>ATTACHED FILES ({deliverable.files.length})</span>
              </h4>
              <span className="text-[11px] text-[#666666]">
                Total: {formatFileSize(deliverable.files.reduce((a, f) => a + f.size, 0))}
              </span>
            </div>

            {deliverable.files.length === 0 ? (
              <div className="p-8 text-center border border-[#1A1A1A] rounded-lg bg-[#0A0A0A] text-[#666666] text-xs">
                No files uploaded for this deliverable yet. Use the upload box above to add project assets.
              </div>
            ) : (
              <div className="space-y-2">
                {deliverable.files.map((file) => (
                  <div
                    key={file.id}
                    id={`file-item-${file.id}`}
                    className="p-3 rounded-lg border border-[#1A1A1A] bg-[#141414] hover:bg-[#161616] hover:border-[#333333] flex items-center justify-between gap-3 group transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {renderFileCategoryBadge(file.category)}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#E0E0E0] truncate group-hover:text-white">
                          {file.name}
                        </p>
                        <p className="text-[10px] text-[#888888] flex items-center gap-2 mt-0.5">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>Uploaded {formatDisplayDate(file.uploadDate)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Re-upload / Ganti Berkas (Salah upload atau ada revisi) */}
                      <button
                        title="Ganti berkas ini (Salah upload / revisi baru)"
                        onClick={() => handleTriggerQuickReplace(file.id)}
                        className="p-1.5 text-[#888888] hover:text-[#E63946] hover:bg-[#1A1A1A] rounded transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit File Name / Category */}
                      <button
                        title="Edit nama atau kategori berkas"
                        onClick={() => setEditingFile(file)}
                        className="p-1.5 text-[#888888] hover:text-white hover:bg-[#1A1A1A] rounded transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Preview Button for Video/Image/PDF */}
                      <button
                        title="Preview file"
                        onClick={() => handleOpenPreview(file)}
                        className="p-1.5 text-[#888888] hover:text-white hover:bg-[#1A1A1A] rounded transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Download Button */}
                      <button
                        title="Download file"
                        onClick={() => handleDownloadFile(file)}
                        className="p-1.5 text-[#888888] hover:text-white hover:bg-[#1A1A1A] rounded transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Delete Button */}
                      <button
                        title="Hapus berkas"
                        onClick={() => handleDeleteFile(file.id, file.name)}
                        className="p-1.5 text-[#555555] hover:text-[#E63946] hover:bg-[#1A1A1A] rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PREVIEW MODAL OVERLAY (LIGHTBOX / VIDEO PLAYER) */}
        {previewFile && (
          <div
            className="fixed inset-0 bg-black/90 z-60 flex items-center justify-center p-4 backdrop-blur-md"
            onClick={() => {
              setPreviewFile(null);
              setPreviewBlobUrl(null);
            }}
          >
            <div
              className="bg-[#0F0F0F] border border-[#1A1A1A] rounded-lg max-w-3xl w-full p-4 space-y-4 overflow-hidden relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E63946]" />
                  <h3 className="text-sm font-medium text-white truncate max-w-md">
                    {previewFile.name}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setPreviewFile(null);
                    setPreviewBlobUrl(null);
                  }}
                  className="p-1 text-[#888888] hover:text-white rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview Content */}
              <div className="min-h-[300px] max-h-[500px] flex items-center justify-center bg-[#0A0A0A] rounded overflow-hidden border border-[#1A1A1A] p-2">
                {previewFile.category === 'video' ? (
                  previewBlobUrl ? (
                    <video
                      controls
                      autoPlay
                      src={previewBlobUrl}
                      className="w-full max-h-[460px] rounded"
                    />
                  ) : (
                    <div className="text-center p-8 space-y-3">
                      <Film className="w-12 h-12 mx-auto text-[#E63946]" />
                      <p className="text-xs text-[#888888]">Video Walkthrough Asset</p>
                      <button
                        onClick={() => handleDownloadFile(previewFile)}
                        className="px-4 py-2 text-xs font-medium uppercase tracking-wider bg-[#E63946] hover:bg-[#A01A26] text-white rounded transition-colors"
                      >
                        Download Video MP4 ({formatFileSize(previewFile.size)})
                      </button>
                    </div>
                  )
                ) : previewFile.category === 'sheet' ? (
                  <div className="text-center p-8 space-y-3 max-w-sm">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{previewFile.name}</h4>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded text-[10px] font-mono uppercase tracking-wider">
                        Excel / Spreadsheet ({formatFileSize(previewFile.size)})
                      </span>
                    </div>
                    <p className="text-xs text-[#888888] leading-relaxed">
                      Berkas spreadsheet arsitektur (RAB, Bill of Quantities, estimasi material & jadwal). Siap dibuka di Microsoft Excel, Google Sheets, atau Numbers.
                    </p>
                    <button
                      onClick={() => handleDownloadFile(previewFile)}
                      className="w-full py-2.5 text-xs font-medium uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File Excel ({formatFileSize(previewFile.size)})</span>
                    </button>
                  </div>
                ) : previewFile.category === 'image' ? (
                  previewBlobUrl ? (
                    <img
                      src={previewBlobUrl}
                      alt={previewFile.name}
                      className="max-h-[460px] max-w-full object-contain rounded"
                    />
                  ) : (
                    <div className="text-center p-8 text-[#888888] text-xs">Image asset preview unavailable</div>
                  )
                ) : (
                  <div className="text-center p-8 space-y-3 max-w-sm">
                    <FileText className="w-12 h-12 mx-auto text-[#E63946]" />
                    <h4 className="text-sm font-medium text-white">{previewFile.name}</h4>
                    <p className="text-xs text-[#888888]">
                      {previewFile.category.toUpperCase()} document ({formatFileSize(previewFile.size)}). Direct browser preview or download.
                    </p>
                    <button
                      onClick={() => handleDownloadFile(previewFile)}
                      className="w-full py-2 text-xs font-medium uppercase tracking-wider bg-[#E63946] hover:bg-[#A01A26] text-white rounded transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* WEEKLY DESIGN STAGE REPORT MODAL */}
      {isReportModalOpen && (
        <WeeklyDesignReportModal
          isOpen={isReportModalOpen}
          deliverable={deliverable}
          client={client}
          isDark={isDark}
          onClose={() => setIsReportModalOpen(false)}
          onSave={(clientId, deliverableId, updatedStages) => {
            onUpdateDeliverable(clientId, deliverableId, { designStages: updatedStages });
            setIsReportModalOpen(false);
          }}
        />
      )}

      {/* EDIT / REPAIR FILE MODAL */}
      {editingFile && (
        <EditFileModal
          isOpen={!!editingFile}
          file={editingFile}
          projectName={deliverable.name}
          isDark={isDark}
          onClose={() => setEditingFile(null)}
          onSave={(fileId, updated) => {
            handleUpdateFile(fileId, updated);
            setEditingFile(null);
          }}
          onDelete={(fileId) => {
            handleDeleteFile(fileId, editingFile.name);
            setEditingFile(null);
          }}
          onReplaceFile={async (fileId, newFile) => {
            await handleReplaceFile(fileId, newFile);
          }}
        />
      )}
    </div>
  );
};

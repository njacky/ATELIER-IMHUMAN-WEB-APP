import React, { useState, useRef } from 'react';
import { ClientGroup, Deliverable, ProjectFile, FileCategory } from '../types';
import {
  FolderLock,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  FileText,
  Film,
  FileSpreadsheet,
  FileCode,
  Paperclip,
  ExternalLink,
  Layers,
  Building,
  RefreshCw,
  Pencil,
  CheckCircle2,
  X,
  Maximize2
} from 'lucide-react';
import { formatFileSize, getFileBlob, saveFileBlob, deleteFileBlob, getFileCategory } from '../lib/storage';
import { formatDisplayDate } from '../lib/dateUtils';
import { EditFileModal } from './EditFileModal';

interface FilesVaultViewProps {
  clients: ClientGroup[];
  onOpenFileDrawer: (deliverable: Deliverable, client: ClientGroup) => void;
  onUpdateDeliverable?: (clientId: string, deliverableId: string, updated: Partial<Deliverable>) => void;
  isDark: boolean;
}

export const FilesVaultView: React.FC<FilesVaultViewProps> = ({
  clients,
  onOpenFileDrawer,
  onUpdateDeliverable,
  isDark,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [fileSearch, setFileSearch] = useState<string>('');
  const [editingFile, setEditingFile] = useState<EnrichedFile | null>(null);
  const [replaceTargetFile, setReplaceTargetFile] = useState<EnrichedFile | null>(null);
  const [previewFile, setPreviewFile] = useState<EnrichedFile | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Collect all files with their parent deliverable & client
  interface EnrichedFile extends ProjectFile {
    deliverable: Deliverable;
    client: ClientGroup;
  }

  const allFiles: EnrichedFile[] = [];
  clients.forEach((client) => {
    client.deliverables.forEach((del) => {
      del.files.forEach((file) => {
        allFiles.push({
          ...file,
          deliverable: del,
          client,
        });
      });
    });
  });

  // Filter files
  const filteredFiles = allFiles.filter((file) => {
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    const matchesQuery =
      !fileSearch ||
      file.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
      file.deliverable.name.toLowerCase().includes(fileSearch.toLowerCase()) ||
      file.client.name.toLowerCase().includes(fileSearch.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleDownload = async (file: EnrichedFile) => {
    let url = file.dataUrl;
    if (!url) {
      const blob = await getFileBlob(file.id);
      if (blob) {
        url = URL.createObjectURL(blob);
      }
    }
    const a = document.createElement('a');
    a.href = url || `data:text/plain;charset=utf-8,${encodeURIComponent('atelier INHM File: ' + file.name)}`;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenPreview = async (file: EnrichedFile) => {
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

  const handleTriggerQuickReplace = (file: EnrichedFile) => {
    setReplaceTargetFile(file);
    replaceFileInputRef.current?.click();
  };

  const handleQuickReplaceInputChanged = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !replaceTargetFile || !onUpdateDeliverable) return;
    const newFile = files[0];
    await handleReplaceFile(replaceTargetFile, newFile);
    setReplaceTargetFile(null);
    if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
  };

  const handleReplaceFile = async (targetFile: EnrichedFile, newFile: File) => {
    if (!onUpdateDeliverable) return;
    await saveFileBlob(targetFile.id, newFile);
    const today = new Date().toISOString().split('T')[0];
    const category = getFileCategory(newFile.name, newFile.type);

    let dataUrl: string | undefined = undefined;
    if (newFile.type.startsWith('image/') || newFile.type.startsWith('video/') || newFile.type.includes('pdf')) {
      dataUrl = URL.createObjectURL(newFile);
    }

    const updatedFiles = targetFile.deliverable.files.map((f) => {
      if (f.id !== targetFile.id) return f;
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

    onUpdateDeliverable(targetFile.client.id, targetFile.deliverable.id, { files: updatedFiles });

    if (previewFile?.id === targetFile.id) {
      setPreviewFile({
        ...targetFile,
        name: newFile.name,
        size: newFile.size,
        category,
        dataUrl,
      });
      if (dataUrl) setPreviewBlobUrl(dataUrl);
    }

    showToast(`Berkas berhasil diganti dengan "${newFile.name}".`);
  };

  const handleUpdateFile = (targetFile: EnrichedFile, updated: Partial<ProjectFile>) => {
    if (!onUpdateDeliverable) return;
    const updatedFiles = targetFile.deliverable.files.map((f) =>
      f.id === targetFile.id ? { ...f, ...updated } : f
    );
    onUpdateDeliverable(targetFile.client.id, targetFile.deliverable.id, { files: updatedFiles });
    showToast('Informasi berkas berhasil diperbarui.');
  };

  const handleDeleteFile = async (targetFile: EnrichedFile) => {
    if (!onUpdateDeliverable) return;
    if (confirm(`Hapus berkas "${targetFile.name}" dari repositori proyek "${targetFile.deliverable.name}"?`)) {
      await deleteFileBlob(targetFile.id);
      const filtered = targetFile.deliverable.files.filter((f) => f.id !== targetFile.id);
      onUpdateDeliverable(targetFile.client.id, targetFile.deliverable.id, { files: filtered });
      if (previewFile?.id === targetFile.id) {
        setPreviewFile(null);
        setPreviewBlobUrl(null);
      }
      showToast('Berkas berhasil dihapus.');
    }
  };

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'pdf', label: 'PDF Blueprints' },
    { id: 'document', label: 'Word / Briefs' },
    { id: 'presentation', label: 'PowerPoint PPTX' },
    { id: 'video', label: 'Videos / Renders' },
    { id: 'sheet', label: 'Spreadsheets' },
    { id: 'cad', label: 'CAD / 3D' },
  ];

  return (
    <div id="files-vault-view" className="space-y-6 pb-20">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-3 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 hover:text-white text-xs">
            ×
          </button>
        </div>
      )}

      {/* Hidden File Input for Quick Re-upload */}
      <input
        type="file"
        ref={replaceFileInputRef}
        onChange={handleQuickReplaceInputChanged}
        className="hidden"
      />

      {/* Top Header & Search */}
      <div
        className={`p-4 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isDark ? 'bg-[#0F0F0F] border-[#1A1A1A]' : 'bg-white border-neutral-200 shadow-sm'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FolderLock className="w-4 h-4 text-[#E63946]" />
            <h2 className="text-base font-medium tracking-wider uppercase text-white">
              Central Project File Vault
            </h2>
          </div>
          <p className="text-xs text-[#888888]">
            Kumpulan seluruh dokumen proyek, slide presentasi PPTX, video walkthrough, dan berkas CAD lintas klien.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Cari nama berkas, proyek, atau klien..."
            value={fileSearch}
            onChange={(e) => setFileSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 text-xs rounded border transition-colors focus:outline-none focus:border-[#E63946] ${
              isDark
                ? 'bg-[#141414] border-[#222222] text-[#E0E0E0] placeholder-[#555555]'
                : 'bg-neutral-50 border-neutral-300 text-neutral-900 placeholder-neutral-400'
            }`}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const count =
            cat.id === 'all'
              ? allFiles.length
              : allFiles.filter((f) => f.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#E63946] text-white shadow-sm'
                  : isDark
                  ? 'bg-[#141414] text-[#888888] hover:text-[#E0E0E0] border border-[#1F1F1F]'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 border border-neutral-200'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  selectedCategory === cat.id
                    ? 'bg-black/20 text-white'
                    : isDark
                    ? 'bg-[#1F1F1F] text-[#666666]'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Files Grid / Table */}
      <div
        className={`rounded-lg border overflow-hidden ${
          isDark ? 'bg-[#0F0F0F] border-[#1A1A1A]' : 'bg-white border-neutral-200'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] text-[10px] font-medium uppercase tracking-wider text-[#666666]">
                <th className="py-3 px-4">File Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Project & Deliverable</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#666666] text-xs">
                    No files found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-[#141414] transition-colors group text-[#E0E0E0]"
                  >
                    <td className="py-3 px-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-3.5 h-3.5 text-[#E63946] shrink-0" />
                        <span className="truncate max-w-xs">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase bg-[#141414] border border-[#1A1A1A] text-[#888888]">
                        {file.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onOpenFileDrawer(file.deliverable, file.client)}
                        className="text-left font-medium text-[#E0E0E0] hover:text-[#E63946] flex items-center gap-1.5 group/link cursor-pointer"
                      >
                        <span className="font-mono text-[#E63946] text-[10px] bg-[#141414] px-1 py-0.5 rounded border border-[#1A1A1A]">
                          {file.deliverable.projectNumber}
                        </span>
                        <span className="truncate max-w-[180px]">{file.deliverable.name}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-[#888888] truncate max-w-[140px]">
                      {file.client.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#888888]">{formatFileSize(file.size)}</td>
                    <td className="py-3 px-4 text-[#888888]">{formatDisplayDate(file.uploadDate)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Replace Button (Salah Upload / Revisi) */}
                        <button
                          title="Ganti berkas ini (Re-upload jika salah upload atau ada revisi)"
                          onClick={() => handleTriggerQuickReplace(file)}
                          className="p-1.5 text-[#888888] hover:text-[#E63946] hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit File Info Button */}
                        <button
                          title="Edit nama atau kategori berkas"
                          onClick={() => setEditingFile(file)}
                          className="p-1.5 text-[#888888] hover:text-white hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Preview button */}
                        <button
                          title="Preview file"
                          onClick={() => handleOpenPreview(file)}
                          className="p-1.5 text-[#888888] hover:text-white hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Download button */}
                        <button
                          title="Download file"
                          onClick={() => handleDownload(file)}
                          className="p-1.5 text-[#888888] hover:text-white hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          title="Hapus berkas ini"
                          onClick={() => handleDeleteFile(file)}
                          className="p-1.5 text-[#555555] hover:text-[#E63946] hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Open Drawer */}
                        <button
                          title="Buka panel file manager proyek"
                          onClick={() => onOpenFileDrawer(file.deliverable, file.client)}
                          className="p-1.5 text-[#888888] hover:text-[#E63946] hover:bg-[#1A1A1A] rounded transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit File Modal */}
      {editingFile && (
        <EditFileModal
          isOpen={!!editingFile}
          file={editingFile}
          projectName={`${editingFile.deliverable.projectNumber} • ${editingFile.deliverable.name}`}
          isDark={isDark}
          onClose={() => setEditingFile(null)}
          onSave={(fileId, updated) => {
            handleUpdateFile(editingFile, updated);
            setEditingFile(null);
          }}
          onDelete={() => {
            handleDeleteFile(editingFile);
            setEditingFile(null);
          }}
          onReplaceFile={async (fileId, newFile) => {
            await handleReplaceFile(editingFile, newFile);
          }}
        />
      )}

      {/* Preview Lightbox / Player Modal */}
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
                <p className="text-xs font-mono font-medium text-white truncate max-w-md">
                  {previewFile.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setPreviewFile(null);
                  setPreviewBlobUrl(null);
                }}
                className="p-1 text-[#888888] hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto bg-[#070707] rounded border border-[#1A1A1A] p-2">
              {previewFile.category === 'video' ? (
                previewBlobUrl ? (
                  <video src={previewBlobUrl} controls autoPlay className="max-w-full max-h-[65vh] rounded" />
                ) : (
                  <div className="text-center p-8 space-y-2">
                    <Film className="w-12 h-12 text-[#E63946] mx-auto opacity-80" />
                    <p className="text-xs text-[#AAAAAA]">Video Player Preview</p>
                  </div>
                )
              ) : previewFile.category === 'image' ? (
                previewBlobUrl ? (
                  <img src={previewBlobUrl} alt={previewFile.name} className="max-w-full max-h-[65vh] object-contain rounded" />
                ) : (
                  <div className="text-center p-8 space-y-2">
                    <Paperclip className="w-12 h-12 text-[#E63946] mx-auto opacity-80" />
                    <p className="text-xs text-[#AAAAAA]">Image Preview</p>
                  </div>
                )
              ) : (
                <div className="text-center p-8 space-y-3">
                  <FileText className="w-12 h-12 text-[#E63946] mx-auto opacity-80" />
                  <p className="text-xs text-white font-medium">{previewFile.name}</p>
                  <p className="text-[11px] text-[#888888]">
                    Format {previewFile.category.toUpperCase()} • Ukuran {formatFileSize(previewFile.size)}
                  </p>
                  <button
                    onClick={() => handleDownload(previewFile)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-normal text-white bg-[#E63946] hover:bg-[#C52B37] rounded transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Berkas</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

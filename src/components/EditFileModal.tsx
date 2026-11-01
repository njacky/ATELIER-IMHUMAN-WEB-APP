import React, { useState, useRef } from 'react';
import { ProjectFile, FileCategory } from '../types';
import { X, Save, RefreshCw, Trash2, FileText, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { formatFileSize, getFileCategory, saveFileBlob, deleteFileBlob } from '../lib/storage';

interface EditFileModalProps {
  isOpen: boolean;
  file: ProjectFile | null;
  projectName?: string;
  onClose: () => void;
  onSave: (fileId: string, updated: Partial<ProjectFile>) => void;
  onDelete: (fileId: string) => void;
  onReplaceFile: (fileId: string, newFile: File) => Promise<void>;
  isDark: boolean;
}

export const EditFileModal: React.FC<EditFileModalProps> = ({
  isOpen,
  file,
  projectName,
  onClose,
  onSave,
  onDelete,
  onReplaceFile,
  isDark,
}) => {
  if (!isOpen || !file) return null;

  const [fileName, setFileName] = useState(file.name);
  const [category, setCategory] = useState<FileCategory>(file.category);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [replaceSuccessMsg, setReplaceSuccessMsg] = useState('');
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const categories: { id: FileCategory; label: string }[] = [
    { id: 'pdf', label: 'PDF Blueprint / Document' },
    { id: 'presentation', label: 'PowerPoint PPTX / Slides' },
    { id: 'video', label: 'Video MP4 / Walkthrough' },
    { id: 'document', label: 'Word DOCX / Spec Brief' },
    { id: 'sheet', label: 'Excel / CSV Spreadsheet' },
    { id: 'cad', label: 'CAD DWG / 3D Model' },
    { id: 'image', label: 'Image JPG / PNG / WebP' },
    { id: 'other', label: 'Berkas Lainnya' },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) {
      alert('Nama file tidak boleh kosong');
      return;
    }
    onSave(file.id, {
      name: fileName.trim(),
      category,
    });
    onClose();
  };

  const handleFileReplaced = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newFile = files[0];
    setIsReplacing(true);
    try {
      await onReplaceFile(file.id, newFile);
      setFileName(newFile.name);
      setCategory(getFileCategory(newFile.name, newFile.type));
      setReplaceSuccessMsg(`Berkas berhasil diganti dengan "${newFile.name}" (${formatFileSize(newFile.size)})`);
      setTimeout(() => setReplaceSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      alert('Gagal mengganti berkas.');
    } finally {
      setIsReplacing(false);
      if (replaceInputRef.current) replaceInputRef.current.value = '';
    }
  };

  return (
    <div
      id="edit-file-modal-overlay"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="edit-file-modal-card"
        className={`w-full max-w-lg rounded-lg border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-[#111111] border-[#222222] text-[#E0E0E0]'
            : 'bg-white border-neutral-300 text-neutral-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-[#222222] bg-[#0C0C0C]' : 'border-neutral-200 bg-neutral-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-[#E63946]" />
            <div>
              <h2 className="text-sm font-medium uppercase tracking-wider text-white">
                Kelola / Perbaiki Berkas Proyek
              </h2>
              {projectName && (
                <p className="text-[10px] text-[#888888] truncate mt-0.5">{projectName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Success Banner */}
          {replaceSuccessMsg && (
            <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{replaceSuccessMsg}</span>
            </div>
          )}

          {/* Re-upload / Ganti Berkas Highlight Box */}
          <div className="p-3.5 rounded-lg border border-[#222222] bg-[#0A0A0A]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[#E63946]">
                Salah Upload atau Ada Revisi?
              </span>
              <span className="text-[10px] text-[#666666] font-mono">
                Ukuran: {formatFileSize(file.size)}
              </span>
            </div>

            <p className="text-xs text-[#888888] mb-3">
              Ganti isi berkas ini dengan dokumen baru tanpa kehilangan metadata atau tautan fase.
            </p>

            <input
              type="file"
              ref={replaceInputRef}
              onChange={handleFileReplaced}
              className="hidden"
            />

            <button
              type="button"
              id="btn-reupload-file-replace"
              disabled={isReplacing}
              onClick={() => replaceInputRef.current?.click()}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-normal text-white bg-[#1A1A1A] hover:bg-[#E63946] border border-[#333333] hover:border-[#E63946] rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isReplacing ? 'animate-spin' : ''}`} />
              <span>{isReplacing ? 'Mengunggah & Mengganti...' : 'Pilih Berkas Pengganti (Re-upload)'}</span>
            </button>
          </div>

          {/* Rename File Name */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
              Nama Berkas / File Name *
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
              placeholder="Contoh: INHM_Masterplan_Rev4_Approved.dwg"
              required
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
              Kategori / Tipe Berkas
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FileCategory)}
              className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-3 border-t border-[#222222]">
            <div className="p-3 rounded border border-red-950/40 bg-red-950/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Hapus Berkas Ini</span>
                </p>
                <p className="text-[10px] text-[#888888] mt-0.5">
                  Menghapus berkas secara permanen dari penyimpanan proyek.
                </p>
              </div>

              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-xs text-[#888888] hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onDelete(file.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="px-2.5 py-1 text-xs text-red-400 hover:text-white hover:bg-red-600/80 border border-red-900/50 rounded transition-colors cursor-pointer"
                >
                  Hapus File
                </button>
              )}
            </div>
          </div>

          {/* Footer Actions */}
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

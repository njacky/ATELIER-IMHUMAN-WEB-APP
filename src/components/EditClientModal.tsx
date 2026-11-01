import React, { useState, useEffect } from 'react';
import { ClientGroup } from '../types';
import { X, Save, Trash2, Building, AlertTriangle, Sparkles } from 'lucide-react';

interface EditClientModalProps {
  isOpen: boolean;
  client: ClientGroup | null;
  onClose: () => void;
  onSave: (clientId: string, updated: Partial<ClientGroup>) => void;
  onDelete: (clientId: string) => void;
  isDark: boolean;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  client,
  onClose,
  onSave,
  onDelete,
  isDark,
}) => {
  if (!isOpen || !client) return null;

  const [name, setName] = useState(client.name);
  const [background, setBackground] = useState(client.background);
  const [concept, setConcept] = useState(client.concept);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name);
      setBackground(client.background);
      setConcept(client.concept);
      setConfirmDelete(false);
    }
  }, [client]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Nama client tidak boleh kosong');
      return;
    }

    onSave(client.id, {
      name: name.trim(),
      background: background.trim(),
      concept: concept.trim(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(client.id);
      onClose();
    } else {
      setConfirmDelete(true);
    }
  };

  return (
    <div
      id="edit-client-modal-overlay"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="edit-client-modal-card"
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
            <Building className="w-4 h-4 text-[#E63946]" />
            <h2 className="text-sm font-medium uppercase tracking-wider text-white">
              Edit Data Client
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-[#888888] hover:text-white hover:bg-[#1A1A1A] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
              Nama Client / Entitas *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946]"
              placeholder="Contoh: Alila Hospitality Group"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1">
              Latar Belakang / Deskripsi Proyek
            </label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946] resize-none"
              placeholder="Jelaskan kebutuhan tapak, target operasional, atau demografi pengguna..."
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#888888] mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Konsep & Filosofi Desain</span>
            </label>
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs rounded bg-[#0A0A0A] border border-[#222222] text-white focus:outline-none focus:border-[#E63946] resize-none"
              placeholder="Visi arsitektural, integrasi bentang alam, atau narasi material..."
            />
          </div>

          {/* Danger Zone: Delete Client */}
          <div className="pt-3 border-t border-[#222222]">
            <div className="p-3 rounded border border-red-950/40 bg-red-950/10 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Hapus Client & Semua Fasenya</span>
                </p>
                <p className="text-[10px] text-[#888888] mt-0.5">
                  Terdapat {client.deliverables.length} deliverable di client ini.
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
                    onClick={handleDelete}
                    className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2.5 py-1 text-xs text-red-400 hover:text-white hover:bg-red-600/80 border border-red-900/50 rounded transition-colors"
                >
                  Hapus Client
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
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

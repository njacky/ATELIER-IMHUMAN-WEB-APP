import { ClientGroup, Deliverable, ProjectFile, FileCategory, DesignStagesReport } from '../types';

const STORAGE_KEY = 'atelier_inhm_clients_data_v3';
const DB_NAME = 'atelier_inhm_files_db';
const STORE_NAME = 'project_files';

// Helper to provide standard design stages report (Ideation, Concepting, Modeling)
export function getDefaultDesignStages(override?: Partial<DesignStagesReport>): DesignStagesReport {
  return {
    currentWeek: 'Minggu 1',
    ideation: {
      status: 'in progress',
      week: 'Minggu 1',
      progress: 60,
      note: 'Studi preseden & eksplorasi sketsa diagram sirkulasi',
      ...override?.ideation,
    },
    concepting: {
      status: 'not started',
      week: 'Minggu 2',
      progress: 0,
      note: 'Artikulasi massa & narasi filosofi konsep',
      ...override?.concepting,
    },
    modeling: {
      status: 'not started',
      week: 'Minggu 3',
      progress: 0,
      note: 'Digital 3D massing, struktur & simulasi visual',
      ...override?.modeling,
    },
    ...override,
  };
}

// Helper to determine file category from mime or extension
export function getFileCategory(fileName: string, mimeType: string): FileCategory {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  const lowerMime = (mimeType || '').toLowerCase();

  // 1. PDF Documents
  if (lowerMime.includes('pdf') || ext === 'pdf') return 'pdf';

  // 2. Excel & Spreadsheets (.xlsx, .xls, .csv, .tsv, .ods, .numbers, .xlsm, .xlsb)
  if (
    lowerMime.includes('sheet') ||
    lowerMime.includes('excel') ||
    lowerMime.includes('csv') ||
    lowerMime.includes('spreadsheet') ||
    ['xls', 'xlsx', 'csv', 'tsv', 'ods', 'xlsm', 'xlsb', 'xltx', 'numbers'].includes(ext)
  ) {
    return 'sheet';
  }

  // 3. Word & Text Documents
  if (lowerMime.includes('word') || ['doc', 'docx', 'odt', 'rtf', 'txt', 'pages'].includes(ext)) return 'document';

  // 4. Presentations (PowerPoint, Keynote)
  if (lowerMime.includes('presentation') || lowerMime.includes('powerpoint') || ['ppt', 'pptx', 'key', 'odp'].includes(ext)) return 'presentation';

  // 5. Videos
  if (lowerMime.includes('video') || ['mp4', 'mov', 'webm', 'mkv', 'avi'].includes(ext)) return 'video';

  // 6. CAD & 3D Architectural Models
  if (['dwg', 'dxf', 'obj', 'fbx', '3ds', 'blend', 'skp', 'rvt', 'ifc', '3dm'].includes(ext)) return 'cad';

  // 7. Images
  if (lowerMime.includes('image') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif', 'bmp', 'tiff'].includes(ext)) return 'image';

  return 'other';
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Open IndexedDB database
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Save a file blob into IndexedDB
export async function saveFileBlob(fileId: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({ id: fileId, blob });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save file blob in IndexedDB:', err);
  }
}

// Retrieve file blob from IndexedDB
export async function getFileBlob(fileId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fileId);
      req.onsuccess = () => {
        resolve(req.result ? req.result.blob : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Delete file blob from IndexedDB
export async function deleteFileBlob(fileId: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(fileId);
  } catch (err) {
    console.warn('Failed to delete file from IndexedDB:', err);
  }
}

// Helper to create a dummy sample file for initial state
function createSampleFile(
  id: string,
  name: string,
  size: number,
  category: FileCategory,
  type: string,
  uploadDate: string
): ProjectFile {
  return {
    id,
    name,
    size,
    category,
    type,
    uploadDate,
  };
}

// Default Seed Data tailored for atelier INHM architectural practice
export const INITIAL_CLIENT_GROUPS: ClientGroup[] = [
  {
    id: 'client-1',
    name: 'PT. Samudera Graha Nusantara',
    background: 'Inisiasi proyek berawal dari sayembara tertutup masterplan maritim kepulauan timur. Klien membutuhkan arsitektur vernakular kontemporer dengan integritas struktural tinggi menghadapi iklim pesisir korosif dan minim pemeliharaan buatan.',
    concept: 'Tidal Monolith — Interaksi artikulasi massa batu alam lokal dan bukaan kisi kisi aerodinamis yang memanfaatkan ventilasi silang laut.',
    deliverables: [
      {
        id: 'del-101',
        projectNumber: '#INHM-041',
        name: 'Nusantara Pavilion & Cultural Center',
        clientId: 'client-1',
        clientName: 'PT. Samudera Graha Nusantara',
        projectType: 'public spaces',
        detailType: 'Maritime Heritage Amphitheatre & Exhibition Gallery',
        location: 'Labuan Bajo, NTT',
        status: 'in review',
        size: '3,400 m²',
        year: '2026',
        madeBy: 'atelier INHM × Studio Kroma',
        deadline: '2026-09-09',
        designStages: {
          currentWeek: 'Minggu 3',
          ideation: {
            status: 'completed',
            week: 'Minggu 1',
            progress: 100,
            note: 'Sayembara tertutup & studi tapak pesisir Labuan Bajo selesai',
          },
          concepting: {
            status: 'completed',
            week: 'Minggu 2',
            progress: 100,
            note: 'Konsep Tidal Monolith & artikulasi ventilasi silang disetujui klien',
          },
          modeling: {
            status: 'in review',
            week: 'Minggu 3',
            progress: 85,
            note: 'Pemodelan Rhino 3D & simulasi akustik amphitheater v3',
          },
        },
        files: [
          createSampleFile('f-1', 'INHM041_Schematic_Design_v3.pdf', 18450000, 'pdf', 'application/pdf', '2026-09-02'),
          createSampleFile('f-excel-1', 'RAB_Cost_Estimation_BOQ.xlsx', 4850000, 'sheet', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '2026-09-04'),
          createSampleFile('f-2', 'Cultural_Center_Concept_Deck.pptx', 34200000, 'presentation', 'application/vnd.ms-powerpoint', '2026-09-04'),
          createSampleFile('f-3', 'Amphitheater_Acoustic_Walkthrough.mp4', 85000000, 'video', 'video/mp4', '2026-09-05'),
        ],
        createdAt: '2026-08-15',
        updatedAt: '2026-09-05',
      },
      {
        id: 'del-102',
        projectNumber: '#INHM-042',
        name: 'Nusantara Executive Guest Residence',
        clientId: 'client-1',
        clientName: 'PT. Samudera Graha Nusantara',
        projectType: 'hospitality',
        detailType: 'Cliffside Eco-Boutique Suites & Plunge Pool Cantilever',
        location: 'Labuan Bajo, NTT',
        status: 'not started',
        size: '1,250 m²',
        year: '2026',
        madeBy: '', // Empty because solo project as specified by user!
        deadline: '2026-09-11',
        designStages: {
          currentWeek: 'Minggu 1',
          ideation: {
            status: 'in progress',
            week: 'Minggu 1',
            progress: 45,
            note: 'Analisis kontur tebing curam & zonasi plunge pool cantilever',
          },
          concepting: {
            status: 'not started',
            week: 'Minggu 2',
            progress: 0,
            note: 'Sketsa awal massa kamar suites ramah gempa',
          },
          modeling: {
            status: 'not started',
            week: 'Minggu 3',
            progress: 0,
            note: 'Menunggu finalisasi titik koordinat topografi surveyor',
          },
        },
        files: [
          createSampleFile('f-4', 'Topography_Survey_Analysis.dwg', 4200000, 'cad', 'application/acad', '2026-09-01'),
          createSampleFile('f-5', 'Client_Brief_Revisions_Aug.docx', 1250000, 'document', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '2026-09-03'),
        ],
        createdAt: '2026-08-20',
        updatedAt: '2026-09-04',
      },
    ],
  },
  {
    id: 'client-2',
    name: 'Aethelgard Studio UK',
    background: 'Kolaborasi trans-benua dimulai dari kebutuhan ruang kerja desainer mode avant-garde yang menuntut atmosfer monokromatik kontemplatif namun fungsional untuk eksperimen material kain dan pencahayaan presisi tinggi.',
    concept: 'Subtractive Chiaroscuro — Reduksi elemen dekoratif menjadi artikulasi murni bayangan, beton bertulang mentah, dan aksen baja merah oksida.',
    deliverables: [
      {
        id: 'del-201',
        projectNumber: '#INHM-038',
        name: 'Aethelgard Atelier & HQ',
        clientId: 'client-2',
        clientName: 'Aethelgard Studio UK',
        projectType: 'office',
        detailType: 'Adaptive Reuse Textile Mill & Dark Minimalist Creative Studio',
        location: 'Manchester, UK',
        status: 'completed',
        size: '850 m²',
        year: '2025',
        madeBy: '',
        deadline: '2026-09-08',
        designStages: {
          currentWeek: 'Minggu 4',
          ideation: {
            status: 'completed',
            week: 'Minggu 1',
            progress: 100,
            note: 'Survey adaptive reuse bekas pabrik tekstil Manchester',
          },
          concepting: {
            status: 'completed',
            week: 'Minggu 2',
            progress: 100,
            note: 'Skema pencahayaan presisi kain & palet beton brutalist',
          },
          modeling: {
            status: 'completed',
            week: 'Minggu 4',
            progress: 100,
            note: 'BIM Revit as-built documentation & shop drawing joinery',
          },
        },
        files: [
          createSampleFile('f-6', 'Aethelgard_AsBuilt_Documentation.pdf', 28000000, 'pdf', 'application/pdf', '2026-08-28'),
          createSampleFile('f-7', 'Materiality_Samples_Matrix.xlsx', 890000, 'sheet', 'application/vnd.ms-excel', '2026-08-14'),
        ],
        createdAt: '2025-10-10',
        updatedAt: '2026-08-30',
      },
      {
        id: 'del-202',
        projectNumber: '#INHM-039',
        name: 'Aethelgard High-End Showroom',
        clientId: 'client-2',
        clientName: 'Aethelgard Studio UK',
        projectType: 'retail',
        detailType: 'Experimental Brutalist Pop-up & High-End Showroom',
        location: 'SoHo, London',
        status: 'in review',
        size: '420 m²',
        year: '2026',
        madeBy: 'atelier INHM × Studio Void London',
        deadline: '2026-09-12',
        designStages: {
          currentWeek: 'Minggu 2',
          ideation: {
            status: 'completed',
            week: 'Minggu 1',
            progress: 100,
            note: 'Studi toko SoHo & batasan regulasi fasad heritage',
          },
          concepting: {
            status: 'in progress',
            week: 'Minggu 2',
            progress: 70,
            note: 'Detail partisi baja merah oksida & flow sirkulasi',
          },
          modeling: {
            status: 'in progress',
            week: 'Minggu 3',
            progress: 40,
            note: 'Rendering simulasi cahaya directional & fixture 3D',
          },
        },
        files: [
          createSampleFile('f-8', 'Lighting_Simulation_Render.mp4', 54000000, 'video', 'video/mp4', '2026-09-03'),
          createSampleFile('f-9', 'Showroom_Joinery_Details.pdf', 14200000, 'pdf', 'application/pdf', '2026-09-04'),
        ],
        createdAt: '2026-02-12',
        updatedAt: '2026-09-04',
      },
    ],
  },
  {
    id: 'client-3',
    name: 'Komorebi Private Residence',
    background: 'Eksplorasi desain hunian keluarga yang terisolasi dari kebisingan urban, menenggelamkan sebagian volume bangunan ke lereng perbukitan berhutan bambu untuk isolasi termal alami dan privasi total.',
    concept: 'The Silent Threshold — Hubungan meditatif antara tatami, beton exposed, bidang kaca tanpa bingkai, dan pantulan air pada halaman dalam.',
    deliverables: [
      {
        id: 'del-301',
        projectNumber: '#INHM-044',
        name: 'Komorebi Villa Retreat',
        clientId: 'client-3',
        clientName: 'Komorebi Private Residence',
        projectType: 'residential',
        detailType: 'Subterranean Courtyard & Biophilic Glass Villa',
        location: 'Kyoto Suburbs (Concept Site)',
        status: 'not started',
        size: '580 m²',
        year: '2026',
        madeBy: '',
        deadline: '2026-09-10',
        designStages: {
          currentWeek: 'Minggu 1',
          ideation: {
            status: 'in progress',
            week: 'Minggu 1',
            progress: 30,
            note: 'Eksplorasi galian subterranean & orientasi sinar matahari bukit bambu',
          },
          concepting: {
            status: 'not started',
            week: 'Minggu 2',
            progress: 0,
            note: 'Harmonisasi modul tatami tradisional dan dinding beton exposed',
          },
          modeling: {
            status: 'not started',
            week: 'Minggu 3',
            progress: 0,
            note: 'Studi bayangan solar & simulasi pantulan air kolam',
          },
        },
        files: [
          createSampleFile('f-10', 'Landscape_Borders_Analysis.pdf', 8400000, 'pdf', 'application/pdf', '2026-09-02'),
          createSampleFile('f-11', 'Masterplan_Presentation_Rev2.pptx', 21300000, 'presentation', 'application/vnd.ms-powerpoint', '2026-09-03'),
        ],
        createdAt: '2026-07-01',
        updatedAt: '2026-09-03',
      },
    ],
  },
];

// Load client groups from storage or fallback to seed
export function loadClientGroups(): ClientGroup[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Hydrate any missing design stages for complete safety
        return parsed.map((c: ClientGroup) => ({
          ...c,
          deliverables: (c.deliverables || []).map((del) => ({
            ...del,
            designStages: del.designStages
              ? {
                  ...getDefaultDesignStages(),
                  ...del.designStages,
                  ideation: { ...getDefaultDesignStages().ideation, ...del.designStages.ideation },
                  concepting: { ...getDefaultDesignStages().concepting, ...del.designStages.concepting },
                  modeling: { ...getDefaultDesignStages().modeling, ...del.designStages.modeling },
                }
              : getDefaultDesignStages(),
          })),
        }));
      }
    }
  } catch (err) {
    console.error('Error loading client groups:', err);
  }
  saveClientGroups(INITIAL_CLIENT_GROUPS);
  return INITIAL_CLIENT_GROUPS;
}

// Save client groups to storage
export function saveClientGroups(groups: ClientGroup[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  } catch (err) {
    console.error('Error saving client groups:', err);
  }
}

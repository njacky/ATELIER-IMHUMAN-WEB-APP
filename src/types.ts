export type ProjectType = 'residential' | 'office' | 'retail' | 'hospitality' | 'public spaces';

export type ProjectStatus = 'not started' | 'in review' | 'completed';

export type DesignStageStatus = 'not started' | 'in progress' | 'in review' | 'completed';

export interface WeeklyStageReport {
  status: DesignStageStatus;
  week: string; // e.g. "Minggu 1", "Minggu 2", "W1"
  progress: number; // 0 - 100%
  note: string; // Laporan mingguan / catatan tahapan
  updatedAt?: string;
}

export interface DesignStagesReport {
  currentWeek: string; // e.g. "Minggu 1", "Minggu 2", "Minggu 3"
  ideation: WeeklyStageReport;
  concepting: WeeklyStageReport;
  modeling: WeeklyStageReport;
}

export type FileCategory = 'pdf' | 'document' | 'presentation' | 'video' | 'sheet' | 'cad' | 'image' | 'other';

export interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileCategory;
  uploadDate: string;
  dataUrl?: string; // Stored in IndexedDB for preview / download
  blob?: Blob;
}

export interface Deliverable {
  id: string;
  projectNumber: string; // e.g. "#INHM-041"
  name: string; // Project Name
  clientId: string;
  clientName: string;
  projectType: ProjectType;
  detailType: string; // penjelasan tipe projeknya
  location: string; // tempat asli atau project challenge
  status: ProjectStatus;
  size: string; // e.g. "1,200 m²"
  year: string; // tahun dibuat
  madeBy: string; // kosong jika sendiri, diisi jika kolaborasi
  deadline: string; // YYYY-MM-DD
  designStages: DesignStagesReport; // Laporan perminggu tahapan perancangan design (ideation, concepting, modeling)
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
}

export interface ClientGroup {
  id: string;
  name: string;
  background: string; // menceritakan bagaimana projek itu terbentuk
  concept: string; // mengisi nama konsep dari projek
  deliverables: Deliverable[];
}

export interface AuthUser {
  email: string;
  name: string;
  avatar: string;
  role: string;
  isAuthenticated: boolean;
}

export type ActiveView = 'database' | 'calendar' | 'files' | 'concepts';

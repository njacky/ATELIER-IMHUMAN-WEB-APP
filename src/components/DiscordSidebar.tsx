import React, { useState } from 'react';
import {
  Table2,
  CalendarDays,
  FolderLock,
  Plus,
  Moon,
  Sun,
  LogOut,
  Hash,
  ChevronDown,
  Layers,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  FolderOpen,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { ActiveView, AuthUser, ClientGroup } from '../types';

interface DiscordSidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  clients: ClientGroup[];
  selectedClientId: string | null;
  setSelectedClientId: (clientId: string | null) => void;
  onOpenAddModal: (preselectedClientId?: string) => void;
  user: AuthUser;
  onLogout: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  deadlinesThisWeekCount: number;
  totalFilesCount: number;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  isSyncing?: boolean;
  lastSyncedAt?: string | null;
  onManualSync?: () => void;
}

export const DiscordSidebar: React.FC<DiscordSidebarProps> = ({
  activeView,
  setActiveView,
  clients,
  selectedClientId,
  setSelectedClientId,
  onOpenAddModal,
  user,
  onLogout,
  isDark,
  toggleTheme,
  deadlinesThisWeekCount,
  totalFilesCount,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  isSyncing,
  lastSyncedAt,
  onManualSync,
}) => {
  const [clientsCollapsed, setClientsCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Total projects across all clients
  const totalProjects = clients.reduce((acc, c) => acc + c.deliverables.length, 0);

  return (
    <aside id="discord-sidebar-root" className="flex h-screen shrink-0 select-none z-30 font-sans">
      {/* 1. DISCORD EXTREME LEFT SERVER RAIL */}
      <div
        id="discord-server-rail"
        className={`w-[72px] flex flex-col items-center py-4 justify-between border-r ${
          isDark ? 'bg-[#000000] border-[#1A1A1A]' : 'bg-neutral-900 border-neutral-800'
        }`}
      >
        {/* Top: Atelier Inhuman Brand Crest & Nav Icons */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative group flex items-center justify-center">
            {/* Active Discord Indicator Pill */}
            <div className="absolute -left-2 w-1 h-8 bg-[#E63946] rounded-r-full transition-all" />
            
            <button
              id="btn-brand-server-icon"
              title="Atelier INHM - Studio Home"
              onClick={() => {
                setActiveView('database');
                setSelectedClientId(null);
              }}
              className="w-12 h-12 bg-[#E63946] hover:bg-[#A01A26] text-black font-extrabold text-xl rounded-2xl flex items-center justify-center font-['Syne',sans-serif] hover:rounded-xl transition-all cursor-pointer shadow-md group-hover:rounded-xl relative active:scale-95"
            >
              <span className="tracking-tight text-black">IN</span>
            </button>
          </div>

          <div className="w-8 h-[1px] bg-[#1A1A1A] my-0.5" />

          {/* Discord Rail Icon: Projects Database */}
          <div className="relative group flex items-center justify-center">
            {activeView === 'database' && (
              <div className="absolute -left-2 w-1 h-8 bg-white rounded-r-full" />
            )}
            <button
              id="rail-nav-database"
              title="Projects Database"
              onClick={() => setActiveView('database')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                activeView === 'database'
                  ? 'bg-[#1A1A1A] text-white rounded-xl border border-[#333333]'
                  : 'bg-[#141414] text-[#888888] hover:bg-[#1A1A1A] hover:text-white hover:rounded-xl border border-transparent'
              }`}
            >
              <Table2 className="w-5 h-5" />
            </button>
          </div>

          {/* Discord Rail Icon: Weekly Calendar */}
          <div className="relative group flex items-center justify-center">
            {activeView === 'calendar' && (
              <div className="absolute -left-2 w-1 h-8 bg-[#E63946] rounded-r-full" />
            )}
            <button
              id="rail-nav-calendar"
              title="Weekly Deadlines Calendar"
              onClick={() => setActiveView('calendar')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center relative transition-all duration-200 ${
                activeView === 'calendar'
                  ? 'bg-[#1A1A1A] text-[#E63946] rounded-xl border border-[#E63946]/50'
                  : 'bg-[#141414] text-[#888888] hover:bg-[#1A1A1A] hover:text-white hover:rounded-xl border border-transparent'
              }`}
            >
              <CalendarDays className="w-5 h-5" />
              {deadlinesThisWeekCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-medium bg-[#E63946] text-white rounded-full leading-none shadow-sm">
                  {deadlinesThisWeekCount}
                </span>
              )}
            </button>
          </div>

          {/* Discord Rail Icon: Files Vault */}
          <div className="relative group flex items-center justify-center">
            {activeView === 'files' && (
              <div className="absolute -left-2 w-1 h-8 bg-white rounded-r-full" />
            )}
            <button
              id="rail-nav-files"
              title="File Vault (All Uploads)"
              onClick={() => setActiveView('files')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center relative transition-all duration-200 ${
                activeView === 'files'
                  ? 'bg-[#1A1A1A] text-white rounded-xl border border-[#333333]'
                  : 'bg-[#141414] text-[#888888] hover:bg-[#1A1A1A] hover:text-white hover:rounded-xl border border-transparent'
              }`}
            >
              <FolderLock className="w-5 h-5" />
              {totalFilesCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-medium bg-[#333333] text-[#E0E0E0] rounded-full leading-none">
                  {totalFilesCount}
                </span>
              )}
            </button>
          </div>

          <div className="w-8 h-[1px] bg-[#1A1A1A] my-0.5" />

          {/* Discord Rail: Add Project Button (Distinct Red Plus) */}
          <div className="relative group flex items-center justify-center">
            <button
              id="rail-btn-add-project"
              title="Add New Project / Deliverable"
              onClick={() => onOpenAddModal()}
              className="w-12 h-12 rounded-2xl bg-[#E63946] hover:bg-[#A01A26] text-white flex items-center justify-center hover:rounded-xl transition-all duration-200 active:scale-95 group shadow-sm"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            </button>
          </div>
        </div>

        {/* Bottom Rail: Dark/Light Mode + Mini Avatar */}
        <div className="flex flex-col items-center gap-3">
          <button
            id="rail-btn-toggle-theme"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-[#141414] hover:bg-[#1A1A1A] text-[#888888] hover:text-white flex items-center justify-center transition-colors border border-[#1A1A1A]"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-300" />}
          </button>

          <div className="relative">
            <button
              id="rail-user-avatar-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#E63946] to-[#A01A26] p-0.5 relative transition-all cursor-pointer"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#000000]" />
            </button>

            {/* Quick user popup */}
            {showUserMenu && (
              <div className="absolute left-14 bottom-0 w-56 bg-[#111111] border border-[#1A1A1A] rounded-xl shadow-2xl p-3 z-50 text-left">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#1A1A1A]">
                  <img src={user.avatar} className="w-8 h-8 rounded-full object-cover" />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-[#888888] truncate">{user.email}</p>
                  </div>
                </div>
                <div className="text-[10px] text-[#888888] mb-3 px-1">
                  Role: <span className="text-[#E63946] font-semibold">{user.role}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#E63946] hover:bg-[#1A1A1A] rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. DISCORD SECONDARY CHANNEL / WORKSPACE SIDEBAR */}
      <div
        id="discord-channels-sidebar"
        className={`w-64 flex flex-col justify-between border-r transition-colors duration-200 ${
          isDark
            ? 'bg-[#0F0F0F] border-[#1A1A1A] text-[#E0E0E0]'
            : 'bg-white border-neutral-200 text-neutral-800'
        }`}
      >
        {/* Top Header: Atelier INHM Workspace */}
        <div className={`flex flex-col border-b ${isDark ? 'border-[#1A1A1A]' : 'border-neutral-200'}`}>
          <div className={`p-4 flex items-center justify-between transition-colors cursor-pointer ${
            isDark ? 'hover:bg-[#151515]' : 'hover:bg-neutral-50'
          }`}>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-medium text-sm tracking-wider uppercase ${
                  isDark ? 'text-white' : 'text-neutral-900'
                }`}>
                  Atelier <span className="text-[#E63946]">INHM</span>
                </span>
                <span className="px-1.5 py-0.2 text-[8px] font-medium bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 rounded uppercase tracking-wider">
                  Pro
                </span>
              </div>
              <p className={`text-[10px] tracking-wide mt-0.5 ${isDark ? 'text-[#555555]' : 'text-neutral-400'}`}>
                Project File Manager
              </p>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 ${isDark ? 'text-[#555555]' : 'text-neutral-400'}`} />
          </div>

          {/* Fast Search Input */}
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 pointer-events-none ${
                isDark ? 'text-[#555555]' : 'text-neutral-400'
              }`} />
              <input
                id="sidebar-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, files..."
                className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded border transition-all focus:outline-none focus:border-[#E63946] ${
                  isDark
                    ? 'bg-[#0A0A0A] border-[#1A1A1A] text-white placeholder-[#555555]'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-800 placeholder-neutral-400 focus:bg-white'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Middle Navigation Channels & Client Groups */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs">
          {/* Main Channels / Views */}
          <div className="space-y-0.5">
            <div className={`px-2 py-1 text-[10px] font-medium uppercase tracking-widest ${
              isDark ? 'text-[#555555]' : 'text-neutral-400'
            }`}>
              Workspace Views
            </div>

            <button
              id="channel-all-projects"
              onClick={() => {
                setActiveView('database');
                setSelectedClientId(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${
                activeView === 'database' && selectedClientId === null
                  ? isDark
                    ? 'bg-[#1A1A1A] text-white font-medium'
                    : 'bg-neutral-100 text-neutral-900 font-medium border border-neutral-200'
                  : isDark
                  ? 'hover:bg-[#141414] hover:text-white text-[#888888] font-normal'
                  : 'hover:bg-neutral-50 hover:text-neutral-900 text-neutral-600 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className={`w-3.5 h-3.5 ${isDark ? 'text-[#555555]' : 'text-neutral-400'}`} />
                <span className="text-xs">all-projects-table</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                isDark ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#888888]' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
              }`}>
                {totalProjects}
              </span>
            </button>

            <button
              id="channel-weekly-deadlines"
              onClick={() => setActiveView('calendar')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${
                activeView === 'calendar'
                  ? isDark
                    ? 'bg-[#1A1A1A] text-[#E63946] font-medium'
                    : 'bg-red-50 text-red-600 font-medium border border-red-100'
                  : isDark
                  ? 'hover:bg-[#141414] hover:text-white text-[#888888] font-normal'
                  : 'hover:bg-neutral-50 hover:text-neutral-900 text-neutral-600 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#E63946]" />
                <span className="text-xs">weekly-deadlines</span>
              </div>
              {deadlinesThisWeekCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 bg-[#E63946] text-white font-medium rounded uppercase tracking-wider">
                  {deadlinesThisWeekCount} due
                </span>
              )}
            </button>

            <button
              id="channel-files-vault"
              onClick={() => setActiveView('files')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded transition-colors ${
                activeView === 'files'
                  ? isDark
                    ? 'bg-[#1A1A1A] text-white font-medium'
                    : 'bg-neutral-100 text-neutral-900 font-medium border border-neutral-200'
                  : isDark
                  ? 'hover:bg-[#141414] hover:text-white text-[#888888] font-normal'
                  : 'hover:bg-neutral-50 hover:text-neutral-900 text-neutral-600 font-normal'
              }`}
            >
              <div className="flex items-center gap-2">
                <FolderOpen className={`w-3.5 h-3.5 ${isDark ? 'text-[#555555]' : 'text-neutral-400'}`} />
                <span className="text-xs">files-repository</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                isDark ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#888888]' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
              }`}>
                {totalFilesCount}
              </span>
            </button>
          </div>

          {/* Status Quick Filter */}
          <div className={`space-y-1.5 pt-2 border-t ${isDark ? 'border-[#1A1A1A]' : 'border-neutral-200'}`}>
            <div className={`px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest ${
              isDark ? 'text-[#555555]' : 'text-neutral-400'
            }`}>
              Filter Status
            </div>
            <div className="grid grid-cols-3 gap-1 px-1">
              <button
                onClick={() => setStatusFilter(statusFilter === 'not started' ? '' : 'not started')}
                className={`py-1 px-1 text-[10px] rounded border font-normal transition-colors text-center truncate ${
                  statusFilter === 'not started'
                    ? isDark
                      ? 'bg-[#1A1A1A] border-[#333333] text-white font-medium'
                      : 'bg-neutral-800 border-neutral-800 text-white font-medium'
                    : isDark
                    ? 'bg-[#0A0A0A] border-[#1A1A1A] text-[#888888] hover:text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Not Started
              </button>
              <button
                onClick={() => setStatusFilter(statusFilter === 'in review' ? '' : 'in review')}
                className={`py-1 px-1 text-[10px] rounded border font-normal transition-colors text-center truncate ${
                  statusFilter === 'in review'
                    ? 'bg-[#E63946]/10 border-[#E63946]/60 text-[#E63946] font-medium'
                    : isDark
                    ? 'bg-[#0A0A0A] border-[#1A1A1A] text-[#888888] hover:text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                In Review
              </button>
              <button
                onClick={() => setStatusFilter(statusFilter === 'completed' ? '' : 'completed')}
                className={`py-1 px-1 text-[10px] rounded border font-normal transition-colors text-center truncate ${
                  statusFilter === 'completed'
                    ? isDark
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400 font-medium'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-700 font-medium'
                    : isDark
                    ? 'bg-[#0A0A0A] border-[#1A1A1A] text-[#888888] hover:text-white'
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Client Deliverables Grouping (Discord Categories) */}
          <div className={`space-y-1 pt-2 border-t ${isDark ? 'border-[#1A1A1A]' : 'border-neutral-200'}`}>
            <div className="flex items-center justify-between px-2 py-1">
              <button
                onClick={() => setClientsCollapsed(!clientsCollapsed)}
                className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest transition-colors ${
                  isDark ? 'text-[#555555] hover:text-white' : 'text-neutral-400 hover:text-neutral-800'
                }`}
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${clientsCollapsed ? '-rotate-90' : ''}`} />
                <span>CLIENTS ({clients.length})</span>
              </button>

              <button
                id="btn-add-client-fast"
                title="Add Deliverable to a Client"
                onClick={() => onOpenAddModal()}
                className={`transition-colors p-0.5 rounded ${
                  isDark ? 'text-[#555555] hover:text-[#E63946]' : 'text-neutral-400 hover:text-neutral-800'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {!clientsCollapsed && (
              <div className="space-y-0.5">
                {clients.map((c) => {
                  const isSelected = selectedClientId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedClientId(isSelected ? null : c.id);
                        setActiveView('database');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-left transition-colors group ${
                        isSelected
                          ? isDark
                            ? 'bg-[#1A1A1A] text-white border-l-2 border-[#E63946] pl-2 font-medium'
                            : 'bg-neutral-100 text-neutral-900 font-medium border-l-2 border-[#E63946] pl-2'
                          : isDark
                          ? 'hover:bg-[#141414] text-[#888888] hover:text-white font-normal'
                          : 'hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 font-normal'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className={`font-mono text-xs ${
                          isDark ? 'text-[#555555] group-hover:text-[#E63946]' : 'text-neutral-400 group-hover:text-[#E63946]'
                        }`}>#</span>
                        <span className="truncate text-xs">{c.name}</span>
                      </div>
                      <span className={`text-[10px] px-1 rounded shrink-0 border ${
                        isDark ? 'bg-[#1A1A1A] text-[#888888] border-[#1A1A1A]' : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}>
                        {c.deliverables.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Discord Bottom Action & User Info Bar */}
        <div className={`p-3 border-t space-y-2.5 transition-colors ${
          isDark ? 'bg-[#141414] border-[#1A1A1A]' : 'bg-neutral-50 border-neutral-200'
        }`}>
          <button
            id="sidebar-btn-quick-new-project"
            onClick={() => onOpenAddModal()}
            className="w-full py-2 bg-[#E63946] hover:bg-[#A01A26] text-white font-medium text-xs rounded uppercase tracking-wider transition-all active:scale-95 shadow-sm"
          >
            + New Project
          </button>

          <div
            id="discord-user-bar"
            className="flex items-center justify-between pt-1"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-7 h-7 rounded-full object-cover ring-1 ${isDark ? 'ring-[#1A1A1A]' : 'ring-neutral-200'}`}
                />
                <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-[#0F0F0F]" />
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-medium truncate leading-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>{user.name}</p>
                <p className={`text-[9px] truncate ${isDark ? 'text-[#666666]' : 'text-neutral-500'}`}>{user.email}</p>
              </div>
            </div>

            <button
              id="btn-discord-logout"
              title="Sign out of Atelier INHM"
              onClick={onLogout}
              className={`p-1.5 rounded transition-colors ${
                isDark ? 'text-[#666666] hover:text-[#E63946] hover:bg-[#1A1A1A]' : 'text-neutral-400 hover:text-[#E63946] hover:bg-neutral-200/60'
              }`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time Cloud Sync Status Pill */}
          <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[#1A1A1A]/70">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Cloud Sync Aktif</span>
            </div>
            {onManualSync && (
              <button
                type="button"
                id="btn-sidebar-manual-sync"
                onClick={onManualSync}
                title="Sinkronkan dengan server Cloud sekarang"
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                  isDark ? 'text-[#888888] hover:text-white hover:bg-[#1E1E1E]' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60'
                }`}
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-[#E63946]' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : lastSyncedAt ? `Sync (${lastSyncedAt})` : 'Sync'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

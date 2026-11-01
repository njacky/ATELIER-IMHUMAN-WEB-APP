/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ActiveView,
  AuthUser,
  ClientGroup,
  Deliverable,
  ProjectFile,
  ProjectType,
  ProjectStatus,
} from './types';
import { loadClientGroups, saveClientGroups, getDefaultDesignStages } from './lib/storage';
import { saveUserProjectsToCloud, loadUserProjectsFromCloud, subscribeToUserProjectsCloud } from './lib/firebase';
import { GoogleAuthScreen } from './components/GoogleAuthScreen';
import { DiscordSidebar } from './components/DiscordSidebar';
import { NotionTableView } from './components/NotionTableView';
import { WeeklyCalendarView } from './components/WeeklyCalendarView';
import { FilesVaultView } from './components/FilesVaultView';
import { FileManagerDrawer } from './components/FileManagerDrawer';
import { AddProjectModal } from './components/AddProjectModal';
import {
  Table2,
  CalendarDays,
  FolderLock,
  Plus,
  ShieldCheck,
  Building,
  Layers,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  LogOut,
  Sun,
  Moon,
  Cloud,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getWeekDays } from './lib/dateUtils';

export default function App() {
  // Theme state: dark by default (monochrome with red accent)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('atelier_inhm_theme');
    return saved !== 'light';
  });

  // Auth state
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('atelier_inhm_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    // Seed default authenticated Google user for instant access
    const defaultUser: AuthUser = {
      email: 'ozalehadi@gmail.com',
      name: 'Oza Lehadi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'Principal Architect / Studio Lead',
      isAuthenticated: true,
    };
    localStorage.setItem('atelier_inhm_auth_user', JSON.stringify(defaultUser));
    return defaultUser;
  });

  // Data state
  const [clients, setClients] = useState<ClientGroup[]>(() => loadClientGroups());
  const [activeView, setActiveView] = useState<ActiveView>('database');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Cross-device Cloud Synchronization state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>('Baru saja');
  const [syncToast, setSyncToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [hasCloudInitialized, setHasCloudInitialized] = useState(false);

  // Modals and Drawers
  const [drawerData, setDrawerData] = useState<{ deliverable: Deliverable; client: ClientGroup } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalPreselectedClientId, setModalPreselectedClientId] = useState<string | undefined>(undefined);
  const [modalPreselectedDate, setModalPreselectedDate] = useState<string | undefined>(undefined);

  const showSyncToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSyncToast({ message, type });
    setTimeout(() => setSyncToast(null), 4200);
  };

  // 1. Initial Cloud Sync & Real-time cross-device listener on login
  useEffect(() => {
    if (!user?.email) return;

    let isMounted = true;
    setIsSyncing(true);

    // Initial fetch from Firestore Cloud for this Google Account
    loadUserProjectsFromCloud(user.email)
      .then((cloudClients) => {
        if (!isMounted) return;
        if (cloudClients && cloudClients.length > 0) {
          setClients(cloudClients);
          saveClientGroups(cloudClients);
          showSyncToast(`Data proyek tersinkronasi dari Cloud (${user.email})`, 'success');
        } else {
          // Cloud empty for this account, initial save
          saveUserProjectsToCloud(user.email, clients);
        }
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setHasCloudInitialized(true);
      })
      .catch((err) => {
        console.warn('Notice loading projects from cloud:', err);
        setHasCloudInitialized(true);
      })
      .finally(() => {
        if (isMounted) setIsSyncing(false);
      });

    // Subscribe to real-time changes made on other devices with this Google Account
    const unsubscribe = subscribeToUserProjectsCloud(user.email, (remoteClients, remoteDeviceId, updatedAt) => {
      if (!isMounted) return;
      setClients(remoteClients);
      saveClientGroups(remoteClients);
      const timeStr = new Date(updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(timeStr);
      showSyncToast(`Proyek disinkronkan real-time dari perangkat lain (${timeStr})`, 'info');
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user?.email]);

  // 2. Debounced auto-sync to Cloud whenever clients state changes
  useEffect(() => {
    saveClientGroups(clients);

    if (!hasCloudInitialized || !user?.email) return;

    const timer = setTimeout(async () => {
      try {
        setIsSyncing(true);
        await saveUserProjectsToCloud(user.email, clients);
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        console.warn('Debounced cloud sync notice:', err);
      } finally {
        setIsSyncing(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [clients, user?.email, hasCloudInitialized]);

  // Manual trigger for Cloud Sync
  const handleManualSync = async () => {
    if (!user?.email) return;
    setIsSyncing(true);
    try {
      const cloudClients = await loadUserProjectsFromCloud(user.email);
      if (cloudClients && cloudClients.length > 0) {
        setClients(cloudClients);
        saveClientGroups(cloudClients);
        showSyncToast(`Data proyek berhasil ditarik dari Cloud (${user.email})`, 'success');
      } else {
        await saveUserProjectsToCloud(user.email, clients);
        showSyncToast(`Semua proyek berhasil disimpan ke Cloud (${user.email})`, 'success');
      }
      setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      showSyncToast('Sinkronisasi cloud gagal, pastikan koneksi aktif.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync theme
  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem('atelier_inhm_theme', nextTheme ? 'dark' : 'light');
  };

  const handleLogin = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem('atelier_inhm_auth_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('atelier_inhm_auth_user');
  };

  // Update client background or concept
  const handleUpdateClient = (clientId: string, updated: Partial<ClientGroup>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, ...updated } : c))
    );
  };

  // Update deliverable (with support for client reassignment)
  const handleUpdateDeliverable = (
    clientId: string,
    deliverableId: string,
    updated: Partial<Deliverable>
  ) => {
    setClients((prev) => {
      // Reassign to another client if clientId changed
      if (updated.clientId && updated.clientId !== clientId) {
        let movedDel: Deliverable | null = null;
        const stripped = prev.map((c) => {
          if (c.id === clientId) {
            const found = c.deliverables.find((d) => d.id === deliverableId);
            if (found) {
              movedDel = { ...found, ...updated, updatedAt: new Date().toISOString() };
            }
            return {
              ...c,
              deliverables: c.deliverables.filter((d) => d.id !== deliverableId),
            };
          }
          return c;
        });

        if (movedDel) {
          return stripped.map((c) => {
            if (c.id === updated.clientId) {
              return {
                ...c,
                deliverables: [...c.deliverables, movedDel!],
              };
            }
            return c;
          });
        }
      }

      // Standard in-place deliverable update
      return prev.map((c) => {
        if (c.id !== clientId) return c;
        const updatedDeliverables = c.deliverables.map((del) =>
          del.id === deliverableId
            ? { ...del, ...updated, updatedAt: new Date().toISOString() }
            : del
        );
        return { ...c, deliverables: updatedDeliverables };
      });
    });

    // Keep drawer updated in real-time if open
    if (drawerData && drawerData.deliverable.id === deliverableId) {
      setDrawerData((prev) =>
        prev
          ? {
              ...prev,
              deliverable: { ...prev.deliverable, ...updated },
            }
          : null
      );
    }
  };

  // Delete deliverable
  const handleDeleteDeliverable = (clientId: string, deliverableId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          deliverables: c.deliverables.filter((d) => d.id !== deliverableId),
        };
      })
    );
    if (drawerData?.deliverable.id === deliverableId) {
      setDrawerData(null);
    }
  };

  // Delete client
  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    if (selectedClientId === clientId) setSelectedClientId(null);
  };

  // Add new deliverable or new client
  const handleSaveNewDeliverable = (data: {
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
  }) => {
    const today = new Date().toISOString().split('T')[0];
    const newDeliverableId = `del-${Date.now()}`;

    if (data.clientMode === 'new') {
      const newClientId = `client-${Date.now()}`;
      const newDel: Deliverable = {
        id: newDeliverableId,
        projectNumber: data.projectNumber,
        name: data.projectName,
        clientId: newClientId,
        clientName: data.newClientName,
        projectType: data.projectType,
        detailType: data.detailType,
        location: data.location,
        status: data.status,
        size: data.size,
        year: data.year,
        madeBy: data.madeBy,
        deadline: data.deadline,
        files: data.files,
        designStages: getDefaultDesignStages(),
        createdAt: today,
        updatedAt: today,
      };

      const newGroup: ClientGroup = {
        id: newClientId,
        name: data.newClientName,
        background: data.newClientBackground,
        concept: data.newClientConcept,
        deliverables: [newDel],
      };

      setClients((prev) => [newGroup, ...prev]);
    } else {
      const targetClient = clients.find((c) => c.id === data.clientId);
      if (!targetClient) return;

      const newDel: Deliverable = {
        id: newDeliverableId,
        projectNumber: data.projectNumber,
        name: data.projectName,
        clientId: targetClient.id,
        clientName: targetClient.name,
        projectType: data.projectType,
        detailType: data.detailType,
        location: data.location,
        status: data.status,
        size: data.size,
        year: data.year,
        madeBy: data.madeBy,
        deadline: data.deadline,
        files: data.files,
        designStages: getDefaultDesignStages(),
        createdAt: today,
        updatedAt: today,
      };

      setClients((prev) =>
        prev.map((c) =>
          c.id === data.clientId
            ? { ...c, deliverables: [...c.deliverables, newDel] }
            : c
        )
      );
    }

    setIsAddModalOpen(false);
  };

  // Open add modal helper
  const handleOpenAddModal = (preselectedClientId?: string, preselectedDate?: string) => {
    setModalPreselectedClientId(preselectedClientId);
    setModalPreselectedDate(preselectedDate);
    setIsAddModalOpen(true);
  };

  // Metrics for Discord rail badges
  const weekDays = getWeekDays(new Date('2026-09-07T12:00:00'));
  const currentWeekDateStrings = weekDays.map((d) => d.dateString);
  const allDeliverables = clients.flatMap((c) => c.deliverables);
  const deadlinesThisWeekCount = allDeliverables.filter((d) =>
    currentWeekDateStrings.includes(d.deadline)
  ).length;
  const totalFilesCount = allDeliverables.reduce((acc, d) => acc + d.files.length, 0);

  // If user is not logged in, show Google Auth screen
  if (!user || !user.isAuthenticated) {
    return <GoogleAuthScreen onLogin={handleLogin} isDark={isDark} />;
  }

  return (
    <div
      id="app-root-container"
      className={`min-h-screen flex overflow-hidden font-sans transition-colors duration-200 ${
        isDark ? 'bg-[#0A0A0A] text-[#E0E0E0]' : 'bg-neutral-100 text-neutral-900'
      }`}
    >
      {/* 1. DISCORD STYLE COMBINED SIDEBAR (Server Rail + Channel Panel) */}
      <DiscordSidebar
        activeView={activeView}
        setActiveView={setActiveView}
        clients={clients}
        selectedClientId={selectedClientId}
        setSelectedClientId={setSelectedClientId}
        onOpenAddModal={handleOpenAddModal}
        user={user}
        onLogout={handleLogout}
        isDark={isDark}
        toggleTheme={toggleTheme}
        deadlinesThisWeekCount={deadlinesThisWeekCount}
        totalFilesCount={totalFilesCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onManualSync={handleManualSync}
      />

      {/* 2. MAIN APPLICATION WORKSPACE AREA */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden min-w-0 transition-colors duration-200 ${
        isDark ? 'bg-[#0A0A0A] text-[#E0E0E0]' : 'bg-[#F9FAFB] text-neutral-900'
      }`}>
        {/* TOP NOTION-CLEAN BREADCRUMB & TOOLBAR */}
        <header
          id="main-top-navbar"
          className={`h-14 px-6 border-b flex items-center justify-between shrink-0 transition-colors duration-200 ${
            isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-white border-neutral-200 shadow-sm'
          }`}
        >
          {/* Breadcrumb path */}
          <div className="flex items-center gap-2.5 text-xs">
            <span className={`font-medium uppercase tracking-wider ${isDark ? 'text-white' : 'text-neutral-900'}`}>
              Atelier INHM
            </span>
            <span className={isDark ? 'text-[#444444]' : 'text-neutral-400'}>/</span>
            <span className={`font-normal tracking-wide ${isDark ? 'text-[#E0E0E0]' : 'text-neutral-700'}`}>
              {activeView === 'database'
                ? 'Projects & Deliverables Table'
                : activeView === 'calendar'
                ? 'Weekly Deadlines Calendar'
                : 'Central Files Vault'}
            </span>
            {selectedClientId && (
              <>
                <span className={isDark ? 'text-[#444444]' : 'text-neutral-400'}>/</span>
                <span className={`px-2 py-0.5 rounded font-medium text-[11px] border ${
                  isDark ? 'bg-[#1A1A1A] text-[#E63946] border-[#E63946]/30' : 'bg-red-50 text-red-600 border-red-200'
                }`}>
                  {clients.find((c) => c.id === selectedClientId)?.name}
                </span>
                <button
                  onClick={() => setSelectedClientId(null)}
                  className={`text-[10px] ${isDark ? 'text-[#666666] hover:text-white' : 'text-neutral-400 hover:text-neutral-800'}`}
                >
                  ✕ Clear
                </button>
              </>
            )}
          </div>

          {/* Right Toolbar Actions */}
          <div className="flex items-center gap-2.5">
            {/* View Switcher Pills */}
            <div className={`hidden sm:flex items-center p-1 rounded-lg border ${
              isDark ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-neutral-100 border-neutral-200'
            }`}>
              <button
                id="top-nav-table"
                onClick={() => setActiveView('database')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeView === 'database'
                    ? isDark
                      ? 'bg-[#1A1A1A] text-white shadow-sm border border-[#333333]'
                      : 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                    : isDark
                    ? 'text-[#888888] hover:text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Table2 className="w-3.5 h-3.5" />
                <span>Database</span>
              </button>

              <button
                id="top-nav-calendar"
                onClick={() => setActiveView('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeView === 'calendar'
                    ? isDark
                      ? 'bg-[#1A1A1A] text-[#E63946] shadow-sm border border-[#E63946]/40'
                      : 'bg-white text-red-600 shadow-sm border border-red-200'
                    : isDark
                    ? 'text-[#888888] hover:text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Weekly</span>
                {deadlinesThisWeekCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]" />
                )}
              </button>

              <button
                id="top-nav-files"
                onClick={() => setActiveView('files')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeView === 'files'
                    ? isDark
                      ? 'bg-[#1A1A1A] text-white shadow-sm border border-[#333333]'
                      : 'bg-white text-neutral-900 shadow-sm border border-neutral-200'
                    : isDark
                    ? 'text-[#888888] hover:text-white'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <FolderLock className="w-3.5 h-3.5" />
                <span>Files Vault</span>
              </button>
            </div>

            {/* Quick Light / Dark Mode Toggle Button */}
            <button
              id="top-btn-theme-toggle"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
                isDark
                  ? 'bg-[#141414] hover:bg-[#1A1A1A] text-[#E0E0E0] border-[#1A1A1A]'
                  : 'bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-200 shadow-sm'
              }`}
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="hidden md:inline text-[11px]">Dark Mode</span>
                </>
              )}
            </button>

            {/* Real-time Cloud Sync Pill with manual trigger */}
            <div
              id="top-cloud-sync-status"
              className={`hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] ${
                isDark ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-neutral-50 border-neutral-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div className="text-left">
                  <p className="text-[9px] font-medium text-emerald-400 uppercase tracking-wider leading-none">
                    Cloud Synced
                  </p>
                  <p className={`text-[10px] leading-tight ${isDark ? 'text-[#888888]' : 'text-neutral-500'}`}>
                    {lastSyncedAt ? `Pukul ${lastSyncedAt}` : 'Semua perangkat'}
                  </p>
                </div>
              </div>
              <button
                id="top-btn-manual-sync"
                onClick={handleManualSync}
                title="Sinkronkan dengan Cloud sekarang (Semua Perangkat)"
                disabled={isSyncing}
                className={`p-1 rounded hover:bg-neutral-800/40 transition-colors cursor-pointer ${
                  isSyncing ? 'text-[#E63946]' : isDark ? 'text-[#888888] hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Google Account Pill */}
            <div className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] ${
              isDark ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <div className="text-right">
                <p className={`text-[9px] font-medium uppercase tracking-wider leading-none ${
                  isDark ? 'text-[#666666]' : 'text-neutral-400'
                }`}>Google ID</p>
                <p className={`text-xs leading-tight font-normal truncate max-w-[120px] ${
                  isDark ? 'text-white' : 'text-neutral-800'
                }`}>{user.email}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-medium shrink-0">
                G
              </div>
            </div>

            {/* Red Add Project Button */}
            <button
              id="top-btn-new-project"
              onClick={() => handleOpenAddModal(selectedClientId || undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#E63946] hover:bg-[#A01A26] text-white font-medium text-xs uppercase tracking-wider transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Project</span>
            </button>
          </div>
        </header>

        {/* Floating Toast Notification for Cross-Device Synchronization */}
        {syncToast && (
          <div
            id="cloud-sync-toast"
            className={`fixed top-16 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-2xl border text-xs font-medium backdrop-blur-md transition-all animate-bounce ${
              syncToast.type === 'error'
                ? 'bg-red-950/90 text-red-200 border-red-800'
                : syncToast.type === 'info'
                ? 'bg-neutral-900/95 text-sky-400 border-sky-800/60 shadow-sky-950/20'
                : 'bg-neutral-900/95 text-emerald-400 border-emerald-800/60 shadow-emerald-950/20'
            }`}
          >
            {syncToast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            ) : syncToast.type === 'info' ? (
              <Cloud className="w-4 h-4 text-sky-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{syncToast.message}</span>
          </div>
        )}

        {/* SCROLLABLE VIEW CANVAS */}
        <div className={`flex-1 overflow-y-auto px-6 py-6 transition-colors duration-200 ${
          isDark ? 'bg-[#0A0A0A]' : 'bg-[#F9FAFB]'
        }`}>
          <div className="max-w-7xl mx-auto">
            {activeView === 'database' && (
              <NotionTableView
                clients={clients}
                onUpdateClient={handleUpdateClient}
                onUpdateDeliverable={handleUpdateDeliverable}
                onDeleteDeliverable={handleDeleteDeliverable}
                onDeleteClient={handleDeleteClient}
                onAddDeliverable={(clientId) => handleOpenAddModal(clientId)}
                onOpenFileDrawer={(deliverable, client) =>
                  setDrawerData({ deliverable, client })
                }
                isDark={isDark}
                selectedClientId={selectedClientId}
                searchQuery={searchQuery}
                statusFilter={statusFilter}
              />
            )}

            {activeView === 'calendar' && (
              <WeeklyCalendarView
                clients={clients}
                onOpenFileDrawer={(deliverable, client) =>
                  setDrawerData({ deliverable, client })
                }
                onOpenAddModal={handleOpenAddModal}
                isDark={isDark}
              />
            )}

            {activeView === 'files' && (
              <FilesVaultView
                clients={clients}
                onOpenFileDrawer={(deliverable, client) =>
                  setDrawerData({ deliverable, client })
                }
                onUpdateDeliverable={handleUpdateDeliverable}
                isDark={isDark}
              />
            )}
          </div>
        </div>

        {/* FOOTER STRIP */}
        <footer className={`mt-auto h-9 border-t px-6 flex items-center justify-between text-[10px] shrink-0 transition-colors duration-200 ${
          isDark
            ? 'border-[#1A1A1A] text-[#555555] bg-[#0A0A0A]'
            : 'border-neutral-200 text-neutral-500 bg-white'
        }`}>
          <div className="flex gap-4">
            <span>Files: {totalFilesCount} (PDF, PPTX, MP4, DWG)</span>
            <span className="hidden sm:inline text-neutral-400">•</span>
            <span className="hidden sm:inline">Storage: {(totalFilesCount * 18.5 + 42).toFixed(1)} MB / 10 GB</span>
          </div>
          <div className="tracking-widest uppercase font-medium">
            ATELIER INHUMAN © 2026
          </div>
        </footer>
      </main>

      {/* 3. FILE MANAGER DRAWER (SLIDE OVER) */}
      {drawerData && (
        <FileManagerDrawer
          deliverable={drawerData.deliverable}
          client={drawerData.client}
          onClose={() => setDrawerData(null)}
          onUpdateDeliverable={handleUpdateDeliverable}
          isDark={isDark}
        />
      )}

      {/* 4. DISCORD STYLE ADD PROJECT MODAL */}
      {isAddModalOpen && (
        <AddProjectModal
          clients={clients}
          preselectedClientId={modalPreselectedClientId}
          preselectedDate={modalPreselectedDate}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveNewDeliverable}
          isDark={isDark}
        />
      )}
    </div>
  );
}

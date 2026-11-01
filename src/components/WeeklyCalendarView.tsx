import React, { useState } from 'react';
import { ClientGroup, Deliverable } from '../types';
import {
  formatDateToYMD,
  getWeekDays,
  WeekDay,
} from '../lib/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Paperclip,
  Plus,
  MapPin,
  Building2,
  Sparkles
} from 'lucide-react';

interface WeeklyCalendarViewProps {
  clients: ClientGroup[];
  onOpenFileDrawer: (deliverable: Deliverable, client: ClientGroup) => void;
  onOpenAddModal: (preselectedClientId?: string, preselectedDate?: string) => void;
  isDark: boolean;
}

export const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  clients,
  onOpenFileDrawer,
  onOpenAddModal,
  isDark,
}) => {
  // Reference date starts at 2026-09-07
  const [referenceDate, setReferenceDate] = useState<Date>(new Date('2026-09-07T12:00:00'));

  const weekDays = getWeekDays(referenceDate);

  // Navigate weeks
  const handlePrevWeek = () => {
    const prev = new Date(referenceDate);
    prev.setDate(prev.getDate() - 7);
    setReferenceDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(referenceDate);
    next.setDate(next.getDate() + 7);
    setReferenceDate(next);
  };

  const handleResetToToday = () => {
    setReferenceDate(new Date('2026-09-07T12:00:00'));
  };

  // Flatten deliverables with their parent client
  const allDeliverablesWithClient = clients.flatMap((client) =>
    client.deliverables.map((del) => ({
      ...del,
      parentClient: client,
    }))
  );

  // Group deliverables by deadline date string
  const deliverablesByDate: Record<string, typeof allDeliverablesWithClient> = {};
  allDeliverablesWithClient.forEach((item) => {
    if (item.deadline) {
      if (!deliverablesByDate[item.deadline]) {
        deliverablesByDate[item.deadline] = [];
      }
      deliverablesByDate[item.deadline].push(item);
    }
  });

  // Calculate metrics for current week
  const currentWeekDateStrings = weekDays.map((d) => d.dateString);
  const thisWeekDeliverables = allDeliverablesWithClient.filter((d) =>
    currentWeekDateStrings.includes(d.deadline)
  );

  const pendingCount = thisWeekDeliverables.filter((d) => d.status === 'not started').length;
  const inReviewCount = thisWeekDeliverables.filter((d) => d.status === 'in review').length;
  const completedCount = thisWeekDeliverables.filter((d) => d.status === 'completed').length;

  return (
    <div id="weekly-calendar-view" className="space-y-6 pb-20">
      {/* CALENDAR HEADER & METRICS */}
      <div
        className={`p-4 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isDark ? 'bg-[#111111] border-[#1A1A1A]' : 'bg-white border-neutral-200 shadow-sm'
        }`}
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse" />
            <h2 className={`text-base font-medium tracking-wider uppercase ${
              isDark ? 'text-white' : 'text-neutral-900'
            }`}>
              Weekly Deadlines Tracker
            </h2>
          </div>
          <p className={`text-[11px] ${isDark ? 'text-[#888888]' : 'text-neutral-500'}`}>
            Jadwal pengiriman fase dan deliverable yang jatuh tempo pada minggu berjalan (Senin s/d Minggu).
          </p>
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          <div className={`flex items-center gap-1 border rounded p-1 ${
            isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-neutral-100 border-neutral-200'
          }`}>
            <button
              id="btn-prev-week"
              onClick={handlePrevWeek}
              title="Minggu Sebelumnya"
              className={`p-1.5 rounded transition-colors ${
                isDark ? 'text-[#888888] hover:text-white hover:bg-[#1A1A1A]' : 'text-neutral-500 hover:text-neutral-900 hover:bg-white'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-today-week"
              onClick={handleResetToToday}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                isDark
                  ? 'text-[#E0E0E0] hover:text-white hover:bg-[#1A1A1A]'
                  : 'text-neutral-700 hover:text-neutral-900 hover:bg-white shadow-xs'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#E63946]" />
              <span>Hari Ini (7 Sep)</span>
            </button>
            <button
              id="btn-next-week"
              onClick={handleNextWeek}
              title="Minggu Berikutnya"
              className={`p-1.5 rounded transition-colors ${
                isDark ? 'text-[#888888] hover:text-white hover:bg-[#1A1A1A]' : 'text-neutral-500 hover:text-neutral-900 hover:bg-white'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            id="btn-calendar-add-deadline"
            onClick={() => onOpenAddModal(undefined, weekDays[0].dateString)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded bg-[#E63946] hover:bg-[#A01A26] text-white shadow transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deliverable</span>
          </button>
        </div>
      </div>

      {/* WEEKLY STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
          isDark ? 'border-[#1A1A1A] bg-[#111111]' : 'border-neutral-200 bg-white shadow-sm'
        }`}>
          <div>
            <p className={`text-[9px] uppercase font-medium tracking-wider ${isDark ? 'text-[#666666]' : 'text-neutral-400'}`}>Total Deadlines</p>
            <p className={`text-xl font-mono font-medium mt-0.5 ${isDark ? 'text-white' : 'text-neutral-900'}`}>{thisWeekDeliverables.length}</p>
          </div>
          <div className={`w-8 h-8 rounded border flex items-center justify-center ${
            isDark ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#888888]' : 'bg-neutral-50 border-neutral-200 text-neutral-600'
          }`}>
            <Clock className="w-4 h-4 text-[#E63946]" />
          </div>
        </div>

        <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
          isDark ? 'border-[#1A1A1A] bg-[#111111]' : 'border-neutral-200 bg-white shadow-sm'
        }`}>
          <div>
            <p className={`text-[9px] uppercase font-medium tracking-wider ${isDark ? 'text-[#666666]' : 'text-neutral-400'}`}>In Review</p>
            <p className="text-xl font-mono font-medium text-[#E63946] mt-0.5">{inReviewCount}</p>
          </div>
          <div className={`w-8 h-8 rounded border flex items-center justify-center ${
            isDark ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#E63946]' : 'bg-red-50 border-red-100 text-[#E63946]'
          }`}>
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
          isDark ? 'border-[#1A1A1A] bg-[#111111]' : 'border-neutral-200 bg-white shadow-sm'
        }`}>
          <div>
            <p className={`text-[9px] uppercase font-medium tracking-wider ${isDark ? 'text-[#666666]' : 'text-neutral-400'}`}>Not Started</p>
            <p className={`text-xl font-mono font-medium mt-0.5 ${isDark ? 'text-[#888888]' : 'text-neutral-500'}`}>{pendingCount}</p>
          </div>
          <div className={`w-8 h-8 rounded border flex items-center justify-center ${
            isDark ? 'bg-[#1A1A1A] border-[#1A1A1A] text-[#888888]' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
          }`}>
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
          isDark ? 'border-[#1A1A1A] bg-[#111111]' : 'border-neutral-200 bg-white shadow-sm'
        }`}>
          <div>
            <p className={`text-[9px] uppercase font-medium tracking-wider ${isDark ? 'text-[#666666]' : 'text-neutral-400'}`}>Completed</p>
            <p className="text-xl font-mono font-medium text-emerald-500 mt-0.5">{completedCount}</p>
          </div>
          <div className={`w-8 h-8 rounded border flex items-center justify-center ${
            isDark ? 'bg-[#1A1A1A] border-[#1A1A1A] text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
          }`}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 7-DAY WEEKLY CALENDAR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayDeliverables = deliverablesByDate[day.dateString] || [];
          const isToday = day.isToday;

          return (
            <div
              key={day.dateString}
              id={`calendar-day-${day.dateString}`}
              className={`rounded-lg border flex flex-col min-h-[320px] transition-all overflow-hidden ${
                isToday
                  ? isDark
                    ? 'bg-[#141414] border-[#E63946] shadow-sm shadow-[#E63946]/10'
                    : 'bg-white border-red-500 ring-2 ring-red-100 shadow-md'
                  : isDark
                  ? 'bg-[#111111] border-[#1A1A1A] hover:border-[#333333]'
                  : 'bg-neutral-50/70 border-neutral-200 hover:border-neutral-300'
              }`}
            >
              {/* Day Header */}
              <div
                className={`p-3 border-b flex items-center justify-between ${
                  isToday
                    ? 'bg-[#E63946]/10 border-[#E63946]/30'
                    : isDark
                    ? 'border-[#1A1A1A] bg-[#0F0F0F]'
                    : 'border-neutral-200 bg-neutral-100/60'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wider ${
                        isToday ? 'text-[#E63946]' : 'text-[#888888]'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    {isToday && (
                      <span className="px-1.5 py-0.2 bg-[#E63946] text-white font-medium text-[8px] rounded uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-mono font-medium mt-0.5 ${
                    isDark ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {day.dayNumber} {day.monthNameShort}
                  </div>
                </div>

                <span className={`text-[9px] font-mono font-normal px-1.5 py-0.5 rounded border ${
                  isDark ? 'bg-[#1A1A1A] text-[#888888] border-[#1A1A1A]' : 'bg-white text-neutral-600 border-neutral-200 shadow-2xs'
                }`}>
                  {dayDeliverables.length}
                </span>
              </div>

              {/* Day Deliverables List */}
              <div className="p-2.5 flex-1 flex flex-col gap-2 overflow-y-auto">
                {dayDeliverables.length === 0 ? (
                  <div className={`flex-1 flex flex-col items-center justify-center text-center p-3 ${
                    isDark ? 'text-[#555555]' : 'text-neutral-400'
                  }`}>
                    <span className="text-[11px] italic">No deadlines</span>
                    <button
                      onClick={() => onOpenAddModal(undefined, day.dateString)}
                      className="mt-2 text-[10px] text-[#888888] hover:text-[#E63946] flex items-center gap-1 transition-colors font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Set deadline</span>
                    </button>
                  </div>
                ) : (
                  dayDeliverables.map((item) => {
                    const statusTag =
                      item.status === 'completed'
                        ? 'text-emerald-500'
                        : item.status === 'in review'
                        ? 'text-[#E63946]'
                        : isDark ? 'text-[#888888]' : 'text-neutral-600';

                    return (
                      <div
                        key={item.id}
                        id={`calendar-card-${item.id}`}
                        onClick={() => onOpenFileDrawer(item, item.parentClient)}
                        className={`p-2.5 rounded border text-left cursor-pointer transition-all hover:border-[#E63946] group ${
                          isDark
                            ? 'border-[#1A1A1A] bg-[#161616]'
                            : 'border-neutral-200 bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-[10px] font-medium text-[#E63946]">
                            {item.projectNumber}
                          </span>
                          <span
                            className={`text-[8px] uppercase tracking-wider font-medium px-1.5 py-0.2 rounded border ${
                              isDark ? 'border-[#1A1A1A] bg-[#111111]' : 'border-neutral-200 bg-neutral-50'
                            } ${statusTag}`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <h4 className={`text-xs font-medium transition-colors line-clamp-2 leading-snug group-hover:text-[#E63946] ${
                          isDark ? 'text-white' : 'text-neutral-900'
                        }`}>
                          {item.name}
                        </h4>

                        <div className={`text-[10px] mt-1 flex items-center gap-1 truncate ${
                          isDark ? 'text-[#888888]' : 'text-neutral-500'
                        }`}>
                          <Building2 className={`w-2.5 h-2.5 shrink-0 ${isDark ? 'text-[#666666]' : 'text-neutral-400'}`} />
                          <span className="truncate">{item.parentClient.name}</span>
                        </div>

                        <div className={`mt-2 pt-1.5 border-t flex items-center justify-between text-[10px] ${
                          isDark ? 'border-[#1A1A1A] text-[#888888]' : 'border-neutral-100 text-neutral-500'
                        }`}>
                          <span className="capitalize">{item.projectType}</span>
                          <span className={`flex items-center gap-1 font-normal ${
                            isDark ? 'text-[#E0E0E0]' : 'text-neutral-700'
                          }`}>
                            <Paperclip className="w-3 h-3 text-[#E63946]" />
                            {item.files.length}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

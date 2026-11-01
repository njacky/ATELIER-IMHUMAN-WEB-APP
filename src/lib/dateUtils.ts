export interface WeekDay {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayName: string; // Senin / Monday
  dayNameShort: string; // Sen / Mon
  dayNumber: number; // 7
  monthNameShort: string; // Sep
  isToday: boolean;
}

// Format Date object to YYYY-MM-DD in local time
export function formatDateToYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get the Monday of the week for any given date
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Generate the 7 days (Monday to Sunday) for the given base date
export function getWeekDays(referenceDate: Date = new Date('2026-09-07T12:00:00')): WeekDay[] {
  const monday = getMondayOfWeek(referenceDate);
  const todayYMD = formatDateToYMD(new Date());

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const dayNamesShort = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateString = formatDateToYMD(current);

    days.push({
      date: current,
      dateString,
      dayName: dayNames[i],
      dayNameShort: dayNamesShort[i],
      dayNumber: current.getDate(),
      monthNameShort: monthNamesShort[current.getMonth()],
      isToday: dateString === todayYMD || dateString === '2026-09-07', // align with current simulated date
    });
  }

  return days;
}

// Format date nicely: "8 Sep 2026"
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${day} ${months[monthIndex] || ''} ${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// Check deadline urgency
export function getDeadlineUrgency(dateStr: string): 'today' | 'upcoming' | 'overdue' | 'future' {
  if (!dateStr) return 'future';
  const today = '2026-09-07'; // Match current environment local date
  if (dateStr === today) return 'today';
  if (dateStr < today) return 'overdue';
  const targetDate = new Date(dateStr).getTime();
  const todayDate = new Date(today).getTime();
  const diffDays = Math.ceil((targetDate - todayDate) / (1000 * 60 * 60 * 24));
  if (diffDays <= 7) return 'upcoming';
  return 'future';
}

import { getAccessToken } from './authService';
import { Habit, HabitLog, LifeScoreBreakdown } from '../types';

// Helper for Base64URL encoding (RFC 4648) for Gmail
const encodeBase64Url = (str: string): string => {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  utf8Bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// ==========================================
// 1. GMAIL SERVICE
// ==========================================

export interface GmailSendResult {
  id: string;
  threadId: string;
  sentAt: string;
}

export const sendHabitSummaryEmail = async (
  recipientEmail: string,
  userName: string,
  habits: Habit[],
  todayLogs: HabitLog[],
  lifeScore: LifeScoreBreakdown
): Promise<GmailSendResult> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to send emails via Gmail.');
  }

  const completedCount = todayLogs.filter((l) => l.completed).length;
  const habitMap = new Map(habits.map((h) => [h.id, h.name]));

  const subject = `AuraHabit Daily Report - Life Score: ${lifeScore.overallScore}/100 (${completedCount}/${habits.length} Habits Done)`;

  const habitRowsHtml = habits
    .map((h) => {
      const log = todayLogs.find((l) => l.habitId === h.id);
      const isDone = log?.completed;
      return `<tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px; font-weight: 600; color: #1e293b;">${h.name}</td>
        <td style="padding: 10px; color: #64748b;">${h.category}</td>
        <td style="padding: 10px; font-weight: bold; color: ${isDone ? '#10b981' : '#f59e0b'};">
          ${isDone ? '✔ Completed' : '⏳ Pending'}
        </td>
      </tr>`;
    })
    .join('');

  const bodyHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">AuraHabit Daily Consistency Report</h2>
      <p style="color: #475569; font-size: 14px;">Hello ${userName || 'there'}, here is your daily habit progress summary.</p>
      
      <div style="background: linear-gradient(135deg, #10b981, #06b6d4); color: white; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: center;">
        <div style="font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Overall Life Score</div>
        <div style="font-size: 36px; font-weight: 800; font-family: monospace;">${lifeScore.overallScore} / 100</div>
        <div style="font-size: 13px; opacity: 0.9;">${completedCount} of ${habits.length} habits completed today</div>
      </div>

      <h3 style="color: #1e293b; margin-top: 24px;">Today's Habit Checklist</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 2px solid #cbd5e1;">
            <th style="padding: 10px; color: #475569;">Habit</th>
            <th style="padding: 10px; color: #475569;">Category</th>
            <th style="padding: 10px; color: #475569;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${habitRowsHtml}
        </tbody>
      </table>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">Sent securely via AuraHabit Daily Habit Tracker & Gmail API.</p>
    </div>
  `;

  const rawMessage = [
    `To: ${recipientEmail}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    '',
    bodyHtml,
  ].join('\r\n');

  const encodedMessage = encodeBase64Url(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to send email via Gmail.');
  }

  const data = await res.json();
  return {
    id: data.id,
    threadId: data.threadId,
    sentAt: new Date().toISOString(),
  };
};

// ==========================================
// 2. GOOGLE CALENDAR SERVICE
// ==========================================

export interface CalendarEventPayload {
  summary: string;
  description: string;
  startTime: string; // ISO string e.g. 2026-10-08T08:00:00Z
  endTime: string;   // ISO string e.g. 2026-10-08T08:30:00Z
  colorId?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink?: string;
}

export const syncHabitToGoogleCalendar = async (
  habit: Habit,
  dateStr: string
): Promise<GoogleCalendarEvent> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to schedule events in Google Calendar.');
  }

  const time = habit.reminderTime || '08:00';
  const startDateTime = `${dateStr}T${time}:00`;
  const [hour, min] = time.split(':').map(Number);
  const endHour = String(min >= 30 ? (hour + 1) % 24 : hour).padStart(2, '0');
  const endMin = String((min + 30) % 60).padStart(2, '0');
  const endDateTime = `${dateStr}T${endHour}:${endMin}:00`;

  const payload = {
    summary: `[AuraHabit] ${habit.name}`,
    description: `Habit reminder for ${habit.name}.\nTarget: ${habit.targetValue} ${habit.unit}\nCategory: ${habit.category}\nNotes: ${habit.notes || 'None'}`,
    start: {
      dateTime: new Date(startDateTime).toISOString(),
    },
    end: {
      dateTime: new Date(endDateTime).toISOString(),
    },
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 10 }],
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to add event to Google Calendar.');
  }

  return await res.json();
};

export const fetchUpcomingCalendarEvents = async (): Promise<GoogleCalendarEvent[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  const timeMin = new Date().toISOString();
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=10&singleEvents=true&orderBy=startTime`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
};

// ==========================================
// 3. GOOGLE TASKS SERVICE
// ==========================================

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
}

export const syncHabitToGoogleTasks = async (
  habit: Habit,
  dateStr: string
): Promise<GoogleTaskItem> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Please sign in with Google to sync with Google Tasks.');
  }

  const payload = {
    title: `${habit.name} (${habit.targetValue} ${habit.unit})`,
    notes: `Category: ${habit.category}\nPriority: ${habit.priority}\nNotes: ${habit.notes || ''}`,
    due: `${dateStr}T23:59:59Z`,
  };

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to create task in Google Tasks.');
  }

  return await res.json();
};

export const fetchGoogleTasks = async (): Promise<GoogleTaskItem[]> => {
  const token = await getAccessToken();
  if (!token) return [];

  const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=false&maxResults=20', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
};

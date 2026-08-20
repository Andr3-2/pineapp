import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  useAppStore,
  type SessionDuration,
  type SessionRecord,
  type ThemePreference,
  type WeeklyGoal,
} from '@/store/useAppStore';

const BACKUP_VERSION = 1;
const BACKUP_FILENAME = 'pine-backup.pine';

const WEEKLY_GOALS: WeeklyGoal[] = [1, 2, 3, 4, 5, 6, 7];
const THEMES: ThemePreference[] = ['light', 'dark', 'device'];
const DURATIONS: SessionDuration[] = [5, 10, 30];

const DEFAULT_NAME = '';
const DEFAULT_WEEKLY_GOAL: WeeklyGoal = 5;
const DEFAULT_THEME: ThemePreference = 'device';
const DEFAULT_DURATION: SessionDuration = 10;

interface BackupData {
  name: string;
  weeklyGoal: WeeklyGoal;
  theme: ThemePreference;
  selectedDuration: SessionDuration;
  completedByMonth: Record<string, number[]>;
  sessions: SessionRecord[];
}

const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

/** Salvages whatever valid month/day entries it can find, dropping only the individual bad ones. */
function sanitizeCompletedByMonth(value: unknown): Record<string, number[]> {
  if (typeof value !== 'object' || value === null) return {};

  const result: Record<string, number[]> = {};
  for (const [key, days] of Object.entries(value as Record<string, unknown>)) {
    if (!MONTH_KEY_PATTERN.test(key) || !Array.isArray(days)) continue;
    const validDays = days.filter(
      (d): d is number => typeof d === 'number' && Number.isInteger(d) && d >= 1 && d <= 31,
    );
    if (validDays.length > 0) result[key] = validDays;
  }
  return result;
}

/** Salvages whatever valid session records it can find, dropping only the individual bad ones. */
function sanitizeSessions(value: unknown): SessionRecord[] {
  if (!Array.isArray(value)) return [];

  const result: SessionRecord[] = [];
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { completedAt, minutes } = entry as Record<string, unknown>;
    if (
      typeof completedAt === 'number' &&
      Number.isFinite(completedAt) &&
      completedAt > 0 &&
      typeof minutes === 'number' &&
      Number.isFinite(minutes) &&
      minutes > 0
    ) {
      result.push({ completedAt, minutes });
    }
  }
  return result;
}

/**
 * Parses a backup as leniently as possible: an individual field that's missing or malformed
 * falls back to a sensible default instead of failing the whole import, so a backup edited or
 * partially corrupted by hand still loads whatever it can. Only a file that isn't JSON, or
 * doesn't look like a Pine backup at all, is rejected outright.
 */
function parseBackup(raw: string): BackupData {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null || !('data' in parsed)) {
    throw new Error('That file is not a Pine backup.');
  }
  const data = (parsed as { data: unknown }).data;
  if (typeof data !== 'object' || data === null) {
    throw new Error('That file is not a Pine backup.');
  }

  const d = data as Record<string, unknown>;

  return {
    name: typeof d.name === 'string' ? d.name : DEFAULT_NAME,
    weeklyGoal: WEEKLY_GOALS.includes(d.weeklyGoal as WeeklyGoal)
      ? (d.weeklyGoal as WeeklyGoal)
      : DEFAULT_WEEKLY_GOAL,
    theme: THEMES.includes(d.theme as ThemePreference) ? (d.theme as ThemePreference) : DEFAULT_THEME,
    selectedDuration: DURATIONS.includes(d.selectedDuration as SessionDuration)
      ? (d.selectedDuration as SessionDuration)
      : DEFAULT_DURATION,
    completedByMonth: sanitizeCompletedByMonth(d.completedByMonth),
    sessions: sanitizeSessions(d.sessions),
  };
}

function buildBackupPayload() {
  const state = useAppStore.getState();
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      name: state.name,
      weeklyGoal: state.weeklyGoal,
      theme: state.theme,
      selectedDuration: state.selectedDuration,
      completedByMonth: state.completedByMonth,
      sessions: state.sessions,
    } satisfies BackupData,
  };
}

/** Writes the user's data to a .pine backup file (JSON content under a custom extension,
 * so other apps don't offer to open it) and opens the system share sheet so they can save it anywhere. */
export async function exportBackup(): Promise<void> {
  const file = new File(Paths.cache, BACKUP_FILENAME);
  if (file.exists) file.delete();
  file.write(JSON.stringify(buildBackupPayload(), null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/octet-stream',
    dialogTitle: 'Export Pine data',
  });
}

/** Lets the user pick a folder on their device and writes the backup straight into it,
 * as a direct alternative to whatever targets happen to show up in the share sheet. */
export async function saveBackupToDevice(): Promise<'saved' | 'cancelled'> {
  let directory: Directory;
  try {
    directory = await Directory.pickDirectoryAsync();
  } catch (err) {
    if (err instanceof Error && /cancel/i.test(err.message)) return 'cancelled';
    throw err;
  }

  const file = directory.createFile(BACKUP_FILENAME, 'application/octet-stream');
  file.write(JSON.stringify(buildBackupPayload(), null, 2));
  return 'saved';
}

/** Lets the user pick a previously exported .pine file and overwrites the current store with its contents. */
export async function importBackup(): Promise<'imported' | 'cancelled'> {
  const result = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return 'cancelled';

  const file = new File(result.assets[0].uri);
  const raw = await file.text();
  const data = parseBackup(raw);

  useAppStore.getState().restoreData(data);
  return 'imported';
}

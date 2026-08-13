import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useAppStore, type SessionDuration, type ThemePreference, type WeeklyGoal } from '@/store/useAppStore';

const BACKUP_VERSION = 1;
const BACKUP_FILENAME = 'pine-backup.json';

const WEEKLY_GOALS: WeeklyGoal[] = [1, 2, 3, 4, 5, 6, 7];
const THEMES: ThemePreference[] = ['light', 'dark', 'device'];
const DURATIONS: SessionDuration[] = [1, 5, 10, 30];

interface BackupData {
  name: string;
  weeklyGoal: WeeklyGoal;
  theme: ThemePreference;
  selectedDuration: SessionDuration;
  completedByMonth: Record<string, number[]>;
}

function isCompletedByMonth(value: unknown): value is Record<string, number[]> {
  if (typeof value !== 'object' || value === null) return false;
  return Object.values(value).every(
    (days) => Array.isArray(days) && days.every((d) => typeof d === 'number'),
  );
}

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
  if (typeof d.name !== 'string') throw new Error('Backup is missing a valid name.');
  if (!WEEKLY_GOALS.includes(d.weeklyGoal as WeeklyGoal)) {
    throw new Error('Backup has an invalid weekly goal.');
  }
  if (!THEMES.includes(d.theme as ThemePreference)) {
    throw new Error('Backup has an invalid appearance setting.');
  }
  if (!DURATIONS.includes(d.selectedDuration as SessionDuration)) {
    throw new Error('Backup has an invalid session duration.');
  }
  if (!isCompletedByMonth(d.completedByMonth)) {
    throw new Error('Backup has invalid session history.');
  }

  return {
    name: d.name,
    weeklyGoal: d.weeklyGoal as WeeklyGoal,
    theme: d.theme as ThemePreference,
    selectedDuration: d.selectedDuration as SessionDuration,
    completedByMonth: d.completedByMonth as Record<string, number[]>,
  };
}

/** Writes the user's data to a JSON file and opens the system share sheet so they can save it anywhere. */
export async function exportBackup(): Promise<void> {
  const state = useAppStore.getState();
  const payload = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      name: state.name,
      weeklyGoal: state.weeklyGoal,
      theme: state.theme,
      selectedDuration: state.selectedDuration,
      completedByMonth: state.completedByMonth,
    } satisfies BackupData,
  };

  const file = new File(Paths.cache, BACKUP_FILENAME);
  if (file.exists) file.delete();
  file.write(JSON.stringify(payload, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Sharing is not available on this device.');
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export Pine data' });
}

/** Lets the user pick a previously exported JSON file and overwrites the current store with its contents. */
export async function importBackup(): Promise<'imported' | 'cancelled'> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) return 'cancelled';

  const file = new File(result.assets[0].uri);
  const raw = await file.text();
  const data = parseBackup(raw);

  useAppStore.getState().restoreData(data);
  return 'imported';
}

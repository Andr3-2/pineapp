import { useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { GoalPicker } from '@/components/GoalPicker';
import { PillButton } from '@/components/PillButton';
import { ThemePicker } from '@/components/ThemePicker';
import { exportBackup, importBackup } from '@/lib/backup';
import { useAppStore } from '@/store/useAppStore';
import { fonts } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path
        d="M8 3 L4 7 L8 11"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function SettingsScreen() {
  const { colors, scheme } = useTheme();
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const name = useAppStore((s) => s.name);
  const setName = useAppStore((s) => s.setName);
  const weeklyGoal = useAppStore((s) => s.weeklyGoal);
  const setWeeklyGoal = useAppStore((s) => s.setWeeklyGoal);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const handleExport = async () => {
    setBusy('export');
    setStatus(null);
    try {
      await exportBackup();
      setStatus('Data exported.');
    } catch (err) {
      Alert.alert('Export failed', err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(null);
    }
  };

  const runImport = async () => {
    setBusy('import');
    setStatus(null);
    try {
      const result = await importBackup();
      setStatus(result === 'imported' ? 'Data imported.' : null);
    } catch (err) {
      Alert.alert('Import failed', err instanceof Error ? err.message : 'That file could not be read.');
    } finally {
      setBusy(null);
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Import data',
      'This replaces your name, weekly goal, appearance, and session history with the contents of the file. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', style: 'destructive', onPress: runImport },
      ],
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { borderColor: colors.line }]}>
            <BackIcon color={colors.ink} />
          </Pressable>
          <Text style={[styles.title, { color: colors.ink }]}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>YOUR NAME</Text>
            <View style={[styles.fieldWrap, { borderBottomColor: colors.lineStrong }]}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.muted}
                style={[styles.input, { color: colors.ink }]}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>WEEKLY GOAL</Text>
            <GoalPicker colors={colors} goal={weeklyGoal} onChangeGoal={setWeeklyGoal} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>APPEARANCE</Text>
            <ThemePicker colors={colors} theme={theme} onChangeTheme={setTheme} />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.muted }]}>YOUR DATA</Text>
            <View style={styles.dataButtons}>
              <PillButton
                label={busy === 'export' ? 'Exporting…' : 'Export data'}
                onPress={handleExport}
                disabled={busy !== null}
                height={54}
                backgroundColor="transparent"
                borderColor={colors.line}
                textColor={colors.ink}
              />
              <PillButton
                label={busy === 'import' ? 'Importing…' : 'Import data'}
                onPress={handleImport}
                disabled={busy !== null}
                height={54}
                backgroundColor="transparent"
                borderColor={colors.line}
                textColor={colors.ink}
              />
            </View>
            {status && <Text style={[styles.status, { color: colors.muted }]}>{status}</Text>}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 26,
    paddingTop: 12,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
  },
  content: {
    paddingHorizontal: 26,
    paddingTop: 22,
    paddingBottom: 40,
    gap: 30,
  },
  section: {
    gap: 14,
  },
  sectionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  fieldWrap: {
    borderBottomWidth: 1.5,
  },
  input: {
    fontFamily: fonts.sansRegular,
    fontSize: 22,
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  dataButtons: {
    gap: 12,
  },
  status: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },
});

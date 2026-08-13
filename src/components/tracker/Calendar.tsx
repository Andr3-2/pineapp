import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { daysInMonth, firstWeekdayOffset, monthLabel, weekdayHeaderLabels } from '@/lib/date';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

function ChevronIcon({ direction, color }: { direction: 'left' | 'right'; color: string }) {
  const d = direction === 'left' ? 'M8 3 L4 7 L8 11' : 'M6 3 L10 7 L6 11';
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path d={d} stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function TodayIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Rect x={1.5} y={2.5} width={11} height={10} rx={1.5} stroke={color} strokeWidth={1.3} fill="none" />
      <Path d="M1.5 5.5 H12.5" stroke={color} strokeWidth={1.3} />
      <Path d="M4 1 V3.2 M10 1 V3.2" stroke={color} strokeWidth={1.3} strokeLinecap="round" />
    </Svg>
  );
}

function CheckIcon({ color }: { color: string }) {
  return (
    <Svg width={12} height={9} viewBox="0 0 12 9">
      <Path d="M1 4.5 L4.2 8 L11 1" stroke={color} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronButton({
  direction,
  onPress,
  colors,
}: {
  direction: 'left' | 'right';
  onPress: () => void;
  colors: ColorTokens;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chevron, { borderColor: colors.line }]}>
      <ChevronIcon direction={direction} color={colors.ink} />
    </Pressable>
  );
}

function TodayButton({ onPress, colors }: { onPress: () => void; colors: ColorTokens }) {
  return (
    <Pressable onPress={onPress} style={[styles.chevron, { borderColor: colors.line }]}>
      <TodayIcon color={colors.ink} />
    </Pressable>
  );
}

function DayCell({
  day,
  completed,
  isToday,
  colors,
}: {
  day: number;
  completed: boolean;
  isToday: boolean;
  colors: ColorTokens;
}) {
  if (completed) {
    return (
      <View style={[styles.dayCell, { backgroundColor: colors.fill }]}>
        <Text style={[styles.dayNumberCompleted, { color: colors.onFill }]}>{day}</Text>
        <CheckIcon color={colors.onFill} />
      </View>
    );
  }
  if (isToday) {
    return (
      <View
        style={[
          styles.dayCell,
          styles.dayCellToday,
          { borderColor: colors.accent, backgroundColor: colors.tint },
        ]}
      >
        <Text style={[styles.dayNumberToday, { color: colors.ink }]}>{day}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.dayCell, { borderWidth: 1, borderColor: colors.line }]}>
      <Text style={[styles.dayNumber, { color: colors.ink }]}>{day}</Text>
    </View>
  );
}

export function Calendar({
  year,
  month,
  completedDays,
  today,
  onPrevMonth,
  onNextMonth,
  onToday,
  colors,
}: {
  year: number;
  month: number;
  completedDays: number[];
  today: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  colors: ColorTokens;
}) {
  const total = daysInMonth(year, month);
  const offset = firstWeekdayOffset(year, month);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const completed = new Set(completedDays);

  const cells: Array<number | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  const weeks: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ChevronButton direction="left" onPress={onPrevMonth} colors={colors} />
        <Text style={[styles.monthLabel, { color: colors.ink }]}>{monthLabel(year, month)}</Text>
        <ChevronButton direction="right" onPress={onNextMonth} colors={colors} />
        <TodayButton onPress={onToday} colors={colors} />
      </View>

      <View style={styles.weekdayRow}>
        {weekdayHeaderLabels.map((label, i) => (
          <Text key={i} style={[styles.weekdayLabel, { color: colors.muted }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((day, di) =>
              day == null ? (
                <View key={di} style={styles.dayCell} />
              ) : (
                <DayCell
                  key={di}
                  day={day}
                  completed={completed.has(day)}
                  isToday={isCurrentMonth && day === today.getDate()}
                  colors={colors}
                />
              ),
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  chevron: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    minWidth: 106,
    textAlign: 'center',
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: 6,
  },
  weekdayLabel: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    textAlign: 'center',
  },
  grid: {
    gap: 6,
  },
  weekRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dayCell: {
    flex: 1,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  dayNumber: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },
  dayNumberToday: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
  },
  dayNumberCompleted: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    opacity: 0.7,
  },
});

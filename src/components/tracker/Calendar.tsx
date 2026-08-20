import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { runOnJS } from 'react-native-worklets';
import Svg, { Path, Rect } from 'react-native-svg';
import { addMonths, daysInMonth, firstWeekdayOffset, monthKey, monthLabel, weekdayHeaderLabels } from '@/lib/date';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

const SWIPE_THRESHOLD = 40;
const SLIDE_DURATION = 220;

function buildWeeks(year: number, month: number): Array<Array<number | null>> {
  const total = daysInMonth(year, month);
  const offset = firstWeekdayOffset(year, month);
  const cells: Array<number | null> = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];
  const weeks: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
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

function MonthGrid({
  year,
  month,
  completedDays,
  today,
  colors,
  width,
}: {
  year: number;
  month: number;
  completedDays: number[];
  today: Date;
  colors: ColorTokens;
  width: number;
}) {
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const completed = new Set(completedDays);
  const weeks = buildWeeks(year, month);

  return (
    <View style={[styles.grid, { width }]}>
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
  );
}

export function Calendar({
  year,
  month,
  completedByMonth,
  today,
  onPrevMonth,
  onNextMonth,
  onToday,
  colors,
}: {
  year: number;
  month: number;
  completedByMonth: Record<string, number[]>;
  today: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  colors: ColorTokens;
}) {
  const [pageWidth, setPageWidth] = useState(0);
  const width = useSharedValue(0);
  const translateX = useSharedValue(0);

  // Recenter on the current page whenever the displayed month actually changes (via
  // swipe, the today button, or anything else) — a no-op mid-gesture snap since the
  // page now rendered there is the same content the user already dragged into view.
  useEffect(() => {
    translateX.value = -width.value;
  }, [year, month, translateX, width]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-20, 20])
    .onUpdate((e) => {
      translateX.value = -width.value + e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX <= -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-2 * width.value, { duration: SLIDE_DURATION }, (finished) => {
          if (finished) runOnJS(onNextMonth)();
        });
      } else if (e.translationX >= SWIPE_THRESHOLD) {
        translateX.value = withTiming(0, { duration: SLIDE_DURATION }, (finished) => {
          if (finished) runOnJS(onPrevMonth)();
        });
      } else {
        translateX.value = withTiming(-width.value, { duration: SLIDE_DURATION });
      }
    });

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TodayButton onPress={onToday} colors={colors} />
        <Text style={[styles.monthLabel, { color: colors.ink }]}>{monthLabel(year, month)}</Text>
      </View>

      <View style={styles.weekdayRow}>
        {weekdayHeaderLabels.map((label, i) => (
          <Text key={i} style={[styles.weekdayLabel, { color: colors.muted }]}>
            {label}
          </Text>
        ))}
      </View>

      <View
        style={styles.sliderClip}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setPageWidth(w);
          width.value = w;
          translateX.value = -w;
        }}
      >
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.track, slideStyle]}>
            <MonthGrid
              year={prev.year}
              month={prev.month}
              completedDays={completedByMonth[monthKey(prev.year, prev.month)] ?? []}
              today={today}
              colors={colors}
              width={pageWidth}
            />
            <MonthGrid
              year={year}
              month={month}
              completedDays={completedByMonth[monthKey(year, month)] ?? []}
              today={today}
              colors={colors}
              width={pageWidth}
            />
            <MonthGrid
              year={next.year}
              month={next.month}
              completedDays={completedByMonth[monthKey(next.year, next.month)] ?? []}
              today={today}
              colors={colors}
              width={pageWidth}
            />
          </Animated.View>
        </GestureDetector>
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
    justifyContent: 'flex-start',
    gap: 12,
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
  },
  sliderClip: {
    overflow: 'hidden',
  },
  track: {
    flexDirection: 'row',
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

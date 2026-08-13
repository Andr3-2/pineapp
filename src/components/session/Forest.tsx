import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import { forest } from '@/theme/tokens';
import { PineTree, type PineTreeSpec } from './PineTree';

const SWAY_VARIANTS: Array<[number, number]> = [
  [-0.9, 1.1], // A
  [1.0, -0.8], // B
  [-0.5, 0.6], // C
  [0.35, -0.45], // D
];
const DURATIONS_MS = [7000, 9000, 11000, 13000, 15000, 17000];
const LEFT_SLOTS = [2, 18, 36, 54, 70, 86];

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

function buildRow(count: number, config: {
  widthRange: [number, number];
  heightRange: [number, number];
  bottomRange: [number, number];
  opacity: number;
  trunkColor: string;
  trunkRadius: number;
  canopyColors: readonly [string, string, string];
  variantOffset: number;
}): PineTreeSpec[] {
  return Array.from({ length: count }, (_, i) => {
    const t = count > 1 ? i / (count - 1) : 0;
    const [swayFrom, swayTo] = SWAY_VARIANTS[(i + config.variantOffset) % SWAY_VARIANTS.length];
    return {
      width: lerp(config.widthRange[0], config.widthRange[1], t),
      height: lerp(config.heightRange[0], config.heightRange[1], (i % 2) / 1),
      bottomPercent: lerp(config.bottomRange[0], config.bottomRange[1], t % 1),
      leftPercent: LEFT_SLOTS[i] + (i % 2 === 0 ? -3 : 3),
      opacity: config.opacity,
      trunkColor: config.trunkColor,
      trunkRadius: config.trunkRadius,
      canopyColors: config.canopyColors,
      swayFrom,
      swayTo,
      durationMs: DURATIONS_MS[i % DURATIONS_MS.length],
      delayMs: (i * 900) % 4000,
    };
  });
}

const MID_TREES = buildRow(6, {
  widthRange: [74, 90],
  heightRange: [166, 202],
  bottomRange: [27, 28],
  opacity: 0.75,
  trunkColor: forest.mid.trunk,
  trunkRadius: 0,
  canopyColors: forest.mid.canopy,
  variantOffset: 0,
});

const NEAR_TREES = buildRow(6, {
  widthRange: [96, 138],
  heightRange: [221, 317],
  bottomRange: [22, 23],
  opacity: forest.near.opacity,
  trunkColor: forest.near.trunk,
  trunkRadius: 2,
  canopyColors: forest.near.canopy,
  variantOffset: 2,
});

export function Forest() {
  const reducedMotion = useReducedMotion();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={forest.skyGradient}
        locations={forest.skyGradientLocations}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.hill, { backgroundColor: forest.hill }]} />

      {MID_TREES.map((spec, i) => (
        <PineTree key={`mid-${i}`} spec={spec} reducedMotion={reducedMotion} />
      ))}
      {NEAR_TREES.map((spec, i) => (
        <PineTree key={`near-${i}`} spec={spec} reducedMotion={reducedMotion} />
      ))}

      <LinearGradient colors={forest.groundGradient} style={styles.ground}>
        <View style={[styles.groundSeam, { backgroundColor: forest.groundSeam }]} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  mist: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '50%',
    height: 110,
  },
  hill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: '24%',
    height: '34%',
  },
  ground: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '24%',
  },
  groundSeam: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.6,
  },
});

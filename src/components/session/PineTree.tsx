import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Polygon, Rect } from 'react-native-svg';

const TIER_WIDTH_RATIOS = [1, 0.78, 0.48]; // bottom -> top
const TIER_HEIGHT_RATIOS = [0.4, 0.32, 0.28]; // bottom -> top, of canopy height
const TRUNK_HEIGHT_RATIO = 0.15;
const TRUNK_WIDTH_RATIO = 0.22;

export interface PineTreeSpec {
  width: number;
  height: number;
  bottomPercent: number;
  leftPercent: number;
  opacity: number;
  trunkColor: string;
  trunkRadius: number;
  canopyColors: readonly [string, string, string];
  swayFrom: number;
  swayTo: number;
  durationMs: number;
  delayMs: number;
}

export function PineTree({
  spec,
  reducedMotion,
}: {
  spec: PineTreeSpec;
  reducedMotion: boolean;
}) {
  const {
    width,
    height,
    bottomPercent,
    leftPercent,
    opacity,
    trunkColor,
    trunkRadius,
    canopyColors,
    swayFrom,
    swayTo,
    durationMs,
    delayMs,
  } = spec;

  const angle = useSharedValue(swayFrom);

  useEffect(() => {
    if (reducedMotion) {
      angle.value = 0;
      return;
    }
    angle.value = swayFrom;
    angle.value = withDelay(
      delayMs,
      withRepeat(withTiming(swayTo, { duration: durationMs, easing: Easing.inOut(Easing.ease) }), -1, true),
    );
  }, [reducedMotion, swayFrom, swayTo, durationMs, delayMs, angle]);

  const swayStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${angle.value}deg` }],
  }));

  const trunkHeight = height * TRUNK_HEIGHT_RATIO;
  const trunkWidth = width * TRUNK_WIDTH_RATIO;
  const canopyHeight = height - trunkHeight;

  let cursorY = height - trunkHeight;
  const tiers = TIER_HEIGHT_RATIOS.map((hRatio, i) => {
    const tierHeight = canopyHeight * hRatio;
    const tierWidth = width * TIER_WIDTH_RATIOS[i];
    const topY = cursorY - tierHeight;
    const bottomY = cursorY;
    cursorY = topY + tierHeight * 0.35; // overlap tiers slightly for a fuller silhouette
    const cx = width / 2;
    return (
      <Polygon
        key={i}
        points={`${cx},${topY} ${cx + tierWidth / 2},${bottomY} ${cx - tierWidth / 2},${bottomY}`}
        fill={canopyColors[i]}
      />
    );
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${leftPercent}%`,
          bottom: `${bottomPercent}%`,
          width,
          height,
          opacity,
          transformOrigin: '50% 100%',
        },
        swayStyle,
      ]}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Rect
          x={(width - trunkWidth) / 2}
          y={height - trunkHeight}
          width={trunkWidth}
          height={trunkHeight}
          rx={trunkRadius}
          fill={trunkColor}
        />
        {tiers}
      </Svg>
    </Animated.View>
  );
}

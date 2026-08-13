import Svg, { Polygon } from 'react-native-svg';

/** The simple triangle pine mark used in onboarding (welcome + done steps). */
export function PineGlyph({
  width = 22,
  height = 30,
  color,
}: {
  width?: number;
  height?: number;
  color: string;
}) {
  return (
    <Svg width={width} height={height} viewBox="0 0 22 30">
      <Polygon points="11,0 22,30 0,30" fill={color} />
    </Svg>
  );
}

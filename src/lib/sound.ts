import { useAudioPlayer, setAudioModeAsync, type AudioSource } from 'expo-audio';
import { useEffect } from 'react';

export const AMBIENT_LOOP_SOURCE: AudioSource = require('../../assets/audio/forest.mp3');
// No completion chime asset ships yet. Drop one in assets/audio/ and pass it here to
// light this up — the player is wired end-to-end and no-ops safely while `source` is null.
export const COMPLETION_CHIME_SOURCE: AudioSource = null;

let audioModeConfigured = false;
async function ensurePlaybackAudioMode() {
  if (audioModeConfigured) return;
  audioModeConfigured = true;
  await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
}

const FADE_IN_SECONDS = 15;
const FADE_IN_TICK_MS = 100;
const FADE_OUT_SECONDS = 30;

/** Ambient loop that starts as soon as the session screen mounts, fading in over
 * `FADE_IN_SECONDS`, and fades out over the final `FADE_OUT_SECONDS` before a
 * running session's timer stops. */
export function useAmbientLoop(
  isRunning: boolean,
  remainingSeconds: number,
  source: AudioSource = AMBIENT_LOOP_SOURCE,
) {
  const player = useAudioPlayer(source);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  useEffect(() => {
    if (!source) return;
    ensurePlaybackAudioMode();
    player.volume = 0;
    player.play();

    const startedAt = Date.now();
    const interval = setInterval(() => {
      const ratio = Math.min(1, (Date.now() - startedAt) / 1000 / FADE_IN_SECONDS);
      player.volume = ratio;
      if (ratio >= 1) clearInterval(interval);
    }, FADE_IN_TICK_MS);

    return () => {
      clearInterval(interval);
    };
  }, [player, source]);

  useEffect(() => {
    if (!source || !isRunning || remainingSeconds >= FADE_OUT_SECONDS) return;
    player.volume = Math.max(0, remainingSeconds / FADE_OUT_SECONDS);
  }, [isRunning, player, remainingSeconds, source]);
}

/** Short chime played once when a session finishes. */
export function useCompletionChime(source: AudioSource = COMPLETION_CHIME_SOURCE) {
  const player = useAudioPlayer(source);

  return function playChime() {
    if (!source) return;
    ensurePlaybackAudioMode();
    player.seekTo(0);
    player.play();
  };
}

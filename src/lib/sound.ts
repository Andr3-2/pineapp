import { useAudioPlayer, setAudioModeAsync, type AudioSource } from 'expo-audio';
import { useEffect } from 'react';

// No audio assets ship with the design handoff (README: "Assets: None"). Drop files in
// assets/audio/ and pass them as `source` below to light these up — the players are
// wired end-to-end and no-op safely while `source` is null.
export const AMBIENT_LOOP_SOURCE: AudioSource = null;
export const COMPLETION_CHIME_SOURCE: AudioSource = null;

let audioModeConfigured = false;
async function ensurePlaybackAudioMode() {
  if (audioModeConfigured) return;
  audioModeConfigured = true;
  await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'duckOthers' });
}

/** Ambient loop that plays for the duration of a running session. */
export function useAmbientLoop(isRunning: boolean, source: AudioSource = AMBIENT_LOOP_SOURCE) {
  const player = useAudioPlayer(source);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  useEffect(() => {
    ensurePlaybackAudioMode();
    if (!source) return;
    if (isRunning) {
      player.play();
    } else {
      player.pause();
    }
  }, [isRunning, player, source]);
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

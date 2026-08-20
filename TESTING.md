# Pine — Alpha Testing

Pine is a minimalist meditation app: pick a duration, sit through a guided breathing
session, and watch your practice build up on a calendar. This is an early alpha —
everything below reflects what's actually implemented right now, not the eventual
full feature set.

## What's in this build

**Sessions**
- Pick a duration (currently 1, 5, 10, or 30 minutes) and start a distraction-free
  session: a swaying pine forest backdrop, a pulsing breathing glow, and an ambient
  sound loop.
- The ambient sound starts as soon as you open the session screen (fading in over 15s)
  and fades out over the final 30 seconds before the timer ends.
- The countdown is timestamp-based, so it stays correct across backgrounding, timer
  throttling, or the app being relaunched mid-session.
- A back button (top-left) lets you leave the screen at any point; an "End session"
  button ends a running session early.
- If a session is still running while the app is backgrounded, a local notification
  fires when the countdown ends, so completion isn't missed.
- The screen won't sleep for as long as you're on it, running or not.
- On Android, the app switches the system to Priority-only Do Not Disturb while the
  session screen is open and restores your previous setting when you leave. This needs
  Notification Policy Access, which the app asks for once (a "Do Not Disturb" prompt on
  first visit to the screen) — decline it and sessions just run without silencing
  anything. No iOS equivalent exists (no public API for it).

**Progress tracking**
- The home screen shows how many minutes calmer you are this month (e.g. "30min" /
  "1h30"), sessions completed this month, and your weekly goal, plus a calendar marking
  every day you've completed a session.

**Onboarding & appearance**
- A short first-run flow collects your name, weekly goal, and appearance preference.
- Theme can be set to light, dark, or match the device.

**Backup & restore** (Settings)
- **Export data** — shares your name, goal, theme, and session history as a `.pine`
  file via the system share sheet.
- **Save to device** — writes that same file directly to a folder you choose, as a
  more reliable alternative when a share-sheet target isn't available.
- **Import data** — restores from a previously exported `.pine` file, overwriting the
  current profile and history. Individual fields that are missing or invalid (e.g. a
  hand-edited or partially corrupted file) fall back to defaults instead of failing the
  whole import — only a file that isn't JSON, or doesn't look like a Pine backup at all,
  is rejected.

All data is local-only (AsyncStorage) — there's no backend, account, or sync.

## How alpha builds get published

Pushing a tag matching `v*` (e.g. `v0.1.0-alpha.1`) triggers
[`.github/workflows/release-apk.yml`](.github/workflows/release-apk.yml): it builds an
Android APK and attaches it to a new GitHub Release under that tag. Every push and PR
also runs [`.github/workflows/ci.yml`](.github/workflows/ci.yml), which currently just
typechecks the project.

```bash
git tag v0.1.0-alpha.1
git push origin v0.1.0-alpha.1
```

The APK filename mirrors the tag (`pine-<tag>.apk`); watch the **Actions** tab for
build progress and the **Releases** page for the download once it finishes.

## Installing the APK (Android only)

1. Download `pine-<tag>.apk` from the release's Assets on GitHub.
2. On the phone, open it from Downloads/Files — Android will prompt to allow
   installing from that source the first time. Allow it, then install.
3. There's no Play Store listing yet, so updates mean repeating this for each new tag.

## Known limitations

- **Android only.** No iOS build exists yet — the release workflow only targets
  Android, and there's no Mac runner in CI to build/sign an iOS binary.
- **Debug-signed, not Play Store–ready.** The release APK's signing config currently
  falls back to the debug keystore ([`android/app/build.gradle`](android/app/build.gradle)),
  which is fine for sideloading to testers but would need a real release keystore (or
  a move to EAS Build) before any store submission.
- **No completion chime yet.** The code path for a short "session finished" sound
  exists (`useCompletionChime` in [`src/lib/sound.ts`](src/lib/sound.ts)) but no audio
  asset is wired up, so sessions end silently apart from the on-screen toast and the
  backgrounded-session notification.
- **No automated tests or linting.** CI only runs a TypeScript check — there's no
  lint config or test suite yet.

## Feedback

Please file anything you hit — crashes, confusing flows, wrong copy, whatever — as a
GitHub Issue on this repo, tagged with the alpha version you were on.

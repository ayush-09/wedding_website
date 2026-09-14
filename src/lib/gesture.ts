export function signalUserGesture() {
  if (typeof window === "undefined") return;
  try {
    (window as any).__fa_user_gesture = true;
  } catch {}
  try {
    console.debug("[gesture] signalUserGesture: setting flag and dispatching fa-user-gesture");
  } catch {}
  try {
    window.dispatchEvent(new Event("fa-user-gesture"));
  } catch {}
}

export function requestIntroReplay() {
  if (typeof window === "undefined") return;
  try {
    console.debug("[gesture] requestIntroReplay: dispatching fa-replay-intro");
  } catch {}
  try {
    window.dispatchEvent(new Event("fa-replay-intro"));
  } catch {}
  try {
    // Also nudge any intro audio to try playback immediately.
    window.dispatchEvent(new Event("fa-try-play"));
  } catch {}
}

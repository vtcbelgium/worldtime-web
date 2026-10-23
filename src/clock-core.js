// Pure, dependency-free UTC clock calibration helpers.
export function clockSample(unixMs, requestStartMono, responseEndMono) {
  if (![unixMs, requestStartMono, responseEndMono].every(Number.isFinite)) return null;
  const rtt = responseEndMono - requestStartMono;
  if (rtt < 0 || rtt > 2500) return null;
  // Estimate the response arrival time using half the observed round trip.
  return { utcMs: unixMs + rtt / 2, monoMs: responseEndMono, rtt };
}

export function calibratedNow(sample, monoNow, deviceNow) {
  if (!sample || !Number.isFinite(sample.utcMs) || !Number.isFinite(sample.monoMs) || !Number.isFinite(monoNow)) return deviceNow;
  return sample.utcMs + (monoNow - sample.monoMs);
}

export function nextSecondDelay(utcMs) {
  if (!Number.isFinite(utcMs)) return 1000;
  const fraction = ((utcMs % 1000) + 1000) % 1000;
  return Math.max(20, Math.min(1000, Math.ceil(1012 - fraction)));
}

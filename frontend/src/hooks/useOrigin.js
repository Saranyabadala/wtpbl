import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_LOCATION } from '../lib/constants.js';

/**
 * Resolves the search origin: asks the browser for geolocation and silently
 * falls back to the fixed demo centre when permission is denied, unavailable,
 * or the user ignores the prompt. The UI shows which mode is active so the
 * fallback is never mistaken for a bug.
 */
export function useOrigin() {
  const [origin, setOrigin] = useState({
    ...DEFAULT_LOCATION,
    source: 'default',
    loading: true,
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setOrigin({ ...DEFAULT_LOCATION, source: 'default', loading: false });
      return;
    }

    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        setOrigin({ ...DEFAULT_LOCATION, source: 'default', loading: false });
      }
    }, 8000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Your location',
          source: 'browser',
          loading: false,
        });
      },
      () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        setOrigin({ ...DEFAULT_LOCATION, source: 'default', loading: false });
      },
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 }
    );

    return () => clearTimeout(timer);
  }, []);

  /** Re-requests the browser location on demand. */
  const requestBrowserLocation = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    setOrigin((prev) => ({ ...prev, loading: true }));
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Your location',
          source: 'browser',
          loading: false,
        }),
      () =>
        setOrigin({
          ...DEFAULT_LOCATION,
          source: 'default',
          loading: false,
        }),
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 }
    );
  }, []);

  const useDefaultLocation = useCallback(() => {
    setOrigin({ ...DEFAULT_LOCATION, source: 'default', loading: false });
  }, []);

  return { origin, requestBrowserLocation, useDefaultLocation };
}

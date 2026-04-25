import { useEffect, useState } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

const GEO_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 15000
};

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: true
  });

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setState({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Location access denied. Please enable GPS.',
        isLoading: false
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false
        });
      },
      () => {
        setState((previous) => ({
          ...previous,
          error: 'Location access denied. Please enable GPS.',
          isLoading: false
        }));
      },
      GEO_OPTIONS
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}

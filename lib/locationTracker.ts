import { supabaseApi } from "@/lib/supabaseApi";
import { isNativePlatform, getLocationPermissionState } from "@/lib/nativeMobile";

let watchId: string | number | null = null;
let isTracking = false;
let currentDriverId: string | null = null;

export async function startLocationTracking(driverId: string) {
  if (isTracking || !driverId) return;

  // Check permissions first
  const permission = await getLocationPermissionState();
  if (permission !== "granted") {
    console.warn("Location permission not granted, cannot start tracking");
    return;
  }

  currentDriverId = driverId;
  isTracking = true;

  console.log("Starting location tracking for driver:", driverId);

  const updateLocation = async (position: GeolocationPosition) => {
    if (!isTracking || !currentDriverId) return;

    const { latitude, longitude } = position.coords;

    try {
      await supabaseApi.drivers.update(currentDriverId, {
        latitude,
        longitude,
        last_seen_at: new Date().toISOString()
      });
      console.log("Location updated:", { latitude, longitude });
    } catch (error) {
      console.error("Failed to update location:", error);
    }
  };

  const handleError = (error: GeolocationPositionError) => {
    console.error("Location tracking error:", error);
  };

  if (isNativePlatform()) {
    // Use Capacitor Geolocation
    const { Geolocation } = await import("@capacitor/geolocation");
    watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      },
      (position, err) => {
        if (err) {
          handleError(err);
        } else if (position) {
          updateLocation(position);
        }
      }
    );
  } else {
    // Use browser geolocation
    watchId = navigator.geolocation.watchPosition(
      updateLocation,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000
      }
    );
  }
}

export function stopLocationTracking() {
  if (!isTracking) return;

  console.log("Stopping location tracking");

  if (watchId !== null) {
    if (isNativePlatform()) {
      // Capacitor clearWatch
      import("@capacitor/geolocation").then(({ Geolocation }) => {
        Geolocation.clearWatch({ id: watchId as string });
      });
    } else {
      // Browser clearWatch
      navigator.geolocation.clearWatch(watchId as number);
    }
  }

  watchId = null;
  isTracking = false;
  currentDriverId = null;
}

export function isLocationTrackingActive(): boolean {
  return isTracking;
}

export function getCurrentDriverId(): string | null {
  return currentDriverId;
}
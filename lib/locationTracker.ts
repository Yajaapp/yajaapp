import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/lib/supabase';

class LocationTracker {
  private watchId: string | null = null;
  private driverId: string | null = null;

  async start(driverId: string) {
    if (this.watchId) return;

    this.driverId = driverId;

    const perm = await Geolocation.checkPermissions();
    if (perm.location !== 'granted') {
      await Geolocation.requestPermissions();
    }

    this.watchId = await Geolocation.watchPosition(
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        allowBackgroundLocationUpdates: true,
        distanceFilter: 5,
      },
      async (position) => {
        if (!position?.coords || !this.driverId) return;

        await supabase
          .from('drivers')
          .update({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', this.driverId);
      }
    );
  }

  async stop() {
    if (this.watchId) {
      await Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
      this.driverId = null;
    }
  }
}

export const locationTracker = new LocationTracker();
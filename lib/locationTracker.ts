import { Geolocation } from '@capacitor/geolocation';
import { supabase } from '@/lib/supabase';

class LocationTracker {
  private watchId: string | null = null;

  start(driverId: string) {
    if (this.watchId) return;

    this.watchId = Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 },
      async (position) => {
        if (!position?.coords) return;

        await supabase
          .from('Driver')
          .update({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            last_seen_at: new Date().toISOString(),
          })
          .eq('id', driverId);
      }
    );
  }

  stop() {
    if (this.watchId) {
      Geolocation.clearWatch({ id: this.watchId });
      this.watchId = null;
    }
  }
}

export const locationTracker = new LocationTracker();
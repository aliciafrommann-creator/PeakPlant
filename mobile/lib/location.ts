import type { GeoCoords } from './discovery/providers/interface';

type PermissionResponse = {
  granted: boolean;
  canAskAgain?: boolean;
  status?: string;
};

type PositionResponse = {
  coords: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
  };
};

type ExpoLocationModule = {
  Accuracy?: { Balanced?: unknown };
  getForegroundPermissionsAsync: () => Promise<PermissionResponse>;
  requestForegroundPermissionsAsync: () => Promise<PermissionResponse>;
  getCurrentPositionAsync: (options?: Record<string, unknown>) => Promise<PositionResponse>;
};

declare const require: (moduleName: string) => unknown;

export type LocationRequestResult =
  | { ok: true; coords: GeoCoords; accuracyM?: number }
  | { ok: false; reason: 'module_unavailable' | 'permission_denied' | 'location_unavailable' };

function loadLocationModule(): ExpoLocationModule | null {
  try {
    const mod = require('expo-location') as Partial<ExpoLocationModule>;
    if (
      typeof mod.getForegroundPermissionsAsync === 'function' &&
      typeof mod.requestForegroundPermissionsAsync === 'function' &&
      typeof mod.getCurrentPositionAsync === 'function'
    ) {
      return mod as ExpoLocationModule;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * One-shot foreground location request. No background subscription, no tracking.
 * The caller must trigger this from a user tap so the permission prompt has
 * clear context ("find places near me").
 */
export async function requestCurrentForegroundLocation(): Promise<LocationRequestResult> {
  const Location = loadLocationModule();
  if (!Location) return { ok: false, reason: 'module_unavailable' };

  try {
    const currentPermission = await Location.getForegroundPermissionsAsync();
    const permission = currentPermission.granted
      ? currentPermission
      : await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) return { ok: false, reason: 'permission_denied' };

    const accuracy = Location.Accuracy?.Balanced;
    const position = await Location.getCurrentPositionAsync(
      accuracy ? { accuracy } : undefined,
    );
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { ok: false, reason: 'location_unavailable' };
    }
    return {
      ok: true,
      coords: { lat, lng },
      accuracyM: position.coords.accuracy ?? undefined,
    };
  } catch {
    return { ok: false, reason: 'location_unavailable' };
  }
}

export const SENLER_IO_REFRESH_STORAGE_KEY = 'senlerIoRefreshSession';

export interface SenlerIoRefreshSession {
  id: string;
  refreshToken: string;
}

export function getSenlerIoRefreshSession(): SenlerIoRefreshSession | null {
  if (localStorage.getItem('authProvider') !== 'SENLER_IO') return null;
  try {
    const value = JSON.parse(localStorage.getItem(SENLER_IO_REFRESH_STORAGE_KEY) || 'null');
    return typeof value?.id === 'string' && typeof value?.refreshToken === 'string' ? value : null;
  } catch {
    return null;
  }
}

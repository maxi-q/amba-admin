const LAST_OPENED_ROOM_STORAGE_KEY = "ambassador:last-opened-room";

export function getLastOpenedRoomId() {
  try {
    return localStorage.getItem(LAST_OPENED_ROOM_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function rememberLastOpenedRoom(roomId: string) {
  if (!roomId) return;

  try {
    localStorage.setItem(LAST_OPENED_ROOM_STORAGE_KEY, roomId);
  } catch {
    // Storage may be unavailable in a restricted embedded browser.
  }
}

export function pickInitialRoom<T extends { id: string }>(rooms: T[]) {
  const rememberedRoomId = getLastOpenedRoomId();
  return rooms.find((room) => room.id === rememberedRoomId) ?? rooms[0] ?? null;
}

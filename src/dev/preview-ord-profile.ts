import type { AxiosRequestConfig } from "axios";
import type { BaseRoomDto, CreateRoomOrdProfileRequestDto, GetRoomByIdResponseDto, RoomOrdProfileResponseDto, UpdateRoomOrdProfileRequestDto } from "@/api/generated/model";

export function createOrdProfilePreview(room: BaseRoomDto, empty = false) {
  let profile: RoomOrdProfileResponseDto | null = empty ? null : {
    id: "ord-profile-preview", inn: "500100732259", name: "Морозов Константин Николаевич",
    phone: "+79999999999", juridicalType: "physical", syncedAt: null, lastSyncError: null,
  };
  const url = `/api/rooms/${room.id}`;

  return (config: AxiosRequestConfig): GetRoomByIdResponseDto | RoomOrdProfileResponseDto | undefined => {
    const method = (config.method ?? "GET").toUpperCase();
    if (method === "GET" && config.url === url) return { ...room, ordPerson: profile ? { ...profile } : null };
    if (config.url !== `${url}/ord-profile` || !["POST", "PUT"].includes(method)) return undefined;
    const data = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    const allowed = method === "POST" ? ["inn", "name", "phone", "juridicalType"] : ["name", "phone"];
    if (!data || Object.keys(data).some((key) => !allowed.includes(key))) throw new Error("Поля не соответствуют API профиля ОРД");
    if (method === "POST") {
      if (profile) throw new Error("Профиль ОРД уже создан");
      if (allowed.some((key) => !data[key])) throw new Error("Заполните обязательные поля профиля ОРД");
      const input = data as CreateRoomOrdProfileRequestDto;
      profile = { id: "ord-profile-preview", inn: input.inn, name: input.name, phone: input.phone, juridicalType: input.juridicalType, syncedAt: null, lastSyncError: null };
    } else {
      if (!profile) throw new Error("Профиль ОРД не найден");
      const input = data as UpdateRoomOrdProfileRequestDto;
      profile = { ...profile, name: input.name ?? profile.name, phone: input.phone ?? profile.phone };
    }
    return { ...profile };
  };
}

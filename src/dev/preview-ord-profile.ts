import type { AxiosRequestConfig } from "axios";
import type { BaseRoomDto, CreateRoomOrdProfileRequestDto, GetRoomByIdResponseDto, RoomOrdProfileResponseDto, UpdateRoomOrdProfileRequestDto } from "@/api/generated/model";

export function createOrdProfilePreview(room: BaseRoomDto, empty = false) {
  let profile: RoomOrdProfileResponseDto | null = empty ? null : {
    id: "ord-profile-preview", inn: "500100732259", name: "Морозов Константин Николаевич",
    phone: "+79999999999", juridicalType: "physical", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    address: null, foreignOksmCountryCode: null, foreignEpaymentMethod: null, foreignRegistrationNumber: null,
    foreignInn: null, syncedAt: null, lastSyncError: null,
  };
  const url = `/api/rooms/${room.id}`;

  return (config: AxiosRequestConfig): GetRoomByIdResponseDto | RoomOrdProfileResponseDto | undefined => {
    const method = (config.method ?? "GET").toUpperCase();
    if (method === "GET" && config.url === url) return { ...room, ordPerson: profile ? { ...profile } : null };
    if (config.url !== `${url}/ord-profile` || !["POST", "PUT"].includes(method)) return undefined;
    const data = typeof config.data === "string" ? JSON.parse(config.data) : config.data;
    const allowed = method === "POST" ? ["inn", "name", "phone", "juridicalType", "address", "foreignOksmCountryCode", "foreignEpaymentMethod", "foreignRegistrationNumber", "foreignInn", "ordPersonId"] : ["name", "phone"];
    if (!data || Object.keys(data).some((key) => !allowed.includes(key))) throw new Error("Поля не соответствуют API профиля ОРД");
    if (method === "POST") {
      if (profile) throw new Error("Профиль ОРД уже создан");
      const input = data as CreateRoomOrdProfileRequestDto;
      const required: Array<string | null | undefined> = [input.name, input.phone, input.juridicalType];
      if (input.juridicalType === "foreign_physical") {
        required.push(input.foreignOksmCountryCode, input.foreignEpaymentMethod);
      } else if (input.juridicalType === "foreign_juridical") {
        required.push(input.foreignOksmCountryCode, input.foreignRegistrationNumber, input.foreignInn);
      } else {
        required.push(input.inn);
      }
      if (required.some((value) => !value)) throw new Error("Заполните обязательные поля профиля ОРД");
      profile = {
        id: "ord-profile-preview", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        inn: input.inn ?? null, name: input.name, phone: input.phone, juridicalType: input.juridicalType,
        address: input.address ?? null, foreignOksmCountryCode: input.foreignOksmCountryCode ?? null,
        foreignEpaymentMethod: input.foreignEpaymentMethod ?? null,
        foreignRegistrationNumber: input.foreignRegistrationNumber ?? null, foreignInn: input.foreignInn ?? null,
        syncedAt: null, lastSyncError: null,
      };
    } else {
      if (!profile) throw new Error("Профиль ОРД не найден");
      const input = data as UpdateRoomOrdProfileRequestDto;
      const current = profile;
      profile = { ...current, name: input.name ?? current.name, phone: input.phone ?? current.phone, updatedAt: new Date().toISOString() };
    }
    return profile ? { ...profile } : undefined;
  };
}

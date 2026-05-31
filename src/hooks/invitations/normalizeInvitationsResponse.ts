import type { BaseAfterRegistrationInvitationDto } from '@/api/generated/model';

export function normalizeInvitationsResponse(raw: unknown): BaseAfterRegistrationInvitationDto[] {
  if (Array.isArray(raw)) return raw as BaseAfterRegistrationInvitationDto[];
  if (raw && typeof raw === 'object' && 'items' in raw && Array.isArray((raw as { items: unknown }).items)) {
    return (raw as { items: BaseAfterRegistrationInvitationDto[] }).items;
  }
  return [];
}

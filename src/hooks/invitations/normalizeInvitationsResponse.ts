import type { IInvitation } from '@services/invitations/invitations.types';

export function normalizeInvitationsResponse(raw: unknown): IInvitation[] {
  if (Array.isArray(raw)) return raw as IInvitation[];
  if (raw && typeof raw === 'object' && 'items' in raw && Array.isArray((raw as { items: unknown }).items)) {
    return (raw as { items: IInvitation[] }).items;
  }
  return [];
}

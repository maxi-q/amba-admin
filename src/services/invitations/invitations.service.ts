import { instance } from '@services/config/axios';
import { getContentType } from '@services/config/axios.helper';
import type {
  ICreateInvitationRequest,
  ICreateInvitationResponse,
  IInvitation,
  IUpdateInvitationRequest,
  IUpdateInvitationResponse,
} from './invitations.types';

class InvitationsService {
  private _BASE_URL = 'invitations';

  async createInvitation(data: ICreateInvitationRequest) {
    return instance.post<ICreateInvitationResponse>(`${this._BASE_URL}`, data, { headers: getContentType() });
  }

  async getInvitationsByRoom(roomId: string) {
    return instance.get<IInvitation[] | { items: IInvitation[] }>(
      `${this._BASE_URL}/room/${roomId}`,
      { headers: getContentType() }
    );
  }

  async updateInvitation(id: string, data: IUpdateInvitationRequest) {
    return instance.patch<IUpdateInvitationResponse>(`${this._BASE_URL}/${id}`, data, { headers: getContentType() });
  }

  async deleteInvitation(id: string) {
    return instance.delete<void>(`${this._BASE_URL}/${id}`, { headers: getContentType() });
  }
}

const invitationsService = new InvitationsService();

export default invitationsService;

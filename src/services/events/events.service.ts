import { instance } from '@services/config/axios';
import type { ICreateEventRequest, ICreateEventResponse, IGetEventsRequest, IGetEventsResponse, IPatchEventsRequest, IPatchEventsResponse } from './events.types';
import { getContentType } from '@services/config/axios.helper';


class EventsService {
  private _BASE_URL = 'events';
  
  async getEvents(data: IGetEventsRequest, roomId: string) {
    return instance.get<IGetEventsResponse>(`${this._BASE_URL}/${roomId}`, { params: data, headers: getContentType() })
  }

  async patchEvents(data: IPatchEventsRequest, eventId: string) {
    return instance.patch<IPatchEventsResponse>(`${this._BASE_URL}/${eventId}`, data, { headers: getContentType() });
  }

  async createEvent(data: ICreateEventRequest) {
    return instance.post<ICreateEventResponse>(`${this._BASE_URL}`, data, { headers: getContentType() });
  }

  async checkPromoCodesPrefixAvailable(prefix: string) {
    return instance.get<boolean>(`${this._BASE_URL}/checkPromoCodesPrefixAvailable`, { params: { prefix }, headers: getContentType() });
  }

}

const eventsService = new EventsService();

export default eventsService;
import { instance } from '@services/config/axios';
import type { 
  ICreateEventRequest, 
  ICreateEventResponse, 
  IGetEventsRequest, 
  IGetEventsResponse, 
  IPatchEventsRequest, 
  IPatchEventsResponse,
  IApiErrorResponse
} from './events.types';
import { ApiError } from './events.types';
import { 
  getContentType, 
  isValidationError, 
  extractFieldErrors 
} from '@services/config/axios.helper';


class EventsService {
  private _BASE_URL = 'events';

  private async handleApiCall<T>(
    apiCall: () => Promise<{ data: T }>
  ): Promise<T> {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error: any) {
      const errorResponse: IApiErrorResponse = {
        statusCode: error?.response?.status || 500,
        timestamp: error?.response?.data?.timestamp || new Date().toISOString(),
        path: error?.response?.data?.path || error?.config?.url || '',
        message: error?.response?.data?.message || error?.message || 'Unknown error'
      };

      // Extract field errors for validation errors (422)
      let fieldErrors: Record<string, string[]> | undefined;
      if (isValidationError(error)) {
        fieldErrors = extractFieldErrors(error);
      }

      // Throw custom ApiError instead of returning error object
      throw new ApiError(errorResponse, fieldErrors);
    }
  }

  async getEvents(data: IGetEventsRequest, roomId: string): Promise<IGetEventsResponse> {
    return this.handleApiCall(() => 
      instance.get<IGetEventsResponse>(`${this._BASE_URL}/${roomId}`, { params: data, headers: getContentType() })
    );
  }

  async patchEvents(data: IPatchEventsRequest, eventId: string): Promise<IPatchEventsResponse> {
    return this.handleApiCall(() => 
      instance.patch<IPatchEventsResponse>(`${this._BASE_URL}/${eventId}`, data, { headers: getContentType() })
    );
  }

  async createEvent(data: ICreateEventRequest): Promise<ICreateEventResponse> {
    return this.handleApiCall(() => 
      instance.post<ICreateEventResponse>(`${this._BASE_URL}`, data, { headers: getContentType() })
    );
  }
  
  async checkPromoCodesPrefixAvailable(promoCodesPrefix: string): Promise<boolean> {
    return this.handleApiCall(() => 
      instance.get<boolean>(`${this._BASE_URL}/checkPromoCodesPrefixAvailable`, { params: { promoCodesPrefix }, headers: getContentType() })
    );
  }

}

const eventsService = new EventsService();

export default eventsService;
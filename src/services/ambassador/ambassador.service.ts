import { instance } from '@services/config/axios';
import type { IGetAmbassadorsResponse, IGetAmbassadorsRequest } from './ambassador.types';
import { getContentType } from '@services/config/axios.helper';


class AmbassadorService {
  private _BASE_URL = 'ambassador';

  async getAmbassadors(data: IGetAmbassadorsRequest) {
    return instance.get<IGetAmbassadorsResponse>(`${this._BASE_URL}`, { params: data, headers: getContentType() });
  }
}

const ambassadorService = new AmbassadorService();

export default ambassadorService;
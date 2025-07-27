import { instance } from '@services/config/axios';
import type { IUsePromoCodeRequest, IUsePromoCodeResponse } from './promocodes.types';


class PromoCodesService {
  private _BASE_URL = 'promo-code';

  async usePromoCode(data: IUsePromoCodeRequest) {
    return instance.post<IUsePromoCodeResponse>(`${this._BASE_URL}/use`, data);
  }
}

const promocodesService = new PromoCodesService();

export default promocodesService;
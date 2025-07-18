import type { IUser } from '@/App';
import { instance } from '@services/config/axios';


class UserService {
  private _BASE_URL = '/users';

  async fetchProfile() {
    return instance.get<IUser>(`${this._BASE_URL}/me`);
  }
}

const userService = new UserService();

export default userService;
import axios, { type CreateAxiosDefaults } from 'axios'

import { API_URL } from '@/constants';


const axiosOptions: CreateAxiosDefaults = {
  baseURL: API_URL,
};

export const instance = axios.create(axiosOptions)
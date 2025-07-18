import axios, { type CreateAxiosDefaults } from 'axios'

import { getContentType } from './axios.helper';
import { API_URL } from '@/constants';

const axiosOptions: CreateAxiosDefaults = {
  baseURL: API_URL,
  headers: getContentType(),
};

export const instance = axios.create(axiosOptions)
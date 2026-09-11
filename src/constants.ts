export const API_URL = import.meta.env.VITE_API_URL

export const getApiBaseUrl = (apiUrl: string = API_URL || '') => {
  const normalizedUrl = apiUrl.replace(/\/+$/, '');
  return normalizedUrl.endsWith('/api')
    ? normalizedUrl.slice(0, -'/api'.length)
    : normalizedUrl;
};

export const getApiEndpointUrl = (path: string) =>
  `${getApiBaseUrl()}/api/${path.replace(/^\/+/, '')}`;

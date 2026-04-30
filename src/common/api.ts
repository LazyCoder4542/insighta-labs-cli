import axios, { AxiosInstance } from 'axios';
import { loadCredentials, saveCredentials, clearCredentials } from './credentials';

export const BASE_URL = process.env.INSIGHTA_API_URL || 'http://localhost:3000';

let _api: AxiosInstance | null = null;

export function getApi(): AxiosInstance {
  if (_api) return _api;

  _api = axios.create({
    baseURL: BASE_URL,
    headers: { 'X-API-Version': '1' },
  });

  _api.interceptors.request.use((config) => {
    const creds = loadCredentials();
    if (creds?.access_token) {
      config.headers.Authorization = `Bearer ${creds.access_token}`;
    }
    return config;
  });

  _api.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config as any;
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        const creds = loadCredentials();
        if (creds?.refresh_token) {
          try {
            const { data } = await axios.post(
              `${BASE_URL}/api/auth/refresh`,
              { refresh_token: creds.refresh_token },
              { headers: { 'X-API-Version': '1' } },
            );
            saveCredentials({ ...creds, access_token: data.access_token, refresh_token: data.refresh_token });
            original.headers.Authorization = `Bearer ${data.access_token}`;
            return _api!(original);
          } catch {
            clearCredentials();
            console.error('\nSession expired. Please run: insighta login');
            process.exit(1);
          }
        }
        console.error('\nNot authenticated. Please run: insighta login');
        process.exit(1);
      }
      return Promise.reject(error);
    },
  );

  return _api;
}

'use client';

import { useState } from 'react';
import axiosInstance from '../../axiosConfig';
import { AxiosResponse, AxiosError } from 'axios';

interface ApiOptions {
  method?: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

interface ApiResponse<T = any> {
  data?: T;
  status?: number;
  error?: AxiosError;
}

interface UseApiReturn {
  trigger: <T = any>(url: string, options?: ApiOptions) => Promise<ApiResponse<T>>;
  data: any;
  error: AxiosError | null;
  status: number | null;
}

const useApi = (): UseApiReturn => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  /**
   * trigger API call
   * @param {string} url - API endpoint
   * @param {object} options - { method, data, params, headers, ... }
   */

  const trigger = async <T = any>(url: string, options: ApiOptions = {}): Promise<ApiResponse<T>> => {
    setError(null);
    setData(null);

    const method = options.method ? options.method.toLowerCase() : 'get';

    try {
      let response: AxiosResponse<T>;

      if (method === 'get') {
        response = await axiosInstance.get<T>(url, {
          params: options.params || options.data,
          headers: options.headers,
        });
      } else if (method === 'delete') {
        response = await axiosInstance.delete<T>(url, {
          data: options.data,
          headers: options.headers,
        });
      } else {
        response = await axiosInstance[method as 'post' | 'put' | 'patch']<T>(url, options.data, {
          headers: options.headers,
        });
      }

      setStatus(response.status);
      setData(response.data);

      return { data: response.data, status: response.status };
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError);
      return { error: axiosError };
    }
  };

  return { trigger, data, error, status };
};

export default useApi;
'use client';
import { useState } from 'react';
import axiosInstance from '../../axiosConfig';
import type { AxiosError, AxiosResponse } from 'axios';

export interface ApiOptions {
  method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
  data?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export type ApiResponse<T> = {
  data?: T;
  message?: string;
  status: number;
}

export type ApiError = {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
};

export interface UseApiReturn {
  trigger: <T = unknown>(url: string, options?: ApiOptions) => Promise<ApiResponse<T>>;
  data: ApiResponse<unknown> | null;
  error: AxiosError | null;
  status: number | null;
}

const useApi = (): UseApiReturn => {
  const [data, setData] = useState<ApiResponse<unknown> | null>(null);
  const [error, setError] = useState<AxiosError | null>(null);
  const [status, setStatus] = useState<number | null>(null);

  const trigger = async <T = unknown>(
    url: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    setError(null);
    setData(null);
    setStatus(null);

    const method = options.method?.toLowerCase() ?? 'get';

    try {
      let response: AxiosResponse<T>;

      if (method === 'get') {
        response = await axiosInstance.get<T>(url, { params: options.params ?? options.data, headers: options.headers });
      } else if (method === 'delete') {
        response = await axiosInstance.delete<T>(url, { data: options.data, headers: options.headers });
      } else {
        response = await axiosInstance[method as 'post' | 'put' | 'patch']<T>(url, options.data, { headers: options.headers });
      }

      const result: ApiResponse<T> = {
        data: response.data,
        status: response.status,
      };

      setData(result);
      setStatus(response.status);
      return result;
    } catch (err) {
      const axiosError = err as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      const apiError: ApiError = {
        message:
          axiosError.response?.data?.message ??
          axiosError.message ??
          'Unexpected error',
        status: axiosError.response?.status ?? 500,
        errors: axiosError.response?.data?.errors,
      };

      setError(axiosError);
      setStatus(apiError.status);
      throw apiError;
    }
  };

  return { trigger, data, error, status };
};

export default useApi;

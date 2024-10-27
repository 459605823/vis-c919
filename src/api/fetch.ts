import {createFetch} from '@vueuse/core';
import type {AfterFetchContext, BeforeFetchContext} from '@vueuse/core';

function beforeFetch({options}: BeforeFetchContext) {
  const seachParams = new URLSearchParams(window.location.search);
  const token = seachParams.get('token');
  (options.headers as Record<string, any>).Authorization = `Bearer ${token}`;
  return {options};
}

function afterFetch(ctx: AfterFetchContext) {
  const {data, response} = ctx;
  if (response.ok) {
    if (data.statusCode !== 0) {
      throw new Error(data.msg);
    }
  }
  return ctx;
}

const fetch_ = createFetch({
  // 单独配置某个请求的配置时进行覆盖
  baseUrl: '/api',
  options: {
    immediate: true,
    refetch: false,
    timeout: 10 * 60 * 10000,
    beforeFetch,
    afterFetch,
  },
  fetchOptions: {
    mode: 'cors',
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'text/plain',
    },
  },
});

const methods = [
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'head',
  'options',
] as const;

type Methods = (typeof methods)[number];

type HandleMethods = 'json' | 'text' | 'blob' | 'formData' | 'arrayBuffer';

type Api = Record<Methods, ReturnType<typeof getRequestFn>>;

function getRequestFn(method: Methods) {
  return async (
    url: string,
    options: {
      searchParams?: Record<string, any>;
      body?: FormData | URLSearchParams | Record<string, any> | string;
      handleMethod?: HandleMethods;
    } = {},
  ) => {
    const {searchParams, handleMethod = 'json'} = options;
    let {body} = options;
    const fetchOptions: RequestInit = {};
    if (searchParams) {
      const params = new URLSearchParams(searchParams);
      const keys = [...params.keys()];
      for (const key of keys) {
        const value = params.get(key);
        if (!value) {
          params.delete(key);
        }
      }
      const search = params.toString();
      if (search) {
        url += `?${search}`;
      }
    }
    if (body instanceof FormData) {
      fetchOptions.headers = {
        'Content-Type': 'multipart/form-data',
      };
    } else if (body instanceof URLSearchParams) {
      fetchOptions.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };
    } else if (typeof body === 'object') {
      fetchOptions.headers = {
        'Content-Type': 'application/json',
      };
      body = JSON.stringify(body);
    }
    if (body) {
      fetchOptions.body = body;
    }
    const fn = fetch_(url, {
      method,
      ...fetchOptions,
    });
    const {data, error} = await fn[handleMethod]();
    if (error.value)
      return {err: error.value};
    return {res: data.value};
  };
}

const api = Object.create(null) as Api;

methods.forEach((method) => {
  api[method] = getRequestFn(method);
});

export default api;

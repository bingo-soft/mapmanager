import { HttpMethod } from './HttpMethod'

export type ApiRequest = {
    method: HttpMethod;
    baseURL?: string;
    params?: any;
    headers?: any;
}
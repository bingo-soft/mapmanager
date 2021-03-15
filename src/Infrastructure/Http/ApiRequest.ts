import { HttpMethod } from './HttpMethod'

/** @type ApiRequest */
export type ApiRequest = {
    method: HttpMethod;
    base_url?: string;
    params?: unknown;
    headers?: unknown;
    data?: unknown;
}
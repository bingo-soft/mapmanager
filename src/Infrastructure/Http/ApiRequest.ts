import { RequestOnFullFilledFunction, ResponseOnFullFilledFunction, OnRejectedFunction } from './RequestResponseFunctionType';
import { HttpMethod } from './HttpMethod'

export type ApiRequest = {
    method: HttpMethod;
    base_url: string;
    params?: unknown;
    headers?: unknown;
    data?: unknown;
    axios_params?: unknown;
    request_on_fullfilled?: RequestOnFullFilledFunction;
    request_on_rejected?: OnRejectedFunction;
    response_on_fullfilled?: ResponseOnFullFilledFunction;
    response_on_rejected?: OnRejectedFunction;    
}
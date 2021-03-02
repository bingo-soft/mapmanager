import VectorLayerRepositoryInterface from "../../Domain/Repository/VectorLayerRepositoryInterface"
import { ApiClient } from '../Http/ApiClient'
import { ApiRequest } from '../Http/ApiRequest'

/** @class VectorLayerRepository */
export default class VectorLayerRepository { 
    public get(request: object): Promise<string> {
        const httpRequest : ApiRequest = <ApiRequest> request;
        return ApiClient.request(httpRequest);
    }
}
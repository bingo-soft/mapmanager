import VectorLayerRepositoryInterface from "../../Domain/Repository/VectorLayerRepositoryInterface"
import { ApiClient } from '../Http/ApiClient'
import { ApiRequest } from '../Http/ApiRequest'

/** VectorLayerRepository */
export default class VectorLayerRepository implements VectorLayerRepositoryInterface {

    /**
     * Returns data via API request
     * @param request - request params
     * @return result of API request
     */
    public get(request: unknown): Promise<string> {
        return ApiClient.request(<ApiRequest> request);
    }
}
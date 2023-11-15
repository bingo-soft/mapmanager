import LayerRepositoryInterface from "../../Domain/Repository/LayerRepositoryInterface"
import { ApiClient } from '../Http/ApiClient'
import { ApiRequest } from '../Http/ApiRequest'

/** LayerRepository */
export default class LayerRepository implements LayerRepositoryInterface {

    /**
     * Returns data via API request
     * @param request - request params
     * @return result of API request
     */
    public get(request: unknown): Promise<any> {
        return ApiClient.request(<ApiRequest> request);
    }
}
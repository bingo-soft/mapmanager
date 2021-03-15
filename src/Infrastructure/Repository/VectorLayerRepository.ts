import VectorLayerRepositoryInterface from "../../Domain/Repository/VectorLayerRepositoryInterface"
import { ApiClient } from '../Http/ApiClient'
import { ApiRequest } from '../Http/ApiRequest'

/** @class VectorLayerRepository */
export default class VectorLayerRepository implements VectorLayerRepositoryInterface {

    /**
     * Gets data via API request
     *
     * @function request
     * @memberof ApiClient
     * @static
     * @param {Object} request - request params
     * @return {Promise<string>} result of API request
     */
    public get(request: unknown): Promise<string> {
        return ApiClient.request(<ApiRequest> request);
    }
}
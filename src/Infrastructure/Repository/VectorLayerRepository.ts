import VectorLayerRepositoryInterface from "../../Domain/Repository/VectorLayerRepositoryInterface"
import { ApiClient } from '../Http/ApiClient'
import { ApiRequest } from '../Http/ApiRequest'

/** @class VectorLayerRepository */
export default class VectorLayerRepository implements VectorLayerRepositoryInterface {

    /**
     * Returns data via API request
     *
     * @function get
     * @memberof VectorLayerRepository
     * @param {Object} request - request params
     * @return {String} result of API request
     */
    public get(request: unknown): Promise<string> {
        return ApiClient.request(<ApiRequest> request);
    }
}
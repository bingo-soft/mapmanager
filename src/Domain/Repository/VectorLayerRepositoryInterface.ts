/** @interface VectorLayerRepositoryInterface */
export default interface VectorLayerRepositoryInterface
{
    /**
     * Returns data via API request
     *
     * @function get
     * @memberof VectorLayerRepositoryInterface
     * @param {Object} request - request params
     * @return {String} result of API request
     */
    get(request: unknown): Promise<string>;
}
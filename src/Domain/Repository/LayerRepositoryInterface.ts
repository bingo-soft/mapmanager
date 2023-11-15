/** LayerRepositoryInterface */
export default interface LayerRepositoryInterface
{
    /**
     * Returns data via API request
     * @param request - request params
     * @return result of API request
     */
    get(request: unknown): Promise<any>;
}
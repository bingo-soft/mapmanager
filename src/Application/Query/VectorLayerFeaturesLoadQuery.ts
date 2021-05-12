import VectorLayerRepositoryInterface from "../../Domain/Repository/VectorLayerRepositoryInterface";

/** @class VectorLayerFeaturesQuery */
export default class VectorLayerFeaturesLoadQuery {
    private repository: VectorLayerRepositoryInterface;

    /**
     * @constructor
     * @memberof VectorLayerFeaturesQuery
     * @param {Object} repository - repository
     */
    constructor(repository: VectorLayerRepositoryInterface) {
        this.repository = repository;
    }

    /**
     * Executes a request
     *
     * @function execute
     * @memberof VectorLayerFeaturesQuery
     * @param {Object} - request object
     * @return {String} layer features in GeoJSON
     */
    public execute(request: unknown): Promise<string> {
        return this.repository.get(request);
    }
}
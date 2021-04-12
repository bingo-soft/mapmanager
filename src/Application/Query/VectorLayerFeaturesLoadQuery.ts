import VectorLayerRepositoryInterface from "../../Domain/Repository/VectorLayerRepositoryInterface";

/** @class VectorLayerFeaturesQuery */
export default class VectorLayerFeaturesLoadQuery {
    private repository: VectorLayerRepositoryInterface;

    /**
     * @constructor
     * @memberof VectorLayerFeaturesQuery
     * @param {VectorLayerRepositoryInterface} repository - repository
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
     * @return {LayerInterface} layer
     */
    public execute(request: unknown): Promise<string> {
        return this.repository.get(request);
    }
}
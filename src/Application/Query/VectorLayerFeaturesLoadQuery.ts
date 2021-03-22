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

    public execute(request: unknown): Promise<string> {
        return this.repository.get(request);
    }
}
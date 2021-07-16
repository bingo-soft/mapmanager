import VectorLayerRepositoryInterface from "../../Domain/Repository/VectorLayerRepositoryInterface";

/** VectorLayerFeaturesLoadQuery */
export default class VectorLayerFeaturesLoadQuery {
    private repository: VectorLayerRepositoryInterface;

    /**
     * @param repository - repository
     */
    constructor(repository: VectorLayerRepositoryInterface) {
        this.repository = repository;
    }

    /**
     * Executes a request
     * @param request - request object
     * @return layer features in GeoJSON
     */
    public execute(request: unknown): Promise<string> {
        return this.repository.get(request);
    }
}
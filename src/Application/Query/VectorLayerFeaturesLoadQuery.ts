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
     * @return layer features in GeoJSON in case of vector layers, arraybuffer in case of vector tile layers
     */
    public execute(request: unknown): Promise<any> {
        return this.repository.get(request);
    }
}
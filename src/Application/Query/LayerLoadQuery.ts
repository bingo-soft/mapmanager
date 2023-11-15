import LayerRepositoryInterface from "../../Domain/Repository/LayerRepositoryInterface";

/** LayerLoadQuery */
export default class LayerLoadQuery {
    private repository: LayerRepositoryInterface;

    /**
     * @param repository - repository
     */
    constructor(repository: LayerRepositoryInterface) {
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
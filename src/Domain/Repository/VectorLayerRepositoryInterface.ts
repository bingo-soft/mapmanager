export default interface VectorLayerRepositoryInterface
{
    get(request: unknown): Promise<string>;
}
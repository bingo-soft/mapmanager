export default interface VectorLayerRepositoryInterface
{
    get(request: object): Promise<string>;
}
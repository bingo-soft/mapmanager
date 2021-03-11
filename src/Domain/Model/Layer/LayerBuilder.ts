import LayerInterface from "./LayerInterface"
import SourceType from "../Source/SourceType"
import VectorSource from "../Source/Impl/VectorSource"
import XYZSource from "../Source/Impl/XYZSource"
import TileArcGISRestSource from "../Source/Impl/TileArcGISRestSource"
import StyleBuilder from "../Style/StyleBuilder"

/** @class LayerBuilder */
export default class LayerBuilder {
    private layer: LayerInterface;

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {LayerInterface} layer - layer
     */
    constructor(layer: LayerInterface) {
        this.layer = layer;
    }

    public setSource(type: SourceType): LayerBuilder {
        switch (type) {
            case SourceType.Vector:
                this.layer.setSource(new VectorSource());
                break;
           /*  case SourceType.Tile:
                break;  */
            case SourceType.XYZ:
                this.layer.setSource(new XYZSource());
                break;
            case SourceType.TileArcGISRest:
                this.layer.setSource(new TileArcGISRestSource());
                break;
            default:
                break;
        }
        return this;
    }

    public setLoader(loader: () => Promise<string>, opts?: unknown): LayerBuilder {
        this.layer.setLoader(loader, opts);
        return this;
    }

    public setUrl(url: string): LayerBuilder {
        this.layer.setUrl(url);
        return this;
    }

    public setStyle(opts: unknown): LayerBuilder {
        const style = (new StyleBuilder(opts)).build();
        this.layer.setStyle(style);
        return this;
    }

    /**
     * Builds layer
     *
     * @function build
     * @memberof LayerBuilder
     * @return {LayerInterface} - layer
     */
    public build(): LayerInterface {
        return this.layer;
    }
}
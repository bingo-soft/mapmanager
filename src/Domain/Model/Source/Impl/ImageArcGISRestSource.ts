import OlImageArcGISRestSource from "ol/source/ImageArcGISRest";
import BaseSource from "../BaseSource";
import SourceType from "../SourceType";

/** ImageArcGISRestSource */
export default class ImageArcGISRestSource extends BaseSource {
    
    constructor() {
        super();
        this.source = new OlImageArcGISRestSource({
            crossOrigin: "anonymous"
        });
    }

    /**
     * Returns type of source
     * @return type of source
     */
    public getType(): SourceType {
        return SourceType.ImageArcGISRest;
    }

    
}
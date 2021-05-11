import OlSource from "ol/source/Source";
import { Extent as OlExtent } from "ol/extent";
import SourceInterface from "./SourceInterface";
import SourceType from "./SourceType";
import MethodNotImplemented from "../../Exception/MethodNotImplemented";

/** @class BaseSource */
export default abstract class BaseSource implements SourceInterface
{
    protected source: OlSource;

    /**
     * Returns Openlayers' source instance
     *
     * @function getSource
     * @memberof BaseSource
     * @return {Object} type of source
     */
    public getSource(): OlSource {
        return this.source;
    }

    /**
     * Returns type of source
     *
     * @function getType
     * @memberof BaseSource
     * @return {String} type of source
     */
    public abstract getType(): SourceType;

    /**
     * Returns extent of source
     *
     * @function getExtent
     * @memberof BaseSource
     * @return {Array} extent of source
     */
    public getExtent(): OlExtent {
        throw new MethodNotImplemented();
    }

    /**
     * Returns code of source's projection
     *
     * @function getProjectionCode
     * @memberof BaseSource
     * @return {String} extent of source
     */
    public getProjectionCode(): string {
        return this.source.getProjection().getCode();
    }
}
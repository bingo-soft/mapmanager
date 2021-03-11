import { Extent as olExtent } from "ol/extent"
import OlSource from "ol/source/Source"
import SourceType from "./SourceType"


export default interface SourceInterface
{
    getSource(): OlSource;

    getType(): SourceType;

    getExtent(): olExtent;
}
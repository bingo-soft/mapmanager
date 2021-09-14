import OlProjection from "ol/proj/Projection";
import { Extent as OlExtent } from "ol/extent";

type LoaderFunction = (extent: OlExtent, resolution: number, projection: OlProjection) => Promise<string>;
export default LoaderFunction;
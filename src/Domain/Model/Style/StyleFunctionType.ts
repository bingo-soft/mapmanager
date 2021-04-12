
import { Style as OlStyle } from "ol/style";
import OlFeature from "ol/Feature";

type StyleFunction = (feature: OlFeature) => OlStyle;
export default StyleFunction;
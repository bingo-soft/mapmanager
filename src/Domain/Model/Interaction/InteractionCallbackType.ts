import Feature from "../Feature/Feature";
import FeatureCollection from "../Feature/FeatureCollection";

export type DrawCallbackFunction = (feature: Feature) => void;
export type SelectCallbackFunction = (features: FeatureCollection) => void;
export type ModifyCallbackFunction = (features: FeatureCollection) => void;
export type TransformCallbackFunction = (features: FeatureCollection) => void;
//export type MeasureCallbackFunction =  (measureResult: number) => void;
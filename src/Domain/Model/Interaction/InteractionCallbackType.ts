import OlBaseEvent from "ol/events/Event";
import Feature from "../Feature/Feature";
import FeatureCollection from "../Feature/FeatureCollection";

export type ZoomCallbackFunction = (zoom: number) => void;
export type DrawCallbackFunction = (feature: Feature) => void;
export type SelectCallbackFunction = (features: FeatureCollection) => void;
export type ModifyCallbackFunction = (features: FeatureCollection) => void;
export type TransformCallbackFunction = (features: FeatureCollection) => void;
export type MeasureCallbackFunction = (measureResult: string) => void;
export type MapCoordinatesCallbackFunction = (coordinates: number[], pixelCoordinates: number[], mapProjection: string) => void;
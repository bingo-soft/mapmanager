import BaseVectorLayer from "ol/layer/BaseVector";
import Vector from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Geometry } from "ol/geom"
import { VectorTile } from "ol/source";
import CanvasVectorLayerRenderer from "ol/renderer/canvas/VectorLayer";
import CanvasVectorTileLayerRenderer from "ol/renderer/canvas/VectorTileLayer";
import CanvasVectorImageLayerRenderer from "ol/renderer/canvas/VectorImageLayer";
import WebGLPointsLayerRenderer from "ol/renderer/webgl/PointsLayer";

export type OlBaseVectorLayer = BaseVectorLayer<
    VectorSource<Geometry> | VectorTile,
    CanvasVectorLayerRenderer | CanvasVectorTileLayerRenderer | CanvasVectorImageLayerRenderer | WebGLPointsLayerRenderer
>
export type OlVectorLayer = Vector<VectorSource<Geometry>>;

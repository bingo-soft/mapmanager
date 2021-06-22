import VertexCoordinate from "./VertexCoordinate";

type GeometryItem = {
    "uuid": string,
    "id": number,
    "type": string,
    "name": string,
    "children": GeometryItem[] | VertexCoordinate[]
}

export default GeometryItem;
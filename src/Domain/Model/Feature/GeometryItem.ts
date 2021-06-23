import VertexCoordinate from "./VertexCoordinate";

type GeometryItem = {
    "id": number,
    "name": string,
    "children": GeometryItem[] | VertexCoordinate[]
}

export default GeometryItem;
import VertexCoordinate from "./VertexCoordinate";

type GeometryItem = {
    "id": string,
    "row_number": number,
    "type": string,
    "name": string,
    "children": GeometryItem[] | VertexCoordinate[]
}

export default GeometryItem;
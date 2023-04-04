import OlBaseEvent from "ol/events/Event";

type Handler = (e: OlBaseEvent | KeyboardEvent) => void;
export default Handler;

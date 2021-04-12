import BaseInteraction from "./BaseInteraction";
import InteractionType from "../InteractionType";
//import EventHandlerCollection from "../../EventHandlerCollection/EventHandlerCollection";
import Map from "../../Map/Map";

export default class NormalInteraction extends BaseInteraction {

    constructor(map: Map) {
        super();
        this.type = InteractionType.Normal;
        //map.getEventHandlers().clear();
        /* if (mapEventHandlerCollection.getSize()) {
            mapEventHandlerCollection.remove("PinEventHanler");
        } */
    }
}
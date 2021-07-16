import BaseInteraction from "./BaseInteraction";
import InteractionType from "../InteractionType";
import MethodNotImplemented from "../../../Exception/MethodNotImplemented";

/** NormalInteraction */
export default class NormalInteraction extends BaseInteraction {

    constructor() {
        super();
        this.type = InteractionType.Normal;
    }

    /**
     * Sets or unsets interaction active
     * @param active - activity flag
     */
     public setActive(active: boolean): void {
        throw new MethodNotImplemented();
    }

}
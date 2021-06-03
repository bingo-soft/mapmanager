import BaseInteraction from "./BaseInteraction";
import InteractionType from "../InteractionType";
import MethodNotImplemented from "../../../Exception/MethodNotImplemented";

/** @class NormalInteraction */
export default class NormalInteraction extends BaseInteraction {

    /**
     * @constructor
     * @memberof NormalInteraction
     */
    constructor() {
        super();
        this.type = InteractionType.Normal;
    }

    /**
     * Sets or unsets interaction active
     *
     * @function setActive
     * @memberof BaseInteraction
     * @param {Boolean} active - activity flag
     */
     public setActive(active: boolean): void {
        throw new MethodNotImplemented();
    }

}
import BaseInteraction from "./BaseInteraction";
import InteractionType from "../InteractionType";

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

}
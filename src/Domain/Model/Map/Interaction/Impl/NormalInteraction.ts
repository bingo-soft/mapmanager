import BaseInteraction from "./BaseInteraction"
import InteractionType from "../InteractionType"

export default class NormalInteraction extends BaseInteraction {

    constructor() {
        super();
        this.type = InteractionType.Normal;
    }
}
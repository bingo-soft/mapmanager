import { Interaction as OLInteraction} from "ol/interaction"
import OlSelect from "ol/interaction/Select"
import BaseInteraction from "./BaseInteraction"
import SelectionType from "./SelectionType"
import FeatureCollection from "../../../Feature/FeatureCollection"

export default class SelectionInteraction extends BaseInteraction {
    private interaction: OLInteraction;

    /**
     * @constructor
     * @memberof LayerBuilder
     * @param {SelectionType} type - type
     */
    constructor(type: SelectionType, callback: (feature: FeatureCollection) => void) {
        super();


        
        switch(type) {
            case SelectionType.Pin:

                break;
            default:
                break;
        }
    }
}
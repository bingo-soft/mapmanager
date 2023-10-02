/* import * as OlProj from "ol/proj";
import { ApiRequest } from "../../../../Infrastructure/Http/ApiRequest"; */
import VectorLayerFeaturesLoadQuery from "../../../../Application/Query/VectorLayerFeaturesLoadQuery"
import VectorLayerRepository from "../../../..//Infrastructure/Repository/VectorLayerRepository"


onmessage = async (e) => {
    console.log("From app", e);
    const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
    postMessage(
        await query.execute(e.data)
    );
};
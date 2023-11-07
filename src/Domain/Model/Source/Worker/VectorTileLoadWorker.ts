import VectorLayerFeaturesLoadQuery from "../../../../Application/Query/VectorLayerFeaturesLoadQuery"
import VectorLayerRepository from "../../../..//Infrastructure/Repository/VectorLayerRepository"


onmessage = async (e) => {
    const query = new VectorLayerFeaturesLoadQuery(new VectorLayerRepository());
    postMessage(
        await query.execute(e.data)
    );
};
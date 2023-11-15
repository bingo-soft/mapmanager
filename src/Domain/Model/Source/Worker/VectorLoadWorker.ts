import LayerLoadQuery from "../../../../Application/Query/LayerLoadQuery"
import LayerRepository from "../../../../Infrastructure/Repository/LayerRepository"

onmessage = async (e) => {
    const query = new LayerLoadQuery(new LayerRepository());
    postMessage(
        await query.execute(e.data)
    );
};
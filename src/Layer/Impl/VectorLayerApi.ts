import { ApiRequest } from '../../Util/Http/ApiRequest'
import { HttpMethod } from '../../Util/Http/HttpMethod'

export namespace VectorLayerApi {
    export class LoadLayer implements ApiRequest {
        method = HttpMethod.POST;
        constructor(public baseURL: string, public params: any, public headers: any) {}
    }
}
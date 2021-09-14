/** ObjectParser */
export default class ObjectParser {
    /**
    * Parses data upon template
    * @param template - template
    * @param data - data
    * @return parsed data string
    */
    public static parseTemplate(template: string, data: unknown): string {
        const reg = new RegExp(/({{\s*([a-zA-Z0-9_]+)\s*}})/g);
        const arr = [...template.matchAll(reg)];
        arr.forEach((item) => {
            const reg = new RegExp("{{\\s*(" + item[2] + ")\\s*}}", "g");
            template = template.replace(reg, data[item[2]]);
        });
        return template;
    }

    /**
     * Parses attribute value
     * @param value - value to parse
     * @return parsed value
     */
    public static parseAttributeValue(value: unknown): string {
        if (typeof value == "object") {
            if ((<any> value).id) {
                return (<any> value).id.toString();
            } else if (value[0] && (<any> value[0]).id) {
                return (<any> value[0]).id.toString();
            } else {
                return "";
            }
        }
        return value.toString();
    }
}

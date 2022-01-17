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
            template = template.replace(reg, this.parseAttributeValue(data[item[2]], "name"));
        });
        return template;
    }

    /**
     * Parses attribute value
     * @param value - value to parse
     * @return parsed value
     */
    public static parseAttributeValue(value: unknown, objectKeyToReturn: string = "id"): string {
        if (typeof value == "object") {
            objectKeyToReturn = objectKeyToReturn.toLowerCase();
            if (value[objectKeyToReturn]) {
                return value[objectKeyToReturn].toString();
            } else if (Array.isArray(value)) {
                let values = "";
                value.forEach((item: unknown): void => {
                    if (item[objectKeyToReturn]) {
                        values += item[objectKeyToReturn] + ", ";
                    }
                });
                return values.substring(0, values.length - 2);
            } else {
                return "";
            }
        }
        return value.toString();
    }
}

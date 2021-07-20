/** Parser */
export default class ObjectParser {
    /**
    * Parses data upon template
    * @param template - template
    * @param data - data
    * @return parsed data string
    */
    public static parse(template: string, data: unknown): string {
        const reg = new RegExp(/({{\s*([a-zA-Z0-9_]+)\s*}})/g);
        const arr = [...template.matchAll(reg)];
        arr.forEach((item) => {
            const reg = new RegExp("{{\\s*(" + item[2] + ")\\s*}}", "g");
            template = template.replace(reg, data[item[2]]);
        });
        return template;
    }
}
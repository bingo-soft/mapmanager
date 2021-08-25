/** StringUtil */
export default class StringUtil {

    /**
     * Adjusts text depending on the resolution - hides or divides it into substrings
     * @param text - text to adjust
     * @param resolution - resolution
     * @return adjusted text
     */
    public static adjustText(text: string, resolution: number, maxResolution: number): string {
        return resolution > maxResolution ? "" : StringUtil.divideString(text, 16, "\n");
    };

    /**
     * Divides text into substrings
     * @param text - text to divide
     * @param width - max width
     * @param spaceReplacer - space replacer
     * @return divided text
     */
    private static divideString(text: string, width: number, spaceReplacer: string): string {
        if (text.length > width) {
            let p = width;
            while (p > 0 && text[p] != " " && text[p] != "-") {
                p--;
            }
            if (p > 0) {
                let left: string;
                if (text.substring(p, p + 1) == "-") {
                    left = text.substring(0, p + 1);
                } else {
                    left = text.substring(0, p);
                }
                const right = text.substring(p + 1);
                return left.trim() + spaceReplacer + this.divideString(right.trim(), width, spaceReplacer);
            }
        }
        return text;
    }
    
}

import FillPattern from "ol-ext/style/FillPattern";
import { Fill, Icon } from "ol/style";

/** @class Pattern */
export default class Pattern { 

    /**
     * Returns data URIs containing a representation of the images of default fill patterns.
     * 
     * @function getDefaultFillPatterns
     * @static
     * @memberof Pattern
     * @return {Map} objects representing URIs of default fill patterns
     */
    public static getDefaultFillPatterns(): Map<string, string> {
        const ret: Map<string, string> = new Map<string, string>();
        ret.set("empty", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==");
        for (const i in FillPattern.prototype.patterns) {
            const p = new FillPattern({ pattern: i });
            ret.set(i, p.getImage().toDataURL());
        }
        return ret;
    }


    /**
     * Returns a data URI containing a representation of the image of pattern with specified parameters.
     * 
     * @function getPatternDataURL
     * @static
     * @memberof MapManager
     * @param {String} patternName - pattern name.
     * @param {String} fillColor - fill color.
     * @param {String} imageSrc - path to image file.
     * @param {Number} size - line size for hash/dot/circle/cross pattern.
     * @param {Number} spacing - spacing for hash/dot/circle/cross pattern.
     * @param {Number | Boolean} angle - angle for hash pattern, true for 45deg dot/circle/cross.
     * @return {String} data URI containing a representation of the image
     */
    public static getPatternDataURI(patternName: string, fillColor?: string, imageSrc?: string, size?: number, spacing?: number, angle?: number | boolean): string {
        let p: FillPattern = null;
        if (patternName == "empty") {
            p = new FillPattern({
                pattern: patternName,
                fill: new Fill({ color: fillColor })
            });
        } else {
            p = new FillPattern({
                pattern: patternName,
                image: new Icon({ src: imageSrc }),
                size: size,
                spacing: spacing,
                angle: angle
            });
        }
        return p.getImage().toDataURL();
    }

}
import OlFillPattern from "ol-ext/style/FillPattern";
import { Fill as OlFill } from "ol/style";
import CustomFillPattern from "../../Domain/Model/Style/CustomFillPattern";

/** Pattern */
export default class Pattern { 

    /**
     * Returns data URIs containing a representation of the images of default fill patterns.
     * @return objects representing URIs of default fill patterns
     */
    public static getDefaultFillPatterns(): Map<string, string> {
        const ret: Map<string, string> = new Map();
        ret.set("empty", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQYV2P4DwABAQEAWk1v8QAAAABJRU5ErkJggg==");
        for (const i in OlFillPattern.patterns) { 
            const p = new OlFillPattern({ pattern: i });
            ret.set(i, p.getImage().toDataURL());
        }
        for (const i in CustomFillPattern.getPatterns()) {
            const p = new CustomFillPattern({ pattern: i });
            ret.set(i, p.getImage().toDataURL());
        }
        return ret;
    }


    /**
     * Returns a data URI containing a representation of pattern image with specified parameters.
     * @param patternName - pattern name.
     * @param opts - pattern options.
     * @return data URI containing a representation of the image
     */
    public static getPatternDataURI(patternName: string, opts?: unknown): string | null {
        if (typeof opts === "undefined") {
            opts = {};
        }
        const options: unknown = {
            pattern_color: opts["pattern_color"] || "rgb(0, 0, 0)",
            background_color: opts["background_color"] || "rgb(255, 255, 255)", 
            pattern_stroke_width: opts["pattern_stroke_width"] || 1,
            pattern_stroke_spacing: opts["pattern_stroke_spacing"] || 0,
            pattern_stroke_rotation: opts["pattern_stroke_rotation"] || 0,
            pattern_offset: opts["pattern_offset"] || 0,
            pattern_scale: opts["pattern_scale"] || 0
        };
        let p: OlFillPattern = null;
        if (patternName == "empty") {
            p = new OlFillPattern({
                pattern: patternName,
                fill: new OlFill({ color: options["background_color"] })
            });
        } else if (patternName == "hatch_dash_dot" || patternName == "image") {
            p = new CustomFillPattern({
                pattern: patternName,
                size: opts["pattern_stroke_width"] || 1,
                color: opts["pattern_color"] || "rgb(255, 255, 255)",
                fill: new OlFill({ color: options["background_color"] }),
                imageFile: opts["pattern_image_file"] || null
            });
        } else {
            p = new OlFillPattern({
                pattern: patternName,
                //image: new OlIcon({ src: options["image_src"] }),
                size: options["pattern_stroke_width"],
                color: options["pattern_color"],
                offset: options["pattern_offset"],
                scale: options["pattern_scale"],
                fill: new OlFill({ color: options["background_color"] }),
                spacing: options["pattern_stroke_spacing"],
                angle: options["pattern_stroke_rotation"]
            });
        }
        return p.getImage().toDataURL();
    }

}
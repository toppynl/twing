import {createMarkup, TwingMarkup} from "../../../markup";
import {TwingTemplate} from "../../../template";

export const escape = (
    template: TwingTemplate,
    value: string | TwingMarkup | null,
    strategy: string | null,
    charset: string | null
): Promise<string | boolean | TwingMarkup | null> => {
    const {runtime} = template;
    
    return runtime.escape(template, value, strategy || true, charset)
        .then((value) => {
            if (typeof value === "string") {
                return createMarkup(value);
            }
            
            return value;
        });
};

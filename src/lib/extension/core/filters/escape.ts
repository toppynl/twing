import {createMarkup, TwingMarkup} from "../../../markup";
import {TwingTemplate} from "../../../template";

export const escape = (
    template: TwingTemplate,
    value: string | TwingMarkup | null,
    strategy: string | null,
    charset: string | null
): Promise<string | boolean | TwingMarkup | null> => {
    if (strategy === null) {
        strategy = "html";
    }
    
    return template.escape(template, value, strategy, charset)
        .then((value) => {
            if (typeof value === "string") {
                return createMarkup(value, template.charset);
            }
            
            return value;
        });
};

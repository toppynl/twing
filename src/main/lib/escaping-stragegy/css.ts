import type {TwingEscapingStrategyHandler} from "../escaping-strategy";
import phpSprintf from "locutus/php/strings/sprintf";

export const createCssEscapingStrategyHandler = (): TwingEscapingStrategyHandler => {
    return (value) => {
        value = value.replace(/[^a-zA-Z0-9]/ug, (character: string) => {
            const codePoint = character.codePointAt(0)!;
            
            return phpSprintf('\\u%04X', codePoint);
        });

        return value;
    }
};

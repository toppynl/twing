import type {TwingEscapingStrategyHandler} from "../escaping-strategy";

const htmlspecialchars: (value: string) => string = require('htmlspecialchars');

export const createHtmlEscapingStrategyHandler = (): TwingEscapingStrategyHandler => {
    return (value) => {
        return htmlspecialchars(value);
    }
};

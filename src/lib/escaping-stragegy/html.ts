import type {EscapingStrategyHandler} from "../escaping-strategy";

const htmlspecialchars: (value: string) => string = require('htmlspecialchars');

export const createHtmlEscapingStrategyHandler = (): EscapingStrategyHandler => {
    return (value) => {
        return htmlspecialchars(value);
    }
};

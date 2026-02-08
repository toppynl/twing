import type {TwingEscapingStrategyHandler} from "../escaping-strategy";
import {htmlspecialchars} from "locutus/php/strings";

export const createHtmlEscapingStrategyHandler = (): TwingEscapingStrategyHandler => {
    return (value) => {
        return htmlspecialchars(value);
    }
};

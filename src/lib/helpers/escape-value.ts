import {isAMarkup, TwingMarkup} from "../markup";
import {TwingEnvironment} from "../environment";
import {TwingEscapingStrategy} from "../escaping-strategy";
import {TwingTemplate} from "../template";

export const escapeValue = (
    template: TwingTemplate,
    environment: TwingEnvironment,
    value: string | boolean | TwingMarkup | null | undefined,
    strategy: TwingEscapingStrategy | string,
    charset: string | null
): Promise<string | boolean | TwingMarkup> => {
    if (typeof value === "boolean") {
        return Promise.resolve(value);
    }

    if (isAMarkup(value)) {
        return Promise.resolve(value);
    }

    let result: string;

    if ((value === null) || (value === undefined)) {
        result = '';
    }
    else {
        const strategyHandler = environment.escapingStrategyHandlers[strategy];

        if (strategyHandler === undefined) {
            return Promise.reject(new Error(`Invalid escaping strategy "${strategy}" (valid ones: ${Object.keys(environment.escapingStrategyHandlers).sort().join(', ')}).`));
        }

        result = strategyHandler(value.toString(), charset || environment.charset, template.name);
    }

    return Promise.resolve(result);
}

import {TwingEscapingStrategyHandler} from "../escaping-strategy";

import phpRawurlencode from "locutus/php/url/rawurlencode";

export const createUrlEscapingStrategyHandler = (): TwingEscapingStrategyHandler => {
    return phpRawurlencode;
};

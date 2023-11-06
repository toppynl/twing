import {createParser as _createParser, TwingParserOptions} from "../../../src/lib/parser";
import {createMockedEnvironment} from "../../mock/environment";
import {TwingExtensionCore} from "../../../src/lib/extension/core";
import {TwingExtensionSet} from "../../../src/lib/extension-set";
import {TwingTagHandler} from "../../../src/lib/tag-handler";

const extensionSet = new TwingExtensionSet();

extensionSet.addExtension(new TwingExtensionCore(createMockedEnvironment()), 'core');

export const createParser = (
    definition?: {
        tagHandlers?: Array<TwingTagHandler>;
    },
    options?: TwingParserOptions
) => {
    return _createParser(
        extensionSet.getUnaryOperators(),
        extensionSet.getBinaryOperators(),
        definition?.tagHandlers ?? extensionSet.getTokenParsers(),
        extensionSet.getNodeVisitors(),
        extensionSet.getFilters(),
        extensionSet.getFunctions(),
        extensionSet.getTests(),
        options
    );
};

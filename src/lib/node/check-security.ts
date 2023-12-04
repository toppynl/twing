import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode, TwingNode} from "../node";
import {
    isASandboxSecurityNotAllowedFilterError,
    TwingSandboxSecurityNotAllowedFilterError
} from "../sandbox/security-not-allowed-filter-error";
import {
    isASandboxSecurityNotAllowedTagError,
    TwingSandboxSecurityNotAllowedTagError
} from "../sandbox/security-not-allowed-tag-error";
import {TwingSandboxSecurityNotAllowedFunctionError} from "../sandbox/security-not-allowed-function-error";

export type CheckSecurityNodeAttributes = TwingBaseNodeAttributes & {
    usedFilters: Map<string, TwingNode | string>;
    usedTags: Map<string, TwingNode | string>;
    usedFunctions: Map<string, TwingNode | string>;
};

export interface TwingCheckSecurityNode extends TwingBaseNode<"check_security", CheckSecurityNodeAttributes> {
}

export const createCheckSecurityNode = (
    usedFilters: Map<string, TwingNode>,
    usedTags: Map<string, TwingNode>,
    usedFunctions: Map<string, TwingNode>,
    line: number,
    column: number
): TwingCheckSecurityNode => {
    const baseNode = createBaseNode("check_security", {
        usedFilters,
        usedTags,
        usedFunctions
    }, {}, line, column);

    return {
        ...baseNode,
        execute: (executionContext) => {
            const {template, sandboxed} = executionContext;
            const {usedTags, usedFunctions, usedFilters} = baseNode.attributes;

            try {
                sandboxed && template.checkSecurity(
                    [...usedTags.keys()],
                    [...usedFilters.keys()],
                    [...usedFunctions.keys()]
                );
            } catch (error: any) {
                const supplementError = (error: TwingSandboxSecurityNotAllowedFilterError | TwingSandboxSecurityNotAllowedFunctionError | TwingSandboxSecurityNotAllowedTagError) => {
                    error.source = template.name;

                    if (isASandboxSecurityNotAllowedTagError(error)) {
                        error.location = usedTags.get(error.tagName);
                    } else if (isASandboxSecurityNotAllowedFilterError(error)) {
                        error.location = usedFilters.get(error.filterName)
                    } else {
                        error.location = usedFunctions.get(error.functionName);
                    }
                }

                supplementError(error);

                throw error;
            }

            return Promise.resolve();
        }
    }
};

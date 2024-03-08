import {TwingNodeExecutor} from "../node-executor";
import {TwingCheckSecurityNode} from "../node/check-security";
import {
    isASandboxSecurityNotAllowedFilterError,
    TwingSandboxSecurityNotAllowedFilterError
} from "../sandbox/security-not-allowed-filter-error";
import {TwingSandboxSecurityNotAllowedFunctionError} from "../sandbox/security-not-allowed-function-error";
import {
    isASandboxSecurityNotAllowedTagError,
    TwingSandboxSecurityNotAllowedTagError
} from "../sandbox/security-not-allowed-tag-error";

export const executeCheckSecurityNode: TwingNodeExecutor<TwingCheckSecurityNode> = (node, executionContext) => {
    const {template, sandboxed} = executionContext;
    const {usedTags, usedFunctions, usedFilters} = node.attributes;

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
};

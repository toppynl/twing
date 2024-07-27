import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingCheckSecurityNode} from "../node/check-security";
import type {TwingNode} from "../node";
import {createRuntimeError} from "../error/runtime";

export const executeCheckSecurityNode: TwingNodeExecutor<TwingCheckSecurityNode> = (node, executionContext) => {
    const {template, environment, sandboxed} = executionContext;
    const {usedTags, usedFunctions, usedFilters} = node.attributes;

    if (sandboxed) {
        const issue = environment.sandboxPolicy.checkSecurity(
            [...usedTags.keys()],
            [...usedFilters.keys()],
            [...usedFunctions.keys()]
        );

        if (issue !== null) {
            const {type, token} = issue;

            let node: TwingNode;

            if (type === "tag") {
                node = usedTags.get(token)!;
            } else if (type === "filter") {
                node = usedFilters.get(token)!
            } else {
                node = usedFunctions.get(token)!;
            }

            throw createRuntimeError(issue.message, node, template.source);
        }
    }

    return Promise.resolve();
};

export const executeCheckSecurityNodeSynchronously: TwingSynchronousNodeExecutor<TwingCheckSecurityNode> = (node, executionContext) => {
    const {template, environment, sandboxed} = executionContext;
    const {usedTags, usedFunctions, usedFilters} = node.attributes;

    if (sandboxed) {
        const issue = environment.sandboxPolicy.checkSecurity(
            [...usedTags.keys()],
            [...usedFilters.keys()],
            [...usedFunctions.keys()]
        );

        if (issue !== null) {
            const {type, token} = issue;

            let node: TwingNode;

            if (type === "tag") {
                node = usedTags.get(token)!;
            } else if (type === "filter") {
                node = usedFilters.get(token)!
            } else {
                node = usedFunctions.get(token)!;
            }

            throw createRuntimeError(issue.message, node, template.source);
        }
    }
};

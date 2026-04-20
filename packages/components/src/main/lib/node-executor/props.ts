import type {TwingExecutionContext, TwingNodeExecutor, TwingSynchronousExecutionContext, TwingSynchronousNodeExecutor} from "twing";
import {createRuntimeError} from "twing";
import type {PropsNode} from "../node/props";
import {ComponentAttributes} from "../component-attributes";

const isComponentAttributes = (value: unknown): value is ComponentAttributes => {
    return value instanceof ComponentAttributes;
};

const getAttributesKeys = (value: unknown): Array<string> => {
    if (isComponentAttributes(value)) {
        return Object.keys(value.all());
    }

    return [];
};

export const executePropsNode: TwingNodeExecutor<PropsNode> = async (node, executionContext: TwingExecutionContext) => {
    const {context, nodeExecutor: execute, template} = executionContext;
    const {names} = node.attributes;
    const defaults = node.children;

    const existingAttributes = context.get("attributes");

    if (isComponentAttributes(existingAttributes)) {
        context.set("attributes", existingAttributes.without(...names) as any);
    }

    for (const name of names) {
        const hasDefault = Object.prototype.hasOwnProperty.call(defaults, name);
        const isDefined = context.has(name) && context.get(name) !== undefined;

        if (!isDefined) {
            if (!hasDefault) {
                throw createRuntimeError(
                    `${name} should be defined for component ${template.name}.`,
                    node,
                    template.source
                );
            }

            const value = await execute(defaults[name], executionContext);

            context.set(name, value);
        }
    }

    const remaining = context.get("attributes");
    const remainingKeys = getAttributesKeys(remaining);

    for (const key of remainingKeys) {
        context.delete(key as any);
    }
};

export const executePropsNodeSynchronously: TwingSynchronousNodeExecutor<PropsNode> = (node, executionContext: TwingSynchronousExecutionContext) => {
    const {context, nodeExecutor: execute, template} = executionContext;
    const {names} = node.attributes;
    const defaults = node.children;

    const existingAttributes = context.get("attributes");

    if (isComponentAttributes(existingAttributes)) {
        context.set("attributes", existingAttributes.without(...names) as any);
    }

    for (const name of names) {
        const hasDefault = Object.prototype.hasOwnProperty.call(defaults, name);
        const isDefined = context.has(name) && context.get(name) !== undefined;

        if (!isDefined) {
            if (!hasDefault) {
                throw createRuntimeError(
                    `${name} should be defined for component ${template.name}.`,
                    node,
                    template.source
                );
            }

            const value = execute(defaults[name], executionContext);

            context.set(name, value);
        }
    }

    const remaining = context.get("attributes");
    const remainingKeys = getAttributesKeys(remaining);

    for (const key of remainingKeys) {
        context.delete(key as any);
    }
};

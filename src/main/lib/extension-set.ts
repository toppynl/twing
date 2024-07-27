import {TwingTagHandler} from "./tag-handler";
import {TwingNodeVisitor} from "./node-visitor";
import {TwingOperator} from "./operator";
import type {TwingExtension, TwingSynchronousExtension} from "./extension";

export interface TwingExtensionSet<Extension extends TwingExtension | TwingSynchronousExtension> {
    readonly binaryOperators: Array<TwingOperator>;
    readonly filters: Map<string, Extension["filters"][number]>;
    readonly functions: Map<string, Extension["functions"][number]>;
    readonly nodeVisitors: Array<TwingNodeVisitor>;
    readonly tagHandlers: Array<TwingTagHandler>;
    readonly tests: Map<string, Extension["tests"][number]>;
    readonly unaryOperators: Array<TwingOperator>;

    addExtension(extension: Extension): void;

    addFilter(filter: Extension["filters"][number]): void;

    addFunction(twingFunction: Extension["functions"][number]): void;

    addNodeVisitor(visitor: TwingNodeVisitor): void;

    addOperator(operator: TwingOperator): void;
    
    addTagHandler(tagHandler: TwingTagHandler): void;

    addTest(test: Extension["tests"][number]): void;
}

export const createExtensionSet = <Extension extends TwingExtension | TwingSynchronousExtension> (): TwingExtensionSet<Extension> => {
    const binaryOperators: Array<TwingOperator> = [];
    const filters: Map<string, Extension["filters"][number]> = new Map();
    const functions: Map<string, Extension["functions"][number]> = new Map();
    const nodeVisitors: Array<TwingNodeVisitor> = [];
    const tagHandlers: Array<TwingTagHandler> = [];
    const tests: Map<string, Extension["tests"][number]> = new Map();
    const unaryOperators: Array<TwingOperator> = [];

    const extensionSet: TwingExtensionSet<Extension> = {
        get binaryOperators() {
            return binaryOperators;
        },
        get filters() {
            return filters;
        },
        get functions() {
            return functions;
        },
        get nodeVisitors() {
            return nodeVisitors;
        },
        get tagHandlers() {
            return tagHandlers;
        },
        get tests() {
            return tests;
        },
        get unaryOperators() {
            return unaryOperators
        },
        addExtension: (extension) => {
            // filters
            for (const filter of extension.filters) {
                extensionSet.addFilter(filter);
            }

            // functions
            for (const function_ of extension.functions) {
                extensionSet.addFunction(function_);
            }

            // tests
            for (const test of extension.tests) {
                extensionSet.addTest(test);
            }

            // operators
            for (const operator of extension.operators) {
                extensionSet.addOperator(operator);
            }

            // tag handlers
            for (const tagHandler of extension.tagHandlers) {
                extensionSet.addTagHandler(tagHandler);
            }

            // node visitors
            for (const nodeVisitor of extension.nodeVisitors) {
                extensionSet.addNodeVisitor(nodeVisitor);
            }
        },
        addFilter: (filter) => {
            filters.set(filter.name, filter);
        },
        addFunction: (twingFunction) => {
            functions.set(twingFunction.name, twingFunction);
        },
        addNodeVisitor: (nodeVisitor) => {
            nodeVisitors.push(nodeVisitor);
        },
        addOperator: (operator) => {
            let bucket: Array<TwingOperator>;

            if (operator.type === "UNARY") {
                bucket = unaryOperators;
            } else {
                bucket = binaryOperators;
            }

            bucket.push(operator);
        },
        addTagHandler: (tagHandler) => {
            tagHandlers.push(tagHandler);
        },
        addTest: (test) => {
            tests.set(test.name, test);
        }
    };

    return extensionSet;
};

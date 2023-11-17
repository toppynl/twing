import {TwingTagHandler} from "./tag-handler";
import {TwingFilter} from "./filter";
import {TwingFunction} from "./function";
import {TwingNodeVisitor} from "./node-visitor";
import {TwingTest} from "./test";
import {TwingOperator} from "./operator";
import type {TwingExtension} from "./extension";

export interface TwingExtensionSet {
    readonly binaryOperators: Map<string, TwingOperator>;
    readonly filters: Map<string, TwingFilter>;
    readonly functions: Map<string, TwingFunction>;
    readonly nodeVisitors: Array<TwingNodeVisitor>;
    readonly tagHandlers: Array<TwingTagHandler>;
    readonly tests: Map<string, TwingTest>;
    readonly unaryOperators: Map<string, TwingOperator>;

    addExtension(extension: TwingExtension): void;

    addFilter(filter: TwingFilter): void;

    addFunction(twingFunction: TwingFunction): void;

    addNodeVisitor(visitor: TwingNodeVisitor): void;

    addOperator(operator: TwingOperator): void;
    
    addTagHandler(tagHandler: TwingTagHandler): void;

    addTest(test: TwingTest): void;
}

export const createExtensionSet = (): TwingExtensionSet => {
    const binaryOperators: Map<string, TwingOperator> = new Map();
    const filters: Map<string, TwingFilter> = new Map();
    const functions: Map<string, TwingFunction> = new Map();
    const nodeVisitors: Array<TwingNodeVisitor> = [];
    const tagHandlers: Array<TwingTagHandler> = [];
    const tests: Map<string, TwingTest> = new Map();
    const unaryOperators: Map<string, TwingOperator> = new Map();

    const extensionSet: TwingExtensionSet = {
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
            let bucket: Map<string, TwingOperator>;

            if (operator.type === "UNARY") {
                bucket = unaryOperators;
            } else {
                bucket = binaryOperators;
            }

            bucket.set(operator.name, operator);
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

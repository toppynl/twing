import {TwingTagHandler} from "./tag-handler";
import {TwingFilter} from "./filter";
import {TwingFunction} from "./function";
import {TwingNodeVisitor} from "./node-visitor";
import {TwingExtensionInterface} from "./extension-interface";
import {TwingTest} from "./test";
import {TwingOperator} from "./operator";
import {TwingSourceMapNodeFactory} from "./source-map/node-factory";
import {getFunction} from "./helpers/get-function";
import {getFilter} from "./helpers/get-filter";
import {getTest} from "./helpers/get-test";

export class TwingExtensionSet {
    private visitors: TwingNodeVisitor[] = [];
    private filters: Map<string, TwingFilter> = new Map();
    private tests: Map<string, TwingTest> = new Map();
    private functions: Map<string, TwingFunction> = new Map();
    private unaryOperators: Map<string, TwingOperator> = new Map();
    private binaryOperators: Map<string, TwingOperator> = new Map();
    private tagHandlers: Map<string, TwingTagHandler> = new Map();
    private sourceMapNodeFactories: Map<string, TwingSourceMapNodeFactory> = new Map();

    readonly extensions: Map<string, TwingExtensionInterface>;

    constructor() {
        this.extensions = new Map();
    }

    hasExtension(name: string) {
        return this.extensions.has(name);
    }

    getExtension(name: string) {
        return this.extensions.get(name);
    }

    /**
     * Registers somes extensions.
     *
     * @param {Map<string, TwingExtensionInterface>} extensions
     */
    addExtensions(extensions: Map<string, TwingExtensionInterface>) {
        for (let [name, extension] of extensions) {
            this.addExtension(extension, name);
        }
    }

    /**
     * Returns all registered extensions.
     *
     * @return Map<string, TwingExtensionInterface>
     */
    getExtensions() {
        return this.extensions;
    }

    getSignature() {
        return JSON.stringify([...this.extensions.keys()]);
    }

    getNodeVisitors(): TwingNodeVisitor[] {
        return this.visitors;
    }

    getTokenParsers(): TwingTagHandler[] {
        return [...this.tagHandlers.values()];
    }

    addTagHandler(tagHandler: TwingTagHandler) {
        this.tagHandlers.set(tagHandler.tag, tagHandler);
    }

    /**
     * Gets the registered unary Operators.
     *
     * @return Map<string, Operator> A map of unary operator definitions
     */
    getUnaryOperators(): Map<string, TwingOperator> {
        return this.unaryOperators;
    }

    /**
     * Gets the registered binary Operators.
     *
     * @return Map<string, Operator> A map of binary operators
     */
    getBinaryOperators(): Map<string, TwingOperator> {
        return this.binaryOperators;
    }

    addFunction(twingFunction: TwingFunction) {
        this.functions.set(twingFunction.name, twingFunction);
    }

    getFunctions() {
        return this.functions;
    }
    
    getFunction(name: string): TwingFunction | null {
        return getFunction(this.functions, name);
    }

    addFilter(filter: TwingFilter) {
        this.filters.set(filter.name, filter);
    }

    getFilters(): Map<string, TwingFilter> {
        return this.filters;
    }

    /**
     * Get a filter by name.
     *
     * @param {string} name The filter name
     *
     * @return {TwingFilter|false} A TwingFilter instance or false if the filter does not exist
     */
    getFilter(name: string): TwingFilter | null {
        return getFilter(this.filters, name);
    }

    addNodeVisitor(visitor: TwingNodeVisitor) {
        this.visitors.push(visitor);
    }

    addTest(test: TwingTest) {
        this.tests.set(test.name, test);
    }

    /**
     *
     * @returns {Map<string, TwingTest>}
     */
    getTests() {
        return this.tests;
    }

    /**
     * Gets a test by name.
     *
     * @param {string} name The test name
     * @returns {TwingTest} A MyTest instance or null if the test does not exist
     */
    getTest(name: string): TwingTest | null {
        return getTest(this.tests, name);
    }

    addOperator(operator: TwingOperator) {
        let bucket: Map<string, TwingOperator>;

        if (operator.type === "UNARY") {
            bucket = this.unaryOperators;
        } else {
            bucket = this.binaryOperators;
        }

        if (bucket.has(operator.name)) {
            throw new Error(`Operator "${operator.name}" is already registered.`);
        }

        bucket.set(operator.name, operator);
    }

    addSourceMapNodeFactory(factory: TwingSourceMapNodeFactory) {
        if (this.sourceMapNodeFactories.has(factory.nodeName)) {
            throw new Error(`Source-map node factory "${factory.nodeName}" is already registered.`);
        }

        this.sourceMapNodeFactories.set(factory.nodeName, factory);
    }

    getSourceMapNodeFactories(): Map<string, TwingSourceMapNodeFactory> {
        return this.sourceMapNodeFactories;
    }

    /**
     * @param nodeType
     *
     * @return TwingSourceMapNodeFactory | null
     */
    getSourceMapNodeFactory(nodeType: string) {
        return this.sourceMapNodeFactories.has(nodeType) ? this.sourceMapNodeFactories.get(nodeType) : null;
    }

    addExtension(extension: TwingExtensionInterface, name: string) {
        if (this.extensions.has(name)) {
            throw new Error(`Unable to register extension "${name}" as it is already registered.`);
        }

        this.extensions.set(name, extension);

        // filters
        for (let filter of extension.getFilters()) {
            this.addFilter(filter);
        }

        // functions
        for (let function_ of extension.getFunctions()) {
            this.addFunction(function_);
        }

        // tests
        for (let test of extension.getTests()) {
            this.addTest(test);
        }

        // operators
        for (let operator of extension.getOperators()) {
            this.addOperator(operator);
        }

        // token parsers
        for (let parser of extension.getTokenParsers()) {
            this.addTagHandler(parser);
        }

        // node visitors
        for (let visitor of extension.getNodeVisitors()) {
            this.addNodeVisitor(visitor);
        }

        // source-map node constructors
        let constructors = extension.getSourceMapNodeFactories();

        for (let constructor of constructors) {
            this.addSourceMapNodeFactory(constructor);
        }
    }
}

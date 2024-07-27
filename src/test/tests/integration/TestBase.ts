import * as tape from 'tape';
import {SinonStub, stub} from 'sinon';
import {
    createEnvironment,
    createSynchronousEnvironment,
    TwingEnvironmentOptions,
    TwingSynchronousEnvironmentOptions
} from "../../../main/lib/environment";
import {createPrintNode} from "../../../main/lib/node/print";
import {createConstantNode} from "../../../main/lib/node/expression/constant";
import {TwingExtension, TwingSynchronousExtension} from "../../../main/lib/extension";
import {createFilter, createSynchronousFilter} from "../../../main/lib/filter";
import {createFunction, createSynchronousFunction} from "../../../main/lib/function";
import {createSynchronousTest, createTest} from "../../../main/lib/test";
import {createSandboxSecurityPolicy} from "../../../main/lib/sandbox/security-policy";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../main/lib/loader/array";
import {escape, escapeSynchronously} from "../../../main/lib/extension/core/filters/escape";
import {IntegrationTest} from "./test";
import {TwingTagHandler} from "../../../main/lib/tag-handler";
import {MappingItem, RawSourceMap, SourceMapConsumer} from "source-map";
import {TwingLoader, TwingSynchronousLoader} from "../../../main/lib/loader";
import {Settings} from "luxon";
import type {TwingExecutionContext, TwingSynchronousExecutionContext} from "../../../main/lib/execution-context";

const createSectionTokenParser = (): TwingTagHandler => {
    return {
        tag: '§',
        initialize: () => {
            return (_token, stream) => {
                stream.expect("TAG_END");

                return createPrintNode(createConstantNode('§', -1, -1), -1, -1);
            };
        }
    };
};

class TwingTestExtension implements TwingExtension {
    static staticCall(_executionContext: TwingExecutionContext, value: string) {
        return Promise.resolve(`*${value}*`);
    }

    static __callStatic(method: string, ...arguments_: any[]) {
        if (method !== 'magicStaticCall') {
            throw new Error('Unexpected call to __callStatic');
        }

        return Promise.resolve('static_magic_' + arguments_[0]);
    }

    get nodeVisitors() {
        return [];
    }

    get operators() {
        return [];
    }

    get sourceMapNodeFactories() {
        return [];
    }

    get tagHandlers() {
        return [
            createSectionTokenParser()
        ];
    }

    get filters() {
        return [
            createFilter('escape_and_nl2br', escape_and_nl2br, []),
            // name this filter "nl2br_" to allow the core "nl2br" filter to be tested
            createFilter('nl2br_', nl2br, [{
                name: 'separator'
            }]),
            createFilter('§', this.sectionFilter, []),
            createFilter('escape_something', escape_something, []),
            createFilter('preserves_safety', preserves_safety, []),
            createFilter('static_call_string', TwingTestExtension.staticCall, []),
            createFilter('static_call_array', TwingTestExtension.staticCall, []),
            createFilter('magic_call_string', function () {
                return TwingTestExtension.__callStatic('magicStaticCall', arguments);
            }, []),
            createFilter('magic_call_array', function () {
                return TwingTestExtension.__callStatic('magicStaticCall', arguments);
            }, []),
            createFilter('*_path', dynamic_path, []),
            createFilter('*_foo_*_bar', dynamic_foo, []),
            createFilter('anon_foo', (_executionContext: TwingExecutionContext, name: string) => {
                return Promise.resolve('*' + name + '*');
            }, []),
        ];
    }

    get functions() {
        return [
            createFunction('§', this.sectionFunction, [{
                name: 'value'
            }]),
            createFunction('safe_br', this.br, []),
            createFunction('unsafe_br', this.br, []),
            createFunction('static_call_string', TwingTestExtension.staticCall, [{
                name: 'value'
            }]),
            createFunction('static_call_array', TwingTestExtension.staticCall, [{
                name: 'value'
            }]),
            createFunction('*_path', dynamic_path, [{
                name: 'item'
            }]),
            createFunction('*_foo_*_bar', dynamic_foo, [{
                name: 'item'
            }]),
            createFunction('anon_foo', (_executionContext: TwingExecutionContext, name: string) => {
                return Promise.resolve('*' + name + '*');
            }, [{
                name: 'name'
            }]),
            createFunction('createObject', (_executionContext: TwingExecutionContext, attributes: Map<string, any>) => {
                const object: {
                    [p: string]: any
                } = {};

                for (let [key, value] of attributes) {
                    object[key] = value;
                }

                return Promise.resolve(object);
            }, [{
                name: 'attributes'
            }])
        ];
    }

    get tests() {
        return [
            createTest('multi word', this.is_multi_word, []),
            createTest('test_*', this.dynamic_test, [])
        ];
    }

    sectionFilter(_executionContext: TwingExecutionContext, value: string) {
        return Promise.resolve(`§${value}§`);
    }

    sectionFunction(_executionContext: TwingExecutionContext, value: string) {
        return Promise.resolve(`§${value}§`);
    }

    br() {
        return Promise.resolve('<br />');
    }

    is_multi_word(_executionContext: TwingExecutionContext, value: string) {
        return Promise.resolve(value.indexOf(' ') > -1);
    }

    dynamic_test(_executionContext: TwingExecutionContext, element: any, item: any) {
        return Promise.resolve(element === item);
    }
}

class TwingSynchronousTestExtension implements TwingSynchronousExtension {
    static staticCall(_executionContext: TwingSynchronousExecutionContext, value: string) {
        return `*${value}*`;
    }

    static __callStatic(method: string, ...arguments_: any[]) {
        if (method !== 'magicStaticCall') {
            throw new Error('Unexpected call to __callStatic');
        }

        return 'static_magic_' + arguments_[0];
    }

    get nodeVisitors() {
        return [];
    }

    get operators() {
        return [];
    }

    get sourceMapNodeFactories() {
        return [];
    }

    get tagHandlers() {
        return [
            createSectionTokenParser()
        ];
    }

    get filters() {
        return [
            createSynchronousFilter('escape_and_nl2br', synchronous_escape_and_nl2br, []),
            // name this filter "nl2br_" to allow the core "nl2br" filter to be tested
            createSynchronousFilter('nl2br_', synchronous_nl2br, [{
                name: 'separator'
            }]),
            createSynchronousFilter('§', this.sectionFilter, []),
            createSynchronousFilter('escape_something', synchronous_escape_something, []),
            createSynchronousFilter('preserves_safety', synchronous_preserves_safety, []),
            createSynchronousFilter('static_call_string', TwingSynchronousTestExtension.staticCall, []),
            createSynchronousFilter('static_call_array', TwingSynchronousTestExtension.staticCall, []),
            createSynchronousFilter('magic_call_string', function () {
                return TwingTestExtension.__callStatic('magicStaticCall', arguments);
            }, []),
            createSynchronousFilter('magic_call_array', function () {
                return TwingTestExtension.__callStatic('magicStaticCall', arguments);
            }, []),
            createSynchronousFilter('*_path', synchronous_dynamic_path, []),
            createSynchronousFilter('*_foo_*_bar', synchronous_dynamic_foo, []),
            createSynchronousFilter('anon_foo', (_executionContext: TwingSynchronousExecutionContext, name: string) => {
                return '*' + name + '*';
            }, []),
        ];
    }

    get functions() {
        return [
            createSynchronousFunction('§', this.sectionFunction, [{
                name: 'value'
            }]),
            createSynchronousFunction('safe_br', this.br, []),
            createSynchronousFunction('unsafe_br', this.br, []),
            createSynchronousFunction('static_call_string', TwingSynchronousTestExtension.staticCall, [{
                name: 'value'
            }]),
            createSynchronousFunction('static_call_array', TwingSynchronousTestExtension.staticCall, [{
                name: 'value'
            }]),
            createSynchronousFunction('*_path', synchronous_dynamic_path, [{
                name: 'item'
            }]),
            createSynchronousFunction('*_foo_*_bar', synchronous_dynamic_foo, [{
                name: 'item'
            }]),
            createSynchronousFunction('anon_foo', (_executionContext: TwingSynchronousExecutionContext, name: string) => {
                return '*' + name + '*';
            }, [{
                name: 'name'
            }]),
            createSynchronousFunction('createObject', (_executionContext: TwingSynchronousExecutionContext, attributes: Map<string, any>) => {
                const object: {
                    [p: string]: any
                } = {};

                for (let [key, value] of attributes) {
                    object[key] = value;
                }

                return Promise.resolve(object);
            }, [{
                name: 'attributes'
            }])
        ];
    }

    get tests() {
        return [
            createSynchronousTest('multi word', this.is_multi_word, []),
            createSynchronousTest('test_*', this.dynamic_test, [])
        ];
    }

    sectionFilter(_executionContext: TwingSynchronousExecutionContext, value: string) {
        return `§${value}§`;
    }

    sectionFunction(_executionContext: TwingSynchronousExecutionContext, value: string) {
        return `§${value}§`;
    }

    br() {
        return '<br />';
    }

    is_multi_word(_executionContext: TwingSynchronousExecutionContext, value: string) {
        return value.indexOf(' ') > -1;
    }

    dynamic_test(_executionContext: TwingSynchronousExecutionContext, element: any, item: any) {
        return element === item;
    }
}

export default abstract class {
    getSandboxSecurityPolicyFilters(): string[] {
        return [];
    }

    getSandboxSecurityPolicyFunctions(): string[] {
        return [];
    }

    getSandboxSecurityPolicyTags(): string[] {
        return [];
    }

    getDescription(): string {
        return '<no description provided>';
    }

    getTemplates(): {
        [k: string]: string
    } {
        return {};
    }

    getExpected(): string {
        return '';
    }

    getGlobals(): {
        [k: string]: string
    } {
        return {};
    }

    getContext(): any {
        return {};
    }

    getSynchronousContext(): Record<string, any> | null {
        return null;
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {};
    }

    getSynchronousEnvironmentOptions(): TwingSynchronousEnvironmentOptions {
        return {};
    }

    getExpectedErrorMessage(): string | null {
        return null;
    }

    getExpectedDeprecationMessages(): string[] | null {
        return null;
    }

    getStrict(): boolean {
        return true;
    }
}

/**
 * nl2br which also escapes, for testing escaper filters.
 */
function escape_and_nl2br(executionContext: TwingExecutionContext, value: string, sep = '<br />') {
    return escape(executionContext, value, 'html').then((result) => {
        return nl2br(executionContext, result?.toString() || '', sep);
    });
}

function synchronous_escape_and_nl2br(executionContext: TwingSynchronousExecutionContext, value: string, sep = '<br />') {
    const result = escapeSynchronously(executionContext, value, 'html');

    return synchronous_nl2br(executionContext, result?.toString() || '', sep);
}

/**
 * nl2br only, for testing filters with pre_escape.
 */
function nl2br(_executionContext: TwingExecutionContext, value: string, sep = '<br />') {
    return Promise.resolve(value.replace('\n', `${sep}\n`));
}

function synchronous_nl2br(_executionContext: TwingSynchronousExecutionContext, value: string, sep = '<br />') {
    return value.replace('\n', `${sep}\n`);
}

function escape_something(_executionContext: TwingExecutionContext, value: string) {
    return Promise.resolve(value.toUpperCase());
}

function synchronous_escape_something(_executionContext: TwingSynchronousExecutionContext, value: string) {
    return value.toUpperCase();
}

function preserves_safety(_executionContext: TwingExecutionContext, value: string) {
    return Promise.resolve(value.toUpperCase());
}

function synchronous_preserves_safety(_executionContext: TwingSynchronousExecutionContext, value: string) {
    return value.toUpperCase();
}

function dynamic_path(_executionContext: TwingExecutionContext, element: string, item: string) {
    return Promise.resolve(element + '/' + item);
}

function synchronous_dynamic_path(_executionContext: TwingSynchronousExecutionContext, element: string, item: string) {
    return element + '/' + item;
}

function dynamic_foo(_executionContext: TwingExecutionContext, foo: string, bar: string, item: string) {
    return Promise.resolve(foo + '/' + bar + '/' + item);
}

function synchronous_dynamic_foo(_executionContext: TwingSynchronousExecutionContext, foo: string, bar: string, item: string) {
    return foo + '/' + bar + '/' + item;
}

const isATestWithALoader = (test: IntegrationTest): test is IntegrationTest & {
    loader: TwingLoader;
    synchronousLoader: TwingSynchronousLoader;
} => {
    return (test as any).templates === undefined;
};

export const runTest = async (
    integrationTest: IntegrationTest
) => {
    Settings.defaultZoneName = "Europe/Paris";

    let {
        additionalFilters,
        additionalSynchronousFilters,
        additionalFunctions,
        additionalSynchronousFunctions,
        additionalNodeVisitors,
        additionalTests,
        additionalSynchronousTests,
        description,
        context,
        synchronousContext,
        environmentOptions,
        synchronousEnvironmentOptions,
        expectation,
        expectedErrorMessage,
        expectedDeprecationMessages,
        expectedSourceMapMappings,
        sandboxed,
        sandboxPolicy,
        sandboxSecurityPolicyFilters,
        sandboxSecurityPolicyTags,
        sandboxSecurityPolicyFunctions,
        sandboxSecurityPolicyMethods,
        sandboxSecurityPolicyProperties,
        strict,
        trimmedExpectation
    } = integrationTest;
    
    tape(description, ({test}) => {
        test('asynchronously', ({fail, same, end}) => {
            let loader: TwingLoader;

            if (!isATestWithALoader(integrationTest)) {
                loader = createArrayLoader(integrationTest.templates);
            }
            else {
                loader = integrationTest.loader;
            }

            if (environmentOptions === undefined) {
                environmentOptions = {};
            }

            if (environmentOptions.parserOptions === undefined) {
                environmentOptions.parserOptions = {};
            }

            if (environmentOptions.parserOptions.level === undefined) {
                environmentOptions.parserOptions.level = 2;
            }

            if (strict === undefined) {
                strict = true;
            }

            let environment = createEnvironment(loader, Object.assign({}, <TwingEnvironmentOptions>{
                sandboxPolicy: sandboxPolicy || createSandboxSecurityPolicy({
                    allowedTags: sandboxSecurityPolicyTags,
                    allowedFilters: sandboxSecurityPolicyFilters,
                    allowedFunctions: sandboxSecurityPolicyFunctions,
                    allowedMethods: sandboxSecurityPolicyMethods,
                    allowedProperties: sandboxSecurityPolicyProperties
                }),
                emitsSourceMap: expectedSourceMapMappings !== undefined
            }, environmentOptions));

            environment.addExtension(new TwingTestExtension());
            environment.registerEscapingStrategy((value) => `custom ${value}`, 'custom');

            environment.addExtension({
                filters: additionalFilters || [],
                functions: additionalFunctions || [],
                nodeVisitors: additionalNodeVisitors || [],
                tagHandlers: [],
                tests: additionalTests || [],
                operators: []
            });

            let consoleStub: SinonStub | null = null;
            let consoleData: string[] = [];

            if (expectedDeprecationMessages) {
                consoleStub = stub(console, 'warn').callsFake((data: string) => {
                    consoleData.push(data);
                });
            }

            return (context ? Promise.resolve(context) : Promise.resolve({})).then(async (context: Record<string, any>) => {
                if (!expectedErrorMessage) {
                    try {
                        console.time(description);

                        let actual: string;
                        let sourceMap: RawSourceMap | null = null;

                        if (expectedSourceMapMappings !== undefined) {
                            const result = await environment.renderWithSourceMap('index.twig', context, {
                                sandboxed,
                                strict
                            });

                            actual = result.data;
                            sourceMap = result.sourceMap;
                        }
                        else {
                            actual = await environment.render('index.twig', context, {
                                sandboxed,
                                strict
                            });
                        }

                        console.timeEnd(description);

                        if (expectation !== undefined) {
                            same(actual, expectation, `${description}: renders as expected`);
                        }

                        if (trimmedExpectation !== undefined) {
                            same(actual.trim(), trimmedExpectation.trim(), `${description}: trimmed, renders as expected`);
                        }

                        if (consoleStub) {
                            consoleStub.restore();

                            same(consoleData, expectedDeprecationMessages, `${description}: outputs deprecation warnings`);
                        }

                        if (sourceMap !== null) {
                            const mappings: Array<MappingItem> = [];
                            const consumer = new SourceMapConsumer(sourceMap);

                            consumer.eachMapping(({
                                                      source,
                                                      generatedLine,
                                                      generatedColumn,
                                                      originalLine,
                                                      originalColumn,
                                                      name
                                                  }) => {
                                mappings.push({
                                    source,
                                    generatedLine,
                                    generatedColumn,
                                    originalLine,
                                    originalColumn,
                                    name
                                });
                            })

                            same(mappings, expectedSourceMapMappings);
                        }
                    } catch (e) {
                        console.log(e);

                        console.timeEnd(description);

                        fail(`${description}: should not throw an error (${e})`);
                    }
                }
                else {
                    try {
                        console.time(description);

                        await environment.render('index.twig', context, {
                            sandboxed,
                            strict
                        });

                        fail(`${description}: should throw an error`);
                    } catch (error: any) {
                        console.timeEnd(description);

                        same(`${error.name}: ${error.message}`, expectedErrorMessage, `${description}: throws error`);
                    }
                }

                end();
            });
        });

        test('synchronously', ({fail, same, end}) => {
            let loader: TwingSynchronousLoader;

            if (!isATestWithALoader(integrationTest)) {
                loader = createSynchronousArrayLoader(integrationTest.templates);
            }
            else {
                loader = integrationTest.synchronousLoader;
            }

            if (synchronousEnvironmentOptions === undefined) {
                synchronousEnvironmentOptions = {};
            }

            if (synchronousEnvironmentOptions.parserOptions === undefined) {
                synchronousEnvironmentOptions.parserOptions = {};
            }

            if (synchronousEnvironmentOptions.parserOptions.level === undefined) {
                synchronousEnvironmentOptions.parserOptions.level = 2;
            }

            if (strict === undefined) {
                strict = true;
            }

            let environment = createSynchronousEnvironment(loader, Object.assign({}, <TwingEnvironmentOptions>{
                sandboxPolicy: sandboxPolicy || createSandboxSecurityPolicy({
                    allowedTags: sandboxSecurityPolicyTags,
                    allowedFilters: sandboxSecurityPolicyFilters,
                    allowedFunctions: sandboxSecurityPolicyFunctions,
                    allowedMethods: sandboxSecurityPolicyMethods,
                    allowedProperties: sandboxSecurityPolicyProperties
                }),
                emitsSourceMap: expectedSourceMapMappings !== undefined
            }, synchronousEnvironmentOptions));

            environment.addExtension(new TwingSynchronousTestExtension());
            environment.registerEscapingStrategy((value) => `custom ${value}`, 'custom');

            environment.addExtension({
                filters: additionalSynchronousFilters || [],
                functions: additionalSynchronousFunctions || [],
                nodeVisitors: additionalNodeVisitors || [],
                tagHandlers: [],
                tests: additionalSynchronousTests || [],
                operators: []
            });

            let consoleStub: SinonStub | null = null;
            let consoleData: string[] = [];

            if (expectedDeprecationMessages) {
                consoleStub = stub(console, 'warn').callsFake((data: string) => {
                    consoleData.push(data);
                });
            }

            const actualContext = synchronousContext || context || {};

            if (!expectedErrorMessage) {
                try {
                    console.time(description);

                    let actual: string;
                    let sourceMap: RawSourceMap | null = null;

                    if (expectedSourceMapMappings !== undefined) {
                        const result = environment.renderWithSourceMap('index.twig', actualContext, {
                            sandboxed,
                            strict
                        });

                        actual = result.data;
                        sourceMap = result.sourceMap;
                    }
                    else {
                        actual = environment.render('index.twig', actualContext, {
                            sandboxed,
                            strict
                        });
                    }

                    console.timeEnd(description);

                    if (expectation !== undefined) {
                        same(actual, expectation, `${description}: renders as expected`);
                    }

                    if (trimmedExpectation !== undefined) {
                        same(actual.trim(), trimmedExpectation.trim(), `${description}: trimmed, renders as expected`);
                    }

                    if (consoleStub) {
                        consoleStub.restore();

                        same(consoleData, expectedDeprecationMessages, `${description}: outputs deprecation warnings`);
                    }

                    if (sourceMap !== null) {
                        const mappings: Array<MappingItem> = [];
                        const consumer = new SourceMapConsumer(sourceMap);

                        consumer.eachMapping(({
                                                  source,
                                                  generatedLine,
                                                  generatedColumn,
                                                  originalLine,
                                                  originalColumn,
                                                  name
                                              }) => {
                            mappings.push({
                                source,
                                generatedLine,
                                generatedColumn,
                                originalLine,
                                originalColumn,
                                name
                            });
                        })

                        same(mappings, expectedSourceMapMappings);
                    }
                } catch (e) {
                    console.log(e);

                    console.timeEnd(description);

                    fail(`${description}: should not throw an error (${e})`);
                }
            }
            else {
                try {
                    console.time(description);

                    environment.render('index.twig', actualContext, {
                        sandboxed,
                        strict
                    });

                    fail(`${description}: should throw an error`);
                } catch (error: any) {
                    console.timeEnd(description);

                    same(`${error.name}: ${error.message}`, expectedErrorMessage, `${description}: throws error`);
                }
            }

            end();
        });
    });
};

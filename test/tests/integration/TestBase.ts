import * as tape from 'tape';
import {SinonStub, stub} from 'sinon';
import {TokenType} from "twig-lexer";
import {createEnvironment, TwingEnvironmentOptions} from "../../../src/lib/environment";
import {createPrintNode} from "../../../src/lib/node/output/print";
import {createConstantNode} from "../../../src/lib/node/expression/constant";
import {TwingExtension} from "../../../src/lib/extension";
import {createFilter} from "../../../src/lib/filter";
import {createFunction} from "../../../src/lib/function";
import {createTest} from "../../../src/lib/test";
import {createSandboxSecurityPolicy} from "../../../src/lib/sandbox/security-policy";
import {createArrayLoader} from "../../../src/lib/loader/array";
import {escape} from "../../../src/lib/extension/core/filters/escape";
import {IntegrationTest} from "./test";
import {TwingTagHandler} from "../../../src/lib/tag-handler";
import {MappingItem, RawSourceMap, SourceMapConsumer} from "source-map";
import {TwingLoader} from "../../../src/lib/loader";
import {Settings} from "luxon";
import {TwingTemplate} from "../../../src/lib/template";

const createSectionTokenParser = (): TwingTagHandler => {
    return {
        tag: '§',
        initialize: () => {
            return (_token, stream) => {
                stream.expect(TokenType.TAG_END);

                return createPrintNode(createConstantNode('§', -1, -1), -1, -1);
            };
        }
    };
};

class TwingTestExtension implements TwingExtension {
    static staticCall(value: string) {
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
            createFilter('escape_and_nl2br', escape_and_nl2br, [], {
                needs_template: true,
                is_safe: ['html']
            }),
            // name this filter "nl2br_" to allow the core "nl2br" filter to be tested
            createFilter('nl2br_', nl2br, [{
                name: 'separator'
            }], {pre_escape: 'html', is_safe: ['html']}),
            createFilter('§', this.sectionFilter, []),
            createFilter('escape_something', escape_something, [], {'is_safe': ['something']}),
            createFilter('preserves_safety', preserves_safety, [], {'preserves_safety': ['html']}),
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
            createFilter('anon_foo', (name: string) => {
                return Promise.resolve('*' + name + '*');
            }, []),
        ];
    }

    get functions() {
        return [
            createFunction('§', this.sectionFunction, [{
                name: 'value'
            }]),
            createFunction('safe_br', this.br, [], {
                'is_safe': ['html']
            }),
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
            createFunction('anon_foo', (name: string) => {
                return Promise.resolve('*' + name + '*');
            }, [{
                name: 'name'
            }]),
            createFunction('createObject', (attributes: Map<string, any>) => {
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

    sectionFilter(value: string) {
        return Promise.resolve(`§${value}§`);
    }

    sectionFunction(value: string) {
        return Promise.resolve(`§${value}§`);
    }

    br() {
        return Promise.resolve('<br />');
    }

    is_multi_word(value: string) {
        return Promise.resolve(value.indexOf(' ') > -1);
    }

    dynamic_test(element: any, item: any) {
        return Promise.resolve(element === item);
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

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {};
    }

    getExpectedErrorMessage(): string | null {
        return null;
    }

    getExpectedDeprecationMessages(): string[] | null {
        return null;
    }

    getType(): "template" | "execution context" | undefined {
        return undefined;
    }
}

/**
 * nl2br which also escapes, for testing escaper filters.
 */
function escape_and_nl2br(template: TwingTemplate, value: string, sep = '<br />') {
    return escape(template, value, 'html', 'UTF-8').then((result) => {
        return nl2br(result?.toString() || '', sep);
    });
}

/**
 * nl2br only, for testing filters with pre_escape.
 */
function nl2br(value: string, sep = '<br />') {
    return Promise.resolve(value.replace('\n', `${sep}\n`));
}

function escape_something(value: string) {
    return Promise.resolve(value.toUpperCase());
}

function preserves_safety(value: string) {
    return Promise.resolve(value.toUpperCase());
}

function dynamic_path(element: string, item: string) {
    return Promise.resolve(element + '/' + item);
}

function dynamic_foo(foo: string, bar: string, item: string) {
    return Promise.resolve(foo + '/' + bar + '/' + item);
}

const isATestWithALoader = (test: IntegrationTest): test is IntegrationTest & {
    loader: TwingLoader
} => {
    return (test as any).loader !== undefined;
};

export const runTest = async (
    integrationTest: IntegrationTest
) => {
    Settings.defaultZoneName = "Europe/Paris";

    let loader: TwingLoader;

    const {
        additionalFilters,
        additionalFunctions,
        additionalNodeVisitors,
        additionalTests,
        description,
        context,
        globals,
        environmentOptions,
        expectation,
        expectedErrorMessage,
        expectedDeprecationMessages,
        expectedSourceMapMappings,
        sandboxPolicy,
        sandboxSecurityPolicyFilters,
        sandboxSecurityPolicyTags,
        sandboxSecurityPolicyFunctions,
        sandboxSecurityPolicyMethods,
        sandboxSecurityPolicyProperties,
        parserOptions,
        trimmedExpectation,
        type
    } = integrationTest;

    if (type === undefined || type === "execution context") {
        tape(`Renderer - ${description}`, ({fail, same, end}) => {
            if (!isATestWithALoader(integrationTest)) {
                loader = createArrayLoader(integrationTest.templates);
            } else {
                loader = integrationTest.loader;
            }

            let environment = createEnvironment(loader, Object.assign({}, <TwingEnvironmentOptions>{
                sandboxPolicy: sandboxPolicy || createSandboxSecurityPolicy({
                    allowedTags: sandboxSecurityPolicyTags,
                    allowedFilters: sandboxSecurityPolicyFilters,
                    allowedFunctions: sandboxSecurityPolicyFunctions,
                    allowedMethods: sandboxSecurityPolicyMethods,
                    allowedProperties: sandboxSecurityPolicyProperties
                }),
                strictVariables: true,
                emitsSourceMap: expectedSourceMapMappings !== undefined,
                parserOptions
            }, environmentOptions || {}));

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

            if (globals) {
                for (let key in globals) {
                    environment.setGlobal(key, globals[key]);
                }
            }

            environment.setGlobal('global', 'global');

            let consoleStub: SinonStub | null = null;
            let consoleData: string[] = [];

            if (expectedDeprecationMessages) {
                consoleStub = stub(console, 'warn').callsFake((data: string) => {
                    consoleData.push(data);
                });
            }

            return (context || Promise.resolve({})).then(async (context: Record<string, any>) => {
                if (!expectedErrorMessage) {
                    try {
                        console.time(description);

                        let actual: string;
                        let sourceMap: RawSourceMap | null = null;

                        if (expectedSourceMapMappings !== undefined) {
                            const result = await environment.renderWithSourceMap('index.twig', context);

                            actual = result.data;
                            sourceMap = result.sourceMap;
                        } else {
                            actual = await environment.render('index.twig', context);
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
                        console.timeEnd(description);

                        fail(`${description}: should not throw an error (${e})`);
                    }
                } else {
                    try {
                        console.time(description);

                        await environment.render('index.twig', context);

                        fail(`${description}: should throw an error`);
                    } catch (error: any) {
                        console.timeEnd(description);

                        same(`${error.name}: ${error.message}`, expectedErrorMessage, `${description}: throws error`);
                    }
                }

                end();
            });
        });
    }
};

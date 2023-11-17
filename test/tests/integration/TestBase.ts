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
import {TwingTemplate} from "../../../src/lib/template";
import {IntegrationTest} from "./test";
import {TwingTagHandler} from "../../../src/lib/tag-handler";
import {MappingItem, SourceMapConsumer} from "source-map";
import {isATwingError} from "../../../src/lib/error";
import {createFilesystemCache} from "../../../src/lib/cache/filesystem";
import * as fs from "fs";
import {TwingCache} from "../../../src/lib/cache";
import {TwingLoader} from "../../../src/lib/loader";
import {Settings} from "luxon";

// @ts-ignore
let cache: TwingCache | false = createFilesystemCache('tmp', fs);
cache = false;

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
                const object: { [p: string]: any } = {};

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

    getTemplates(): { [k: string]: string } {
        return {};
    }

    getExpected(): string {
        return '';
    }

    getGlobals(): { [k: string]: string } {
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
    test: IntegrationTest
) => {
    Settings.defaultZoneName = "Europe/Paris";
    
    let loader: TwingLoader;

    const {
        additionalFilters,
        additionalFiltersAtCompileTime,
        additionalFunctions,
        additionalFunctionsAtCompileTime,
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
        parserOptions
    } = test;

    tape(description, async ({fail, same, end}) => {
        if (!isATestWithALoader(test)) {
            loader = createArrayLoader(test.templates);
        } else {
            loader = test.loader;
        }

        let environment = createEnvironment(loader, Object.assign({}, <TwingEnvironmentOptions>{
            cache,
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
                    
                    if (additionalFiltersAtCompileTime || additionalFunctionsAtCompileTime) {
                        if (additionalFiltersAtCompileTime) {
                            for (const filter of additionalFiltersAtCompileTime) {
                                environment.addFilter(filter);
                            }
                        }

                        if (additionalFunctionsAtCompileTime) {
                            for (const twingFunction of additionalFunctionsAtCompileTime) {
                                environment.addFunction(twingFunction);
                            }
                        }
                        
                        const tokens = environment.tokenize((await loader.getSourceContext('index.twig', null))!);
                        const node = environment.parse(tokens, parserOptions || {
                            strict: true
                        });
                        const content = environment.compile(node);
                        const template = await environment.createTemplateFromCompiledSource(content, 'index.twig');
                        
                        actual = await template.render(context);
                    }
                    else {
                        actual = await environment.render('index.twig', context);
                    }

                    console.timeEnd(description);

                    if (expectation !== undefined) {
                        same(actual.trim(), expectation.trim(), `${description}: renders as expected`);
                    }

                    if (consoleStub) {
                        consoleStub.restore();

                        same(consoleData, expectedDeprecationMessages, `${description}: outputs deprecation warnings`);
                    }

                    if (expectedSourceMapMappings !== undefined) {
                        const sourceMap = environment.sourceMap;
                        const mappings: Array<MappingItem> = [];

                        if (sourceMap) {
                            const consumer = new SourceMapConsumer(JSON.parse(sourceMap));

                            consumer.eachMapping((mapping) => {
                                mappings.push(mapping);
                            })
                        }

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

                    if (isATwingError(error)) {
                        same(error.toString(), expectedErrorMessage, `${description}: throws error`);
                    } else {
                        same(error.message, expectedErrorMessage, `${description}: throws error`);
                    }
                }
            }

            end();
        });
    });
};

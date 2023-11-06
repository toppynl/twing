import * as tape from 'tape';
import {SinonStub, stub} from 'sinon';
import {TokenType} from "twig-lexer";
import {createEnvironment, TwingEnvironmentOptions} from "../../../src/lib/environment";
import {createPrintNode} from "../../../src/lib/node/print";
import {createConstantNode} from "../../../src/lib/node/expression/constant";
import {TwingExtension} from "../../../src/lib/extension";
import {createFilter} from "../../../src/lib/filter";
import {createFunction} from "../../../src/lib/function";
import {createTest} from "../../../src/lib/test";
import {TwingSandboxSecurityPolicy} from "../../../src/lib/sandbox/security-policy";
import {createArrayLoader} from "../../../src/lib/loader/array";
import {escape} from "../../../src/lib/extension/core/filters/escape";
import {TwingTemplate} from "../../../src/lib/template";
import {TwingOutputBuffer} from "../../../src/lib/output-buffer";
import {IntegrationTest} from "./test";
import {TwingTagHandler} from "../../../src/lib/tag-handler";
import {MappingItem, SourceMapConsumer} from "source-map";
import {isATwingError} from "../../../src/lib/error";
import {createFilesystemCache} from "../../../src/lib/cache/filesystem";
import * as fs from "fs";

// @ts-ignore
const cache = createFilesystemCache('tmp', fs);

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

class TwingTestExtension extends TwingExtension {
    static staticCall(value: string) {
        return Promise.resolve(`*${value}*`);
    }

    static __callStatic(method: string, ...arguments_: any[]) {
        if (method !== 'magicStaticCall') {
            throw new Error('Unexpected call to __callStatic');
        }

        return Promise.resolve('static_magic_' + arguments_[0]);
    }

    getTokenParsers() {
        return [
            createSectionTokenParser()
        ];
    }

    getFilters() {
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

    getFunctions() {
        return [
            createFunction('§', this.sectionFunction, [{
                name: 'value'
            }]),
            createFunction('safe_br', this.br, [], {'is_safe': ['html']}),
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
            }]),
            createFunction('getMacro', (template: TwingTemplate, outputBuffer: TwingOutputBuffer, name: string) => {
                return template.getMacro(name).then((macroHandler) => {
                    return (...args: Array<any>) => macroHandler!(outputBuffer, ...args);
                });
            }, [{
                name: 'name'
            }], {
                needs_template: true,
                needs_output_buffer: true
            }),
        ];
    }

    getTests() {
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
    return escape(template, value, 'html', null).then((result) => {
        return nl2br(result, sep);
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

export const runTest = async (
    test: IntegrationTest
) => {
    const {
        additionalFilters,
        additionalFunctions,
        additionalTests,
        description,
        context,
        globals,
        templates,
        environmentOptions,
        expectation,
        expectedErrorMessage,
        expectedDeprecationMessages,
        expectedSourceMapMappings,
        sandboxSecurityPolicyFilters,
        sandboxSecurityPolicyTags,
        sandboxSecurityPolicyFunctions,
        parserOptions
    } = test;
    
    tape(description, async ({fail, same, end}) => {
        let loader = createArrayLoader(templates);
        let environment = createEnvironment(loader, Object.assign({}, <TwingEnvironmentOptions>{
            cache: false, //cache,
            sandboxPolicy: new TwingSandboxSecurityPolicy(sandboxSecurityPolicyTags, sandboxSecurityPolicyFilters, new Map(), new Map(), sandboxSecurityPolicyFunctions),
            strictVariables: true,
            source_map: expectedSourceMapMappings !== undefined,
            parserOptions
        }, environmentOptions || {}));

        environment.addExtension(new TwingTestExtension(), 'TwingTestExtension');

        if (additionalFilters) {
            for (const additionalFilter of additionalFilters) {
                environment.addFilter(additionalFilter);
            }
        }

        if (additionalFunctions) {
            for (const additionalFunction of additionalFunctions) {
                environment.addFunction(additionalFunction);
            }
        }

        if (additionalTests) {
            for (const additionalTest of additionalTests) {
                environment.addTest(additionalTest);
            }
        }
        
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
                    
                    let actual = await environment.render('index.twig', context);

                    console.timeEnd(description);

                    if (expectation) {
                        same(actual.trim(), expectation.trim(), `${description}: renders as expected`);
                    }

                    if (consoleStub) {
                        consoleStub.restore();

                        same(consoleData, expectedDeprecationMessages, `${description}: outputs deprecation warnings`);
                    }

                    if (expectedSourceMapMappings !== undefined) {
                        const consumer = new SourceMapConsumer(JSON.parse(environment.getSourceMap()!));
                        
                        const mappings: Array<MappingItem> = [];
                        
                        consumer.eachMapping((mapping) => {
                            mappings.push(mapping);
                        })
                        
                        same(mappings, expectedSourceMapMappings);
                    }
                } catch (e) {
                    console.log(e);
                    
                    fail(`${description}: should not throw an error (${e})`);
                }
            } else {
                try {
                    await environment.render('index.twig', context);

                    fail(`${description}: should throw an error`);
                } catch (error: any) {
                    if (isATwingError(error)) {
                        same(error.toString(), expectedErrorMessage, `${description}: throws error`);
                    }
                    else {
                        same(error.message, expectedErrorMessage, `${description}: throws error`);
                    }
                }
            }

            end();
        });
    });
};

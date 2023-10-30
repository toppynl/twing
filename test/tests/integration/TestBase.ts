import * as tape from 'tape';
import * as sinon from 'sinon';

import {TokenType} from "twig-lexer";
import {createEnvironment, TwingEnvironmentOptions} from "../../../src/lib/environment";
import {TokenParser} from "../../../src/lib/token-parser";
import {createPrintNode} from "../../../src/lib/node/print";
import {createConstantNode} from "../../../src/lib/node/expression/constant";
import {TwingExtension} from "../../../src/lib/extension";
import {TwingFilter} from "../../../src/lib/filter";
import {TwingFunction} from "../../../src/lib/function";
import {TwingTest} from "../../../src/lib/test";
import {TwingSandboxSecurityPolicy} from "../../../src/lib/sandbox/security-policy";
import {TwingLoaderArray} from "../../../src/lib/loader/array";
import {escape} from "../../../src/lib/extension/core/filters/escape";
import {TwingTemplate} from "../../../src/lib/template";
import {TwingOutputBuffer} from "../../../src/lib/output-buffer";
import {IntegrationTest} from "./test";

class TwingTestTokenParserSection extends TokenParser {
    parse() {
        this.parser.getStream().expect(TokenType.TAG_END);

        return createPrintNode(createConstantNode('§', -1, -1), -1, -1);
    }

    getTag() {
        return '§';
    }
}

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
            new TwingTestTokenParserSection()
        ];
    }

    getFilters() {
        return [
            new TwingFilter('escape_and_nl2br', escape_and_nl2br, [], {
                needs_template: true,
                is_safe: ['html']
            }),
            // name this filter "nl2br_" to allow the core "nl2br" filter to be tested
            new TwingFilter('nl2br_', nl2br, [], {'pre_escape': 'html', 'is_safe': ['html']}),
            new TwingFilter('§', this.sectionFilter, []),
            new TwingFilter('escape_something', escape_something, [], {'is_safe': ['something']}),
            new TwingFilter('preserves_safety', preserves_safety, [], {'preserves_safety': ['html']}),
            new TwingFilter('static_call_string', TwingTestExtension.staticCall, []),
            new TwingFilter('static_call_array', TwingTestExtension.staticCall, []),
            new TwingFilter('magic_call_string', function () {
                return TwingTestExtension.__callStatic('magicStaticCall', arguments);
            }, []),
            new TwingFilter('magic_call_array', function () {
                return TwingTestExtension.__callStatic('magicStaticCall', arguments);
            }, []),
            new TwingFilter('*_path', dynamic_path, []),
            new TwingFilter('*_foo_*_bar', dynamic_foo, []),
            new TwingFilter('anon_foo', function (name: string) {
                return Promise.resolve('*' + name + '*');
            }, []),
        ];
    }

    getFunctions() {
        return [
            new TwingFunction('§', this.sectionFunction, []),
            new TwingFunction('safe_br', this.br, [], {'is_safe': ['html']}),
            new TwingFunction('unsafe_br', this.br, []),
            new TwingFunction('static_call_string', TwingTestExtension.staticCall, []),
            new TwingFunction('static_call_array', TwingTestExtension.staticCall, []),
            new TwingFunction('*_path', dynamic_path, []),
            new TwingFunction('*_foo_*_bar', dynamic_foo, []),
            new TwingFunction('anon_foo', function (name: string) {
                return Promise.resolve('*' + name + '*');
            }, []),
            new TwingFunction('createObject', function (attributes: Map<string, any>) {
                const object: { [p: string]: any } = {};

                for (let [key, value] of attributes) {
                    object[key] = value;
                }

                return Promise.resolve(object);
            }, []),
            new TwingFunction('getMacro', function (template: TwingTemplate, outputBuffer: TwingOutputBuffer, name: string) {
                return template.getMacro(name).then((macroHandler) => {
                    return (...args: Array<any>) => macroHandler(outputBuffer, ...args);
                });
            }, [], {
                needs_template: true,
                needs_output_buffer: true
            }),
        ];
    }

    getTests() {
        return [
            new TwingTest('multi word', this.is_multi_word, []),
            new TwingTest('test_*', this.dynamic_test, [])
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

    getExpectedErrorMessage(): string {
        return null;
    }

    getExpectedDeprecationMessages(): string[] {
        return null;
    }
}

/**
 * nl2br which also escapes, for testing escaper filters.
 */
function escape_and_nl2br(template: TwingTemplate, value: string, sep = '<br />') {
    return escape(template, value, 'html').then((result) => {
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
    const {description, context, globals, templates, environmentOptions, expectation, expectedErrorMessage, expectedDeprecationMessages, sandboxSecurityPolicyFilters, sandboxSecurityPolicyTags, sandboxSecurityPolicyFunctions} = test;

    tape(description, async ({fail, same, end}) => {
        let loader = new TwingLoaderArray(templates);
        let environment = createEnvironment(loader, Object.assign({}, <TwingEnvironmentOptions>{
            cache: false,
            sandbox_policy: new TwingSandboxSecurityPolicy(sandboxSecurityPolicyTags, sandboxSecurityPolicyFilters, new Map(), new Map(), sandboxSecurityPolicyFunctions),
            strict_variables: true
        }, environmentOptions || {}));
        
        environment.addExtension(new TwingTestExtension(), 'TwingTestExtension');

        if (globals) {
            for (let key in globals) {
                environment.setGlobal(key, globals[key]);
            }
        }

        environment.setGlobal('global', 'global');

        let consoleStub = null;
        let consoleData: string[] = [];

        if (expectedDeprecationMessages) {
            consoleStub = sinon.stub(console, 'warn').callsFake((data: string) => {
                consoleData.push(data);
            });
        }

        return context.then(async (context) => {
            if (!expectedErrorMessage) {
                try {
                    console.time(description);

                    let actual = await environment.render('index.twig', context);

                    console.timeEnd(description);

                    same(actual.trim(), expectation.trim(), `${description}: renders as expected`);

                    if (consoleStub) {
                        consoleStub.restore();

                        same(consoleData, expectedDeprecationMessages, `${description}: outputs deprecation warnings`);
                    }
                } catch (e) {
                    console.error(e);

                    fail(`${description}: should not throw an error (${e})`);
                }
            } else {
                try {
                    await environment.render('index.twig', context);

                    fail(`${description}: should throw an error`);
                } catch (e) {
                    same(e.toString(), expectedErrorMessage, `${description}: throws error`);
                }
            }
            
            end();
        });
    });
};

import {runTest} from "../../TestBase";
import {TwingCache} from "../../../../../src/lib/cache";

const createCache = (): TwingCache => {
    const container = new Map<string, string>();

    return {
        generateKey: (hash) => Promise.resolve(hash),
        getTimestamp: () => Promise.resolve(Number.POSITIVE_INFINITY),
        load: (key) => Promise.resolve(container.get(key) || null),
        write: (key, content) => Promise.resolve(container.set(key, content)).then()
    };
};

const cache = createCache();

const testCases: Array<[title: string, Record<string, any>, errorMessage: string]> = [
    ['record and method', {foo: {}}, 'TwingRuntimeError: Neither the property "bar" nor one of the methods bar()" or "getbar()"/"isbar()"/"hasbar()" exist and have public access in class "Object" in "index.twig" at line 1.'],
    ['map and method', {foo: new Map([['oof', 5]])}, 'TwingRuntimeError: Impossible to invoke a method ("bar") on an array in "index.twig" at line 1.'],
    ['array and method', {foo: [5]}, 'TwingRuntimeError: Impossible to invoke a method ("bar") on an array in "index.twig" at line 1.'],
    ['null and method', {foo: null}, 'TwingRuntimeError: Impossible to invoke a method ("bar") on a null variable in "index.twig" at line 1.'],
    ['number and method', {foo: 5}, 'TwingRuntimeError: Impossible to invoke a method ("bar") on a number variable ("5") in "index.twig" at line 1.'],
];

for (const [name, context, errorMessage] of testCases) {
    for (const strictVariables of [false, true]) {
        runTest({
            description: `method call honors the runtime strict check setting (${strictVariables}) with ${name}`,
            templates: {
                "index.twig": `{{ foo.bar() }}`
            },
            context: Promise.resolve(context),
            trimmedExpectation: strictVariables ? undefined : '',
            expectedErrorMessage: strictVariables ? errorMessage : undefined,
            environmentOptions: {
                cache,
                strictVariables
            }
        });
    }
}

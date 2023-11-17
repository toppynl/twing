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

const testCases: Array<[title: string, context: Record<string, any>, errorMessage: string]> = [
    ['record', {foo: {}}, 'TwingRuntimeError: Impossible to access a key ("bar") on a object variable ("[object Object]") in "index.twig" at line 1.'],
    ['map', {foo: new Map([['oof', '']])}, 'TwingRuntimeError: Index "bar" is out of bounds for array [] in "index.twig" at line 1.'],
    ['empty map', {foo: new Map()}, 'TwingRuntimeError: Index "bar" is out of bounds as the array is empty in "index.twig" at line 1.'],
    ['array', {foo: ['']}, 'TwingRuntimeError: Index "bar" is out of bounds for array [] in "index.twig" at line 1.'],
    ['empty array', {foo: []}, 'TwingRuntimeError: Index "bar" is out of bounds as the array is empty in "index.twig" at line 1.'],
    ['null', {foo: null}, 'TwingRuntimeError: Impossible to access a key ("bar") on a null variable in "index.twig" at line 1.'],
    ['number', {foo: 5}, 'TwingRuntimeError: Impossible to access a key ("bar") on a number variable ("5") in "index.twig" at line 1.'],
];

for (const [name, context, errorMessage] of testCases) {
    for (const strictVariables of [false, true]) {
        runTest({
            description: `array call honors the runtime strict check setting (${strictVariables}) with ${name}`,
            templates: {
                "index.twig": `{{ foo["bar"] }}`
            },
            context: Promise.resolve(context),
            expectation: strictVariables ? undefined : '',
            expectedErrorMessage: strictVariables ? errorMessage : undefined,
            environmentOptions: {
                cache,
                strictVariables
            }
        });
    }
}

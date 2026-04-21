import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"invoke" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ double|invoke(5) }}
{{ greet|invoke('World') }}
`
        };
    }

    getExpected() {
        return `
10
Hello, World!
`;
    }

    getContext() {
        return {
            double: (n: number) => n * 2,
            greet: (name: string) => `Hello, ${name}!`
        };
    }
}

runTest(createIntegrationTest(new Test()));

runTest({
    description: '"invoke" filter with non-callable value',
    templates: {
        'index.twig': `{{ value|invoke(1) }}`
    },
    context: {
        value: 42
    },
    expectedErrorMessage: 'TwingRuntimeError: The "invoke" filter expects a callable, got "number" in "index.twig" at line 1, column 10.'
});

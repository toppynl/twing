import {runTest} from "../../TestBase";

runTest({
    description: 'Unknown one-word test throws a parsing error on strict mode',
    environmentOptions: {
        parserOptions: {
            strict: false
        }
    },
    templates: {
        'index.twig': '{{ 5 is unknown }}'
    },
    expectedErrorMessage: 'TwingRuntimeError: Unknown test "unknown" in "index.twig" at line 1, column 9.'
});

runTest({
    description: 'Unknown two-words test throws a parsing error on strict mode',
    environmentOptions: {
        parserOptions: {
            strict: false
        }
    },
    templates: {
        'index.twig': `
{{ 5 is un known }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: Unknown test "un known" in "index.twig" at line 2, column 9.'
});

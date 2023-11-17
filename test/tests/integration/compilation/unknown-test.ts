import {runTest} from "../TestBase";

runTest({
    description: 'one-word unknown test at compile time',
    environmentOptions: {
        parserOptions: {
            strict: false
        }
    },
    templates: {
        'index.twig': '{{ 5 is unknown }}'
    },
    expectedErrorMessage: 'TwingCompilationError: Unknown test "unknown" in "index.twig" at line 1.'
});

runTest({
    description: 'two-words unknown test at compile time',
    environmentOptions: {
        parserOptions: {
            strict: false
        }
    },
    templates: {
        'index.twig': '{{ 5 is un known }}'
    },
    expectedErrorMessage: 'TwingCompilationError: Unknown test "un known" in "index.twig" at line 1.'
});

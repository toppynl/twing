import {runTest} from "../TestBase";

runTest({
    description: 'unknown function',
    environmentOptions: {
        parserOptions: {
            strict: false
        }
    },
    templates: {
        'index.twig': '{{ unknown() }}'
    },
    expectedErrorMessage: 'TwingCompilationError: Unknown function "unknown" in "index.twig" at line 1.'
});

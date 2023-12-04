import {runTest} from "../../TestBase";

runTest({
    description: 'Unknown function throws a parsing error on strict mode',
    environmentOptions: {
        parserOptions: {
            strict: false,
            level: 2
        }
    },
    templates: {
        'index.twig': `
{{ unknown() }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: Unknown function "unknown" in "index.twig" at line 2, column 4.'
});

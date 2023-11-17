import {runTest} from "../../TestBase";

runTest({
    description: 'Unknown function throws a parsing error on strict mode',
    environmentOptions: {
        parserOptions: {
            strict: true
        }
    },
    templates: {
        'index.twig': `
{{ unknown() }}`
    },
    expectedErrorMessage: 'TwingParsingError: Unknown function "unknown" in "index.twig" at line 2, column 4.'
});

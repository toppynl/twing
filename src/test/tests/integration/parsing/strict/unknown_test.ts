import {runTest} from "../../TestBase";

runTest({
    description: 'Unknown one-word test throws a parsing error on strict mode',
    environmentOptions: {
        parserOptions: {
            strict: true,
            level: 2
        }
    },
    synchronousEnvironmentOptions: {
        parserOptions: {
            strict: true,
            level: 2
        }
    },
    templates: {
        'index.twig': '{{ 5 is unknown }}'
    },
    expectedErrorMessage: 'TwingParsingError: Unknown test "unknown" in "index.twig" at line 1, column 9.'
});

runTest({
    description: 'Unknown two-words test throws a parsing error on strict mode',
    environmentOptions: {
        parserOptions: {
            strict: true,
            level: 2
        }
    },
    synchronousEnvironmentOptions: {
        parserOptions: {
            strict: true,
            level: 2
        }
    },
    templates: {
        'index.twig': `
{{ 5 is un known }}`
    },
    expectedErrorMessage: 'TwingParsingError: Unknown test "un known" in "index.twig" at line 2, column 9.'
});

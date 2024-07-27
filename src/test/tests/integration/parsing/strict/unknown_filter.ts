import {runTest} from "../../TestBase";

runTest({
    description: 'Unknown filter throws a parsing error on strict mode',
    templates: {
        "index.twig": '{{ 5|unknown }}'
    },
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
    expectedErrorMessage: 'TwingParsingError: Unknown filter "unknown" in "index.twig" at line 1, column 6.'
});

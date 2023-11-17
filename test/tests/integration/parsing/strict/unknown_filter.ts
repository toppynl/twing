import {runTest} from "../../TestBase";

runTest({
    description: 'Unknown filter throws a parsing error on strict mode',
    templates: {
        "index.twig": '{{ 5|unknown }}'
    },
    parserOptions: {
        strict: true
    },
    expectedErrorMessage: 'TwingParsingError: Unknown filter "unknown" in "index.twig" at line 1, column 6.'
});

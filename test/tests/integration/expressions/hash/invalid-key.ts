import {runTest} from "../../TestBase";

runTest({
    description: 'An error is thrown when using an invalid key',
    templates: {
        "index.twig": '{% set a = {<: 5} %}'
    },
    expectedErrorMessage: 'TwingParsingError: A hash key must be a quoted string, a number, a name, or an expression enclosed in parentheses (unexpected token "operator" of value "<" in "index.twig" at line 1, column 13.'
});

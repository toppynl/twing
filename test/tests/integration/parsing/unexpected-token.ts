import {runTest} from "../TestBase";

runTest({
    description: 'An error is throw on unexpected token',
    templates: {
        "index.twig": '{{ [a b]}}'
    },
    expectedErrorMessage: 'TwingParsingError: An array element must be followed by a comma. Unexpected token "name" of value "b" ("punctuation" expected with value ",") in "index.twig" at line 1, column 7.'
});

import {runTest} from "../TestBase";

runTest({
    description: 'An error is thrown on malformed method arguments',
    templates: {
        "index.twig": '{{ dump(a b) }}'
    },
    expectedErrorMessage: 'TwingParsingError: Unexpected token "name" of value "b" ("punctuation" expected with value ",") in "index.twig" at line 1, column 11.'
});

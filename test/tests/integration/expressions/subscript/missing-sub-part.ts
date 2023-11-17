import {runTest} from "../../TestBase";

runTest({
    description: 'An error is thrown on missing attribute accessor sub-part',
    templates: {
        "index.twig": '{{ a. }}'
    },
    expectedErrorMessage: 'TwingParsingError: Expected name or number in "index.twig" at line 1, column 6.'
});

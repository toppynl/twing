import {runTest} from "../../TestBase";

runTest({
    description: '"parent" function outside of a block',
    templates: {
        "index.twig": '{{ parent() }}'
    },
    expectedErrorMessage: 'TwingParsingError: Calling "parent" outside a block is forbidden in "index.twig" at line 1, column 4.'
});

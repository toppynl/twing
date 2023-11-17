import {runTest} from "../../TestBase";

runTest({
    description: 'defined test for a binary expression',
    templates: {
        'index.twig': '{{ (i == 2) is defined }}'
    },
    expectedErrorMessage: 'TwingParsingError: The "defined" test only works with simple variables in "index.twig" at line 1.'
})

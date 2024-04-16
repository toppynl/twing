import {runTest} from "../../TestBase";

runTest({
    description: '"sort" filter only works with iterables',
    templates: {
        "index.twig": `{{ 5|sort }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: The sort filter only works with iterables, got "number" in "index.twig" at line 1, column 6.'
})

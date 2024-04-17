import {runTest} from "../../TestBase";

runTest({
    description: '"include" function with null argument',
    templates: {
        "index.twig": '{{ include(null) }}'
    },
    expectedErrorMessage: 'TwingRuntimeError: Unable to find template "" in "index.twig" at line 1, column 4.'
});

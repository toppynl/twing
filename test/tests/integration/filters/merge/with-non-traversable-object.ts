import {runTest} from "../../TestBase";

runTest({
    description: '"merge" filter with non-traversable object as first argument',
    templates: {
        "index.twig": `{{ 5|merge({}) }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: The merge filter only works on arrays or "Traversable", got "number" in "index.twig" at line 1, column 6.'
});

runTest({
    description: '"merge" filter with non-traversable object as second argument',
    templates: {
        "index.twig": `{{ {}|merge(5) }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: The merge filter only accepts arrays or "Traversable" as source, got "number" in "index.twig" at line 1, column 7.'
});

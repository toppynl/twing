import {runTest} from "../../TestBase";

runTest({
    description: '"merge" filter with null as first argument',
    templates: {
        "index.twig": `{{ null|merge({}) }}`
    },
    expectedErrorMessage: `TwingRuntimeError: The merge filter only works on arrays or "Traversable", got "null" in "index.twig" at line 1.`
});

runTest({
    description: '"merge" filter with null as second argument',
    templates: {
        "index.twig": `{{ {}|merge(null) }}`
    },
    expectedErrorMessage: `TwingRuntimeError: The merge filter only accepts arrays or "Traversable" as source, got "null" in "index.twig" at line 1.`
});

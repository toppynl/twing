import {runTest} from "../../TestBase";

runTest({
    description: '"column" filter only works with arrays or traversable',
    templates: {
        "index.twig": `{{ 5|column("foo") }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: The column filter only works with arrays or "Traversable", got "number" as first argument in "index.twig" at line 1, column 6.'
});

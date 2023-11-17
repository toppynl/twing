import {runTest} from "../../TestBase";

runTest({
    description: '"trim" filter with an unsupported side',
    templates: {
        "index.twig": `{{ 5|trim(side="foo") }}`
    },
    expectedErrorMessage: 'TwingRuntimeError: Trimming side must be "left", "right" or "both" in "index.twig" at line 1.'
});

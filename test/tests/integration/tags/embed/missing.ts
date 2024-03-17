import {runTest} from "../../TestBase";

runTest({
    description: '"embed" tag with missing template',
    templates: {
        'index.twig': `{% embed "missing" %}{% endembed %}`
    },
    expectedErrorMessage: `TwingRuntimeError: Unable to find template "missing" in "index.twig" at line 1, column 4.`
});



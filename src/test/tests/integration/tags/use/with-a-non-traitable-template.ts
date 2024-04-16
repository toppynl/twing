import {runTest} from "../../TestBase";

runTest({
    description: '"use" tag with a non-traitable template',
    templates: {
        "index.twig": '{% use "macros.twig" %}',
        'macros.twig': '{{ foo }}'
    },
    expectedErrorMessage: 'TwingRuntimeError: Template macros.twig cannot be used as a trait in "index.twig" at line 1, column 8.'
});

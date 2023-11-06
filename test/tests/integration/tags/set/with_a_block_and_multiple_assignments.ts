import {runTest} from "../../TestBase";

runTest({
    description: '"set" tag with a block and multiple assignments',
    templates: {
        'index.twig': '{% set foo, bar %}{% endset %}'
    },
    expectedErrorMessage: 'TwingParsingError: When using set with a block, you cannot have a multi-target in "index.twig" at line 1.'
});

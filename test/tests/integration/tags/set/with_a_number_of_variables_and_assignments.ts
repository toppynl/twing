import {runTest} from "../../TestBase";

runTest({
    description: '"set" tag with different number of variables and assignments',
    templates: {
        'index.twig': '{% set foo, bar = "foo" %}'
    },
    expectedErrorMessage: 'TwingParsingError: When using set, you must have the same number of variables and assignments in "index.twig" at line 1.'
});

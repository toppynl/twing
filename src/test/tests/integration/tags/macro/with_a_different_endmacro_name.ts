import {runTest} from "../../TestBase";

runTest({
    description: '"macro" tag with a different endmacro name',
    templates: {
        'index.twig': `
{% macro foo() %}{% endmacro bar %}`
    },
    expectedErrorMessage: 'TwingParsingError: Expected endmacro for macro "foo" (but "bar" given) in "index.twig" at line 2, column 30.'
});

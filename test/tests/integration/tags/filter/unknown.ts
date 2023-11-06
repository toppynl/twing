import {runTest} from "../../TestBase";

runTest({
    description: '"filter" tag referencing an unknown filter',
    environmentOptions: {
        parserOptions: {
            strict: false
        }
    },
    templates: {
        'index.twig': '{% filter foo %}{% endfilter %}'
    },
    expectedErrorMessage: 'TwingCompilationError: Unknown filter "foo" in "index.twig" at line 1.'
});

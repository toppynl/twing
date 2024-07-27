import {runTest} from "../../../TestBase";

runTest({
    description: '"filter" tag is unsupported by specification level 3',
    templates: {
        "index.twig": '{% filter upper %}{% endfilter %}'
    },
    environmentOptions: {
        parserOptions: {
            strict: true,
            level: 3
        }
    },
    synchronousEnvironmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    expectedErrorMessage: 'TwingParsingError: Unknown "filter" tag in "index.twig" at line 1, column 4.'
});

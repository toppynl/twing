import {runTest} from "../../../TestBase";

runTest({
    description: '"spaceless" tag is unsupported by specification level 3',
    templates: {
        "index.twig": '{% spaceless %}{% endspaceless %}'
    },
    environmentOptions: {
        parserOptions: {
            strict: true,
            level: 3
        }
    },
    expectedErrorMessage: 'TwingParsingError: Unknown "spaceless" tag in "index.twig" at line 1, column 4.'
});
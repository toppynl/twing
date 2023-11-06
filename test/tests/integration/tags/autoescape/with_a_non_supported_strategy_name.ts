import {runTest} from "../../TestBase";

runTest({
    description: '"autoescape" tag with a non-string, non-false strategy name',
    templates: {
        'index.twig': '{% autoescape 5 %}{% endautoescape %}'
    },
    expectedErrorMessage: 'TwingParsingError: An escaping strategy must be a string or false in "index.twig" at line 1.'
});

runTest({
    description: '"autoescape" tag with a variable as strategy name',
    templates: {
        'index.twig': '{% autoescape foo %}{% endautoescape %}'
    },
    context: Promise.resolve({
        foo: 'html'
    }),
    expectedErrorMessage: 'TwingParsingError: An escaping strategy must be a string or false in "index.twig" at line 1.'
});

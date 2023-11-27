import {runTest} from "../../TestBase";

runTest({
    description: '"autoescape" tag with a non-string, non-false strategy name',
    templates: {
        'index.twig': '{% autoescape 5 %}{% endautoescape %}'
    },
    expectedErrorMessage: 'TwingParsingError: An escaping strategy must be a string or false in "index.twig" at line 1, column 15.'
});

runTest({
    description: '"autoescape" tag with a non-supported strategy name',
    templates: {
        'index.twig': `
{% autoescape "bar" %}{{ foo }}{% endautoescape %}`
    },
    context: Promise.resolve({
        foo: 'html'
    }),
    expectedErrorMessage: 'TwingRuntimeError: Invalid escaping strategy "bar" (valid ones: css, custom, html, html_attr, js, url) in "index.twig" at line 2, column 26.'
});

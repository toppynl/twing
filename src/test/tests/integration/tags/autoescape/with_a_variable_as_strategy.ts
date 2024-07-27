import {runTest} from "../../TestBase";

runTest({
    description: '"autoescape" tag with a variable as strategy',
    templates: {
        'index.twig': `
{% autoescape strategy %}
<br/>
{% endautoescape %}
`
    },
    context: {
        strategy: 'html'
    },
    expectedErrorMessage: 'TwingParsingError: An escaping strategy must be a string or false in "index.twig" at line 2, column 15.'
})

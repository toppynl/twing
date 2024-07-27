import {runTest} from "../TestBase";

runTest({
    description: 'Implicit auto-escaping applies auto-escaping at the root of the template',
    templates: {
        "index.twig": `
{% set br = "<br/>" %}
{{ br }}
{% autoescape false %}
    {{ br }}
{% endautoescape %}
{{ br }}
`
    },
    environmentOptions: {
        autoEscapingStrategy: 'html'
    },
    synchronousEnvironmentOptions: {
        autoEscapingStrategy: 'html'
    },
    expectation: `
&lt;br/&gt;
    <br/>
&lt;br/&gt;
`
});

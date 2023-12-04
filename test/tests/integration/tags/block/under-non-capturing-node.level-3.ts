import {runTest} from "../../TestBase";

// @see https://github.com/twigphp/Twig/issues/3926 to understand why we need an extends tag to trigger the error
runTest({
    description: '"block" tag under a non-capturing node when targeting specification level 3',
    templates: {
        "index.twig": `
{% extends "layout.twig" %}

{% if false %}
    {% block content %}FOO{% endblock %}
{% endif %}
`,
        'layout.twig': `
{% block content %}{% endblock %}`
    },
    environmentOptions: {
        parserOptions: {
            level: 3
        }
    },
    expectedErrorMessage: `TwingParsingError: A block definition cannot be nested under non-capturing nodes in "index.twig" at line 5, column 8.`
});
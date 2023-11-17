import {runTest} from "../TestBase";

runTest({
   description: 'An error is throw when using the parent function on a template that has no parent',
   templates: {
       "index.twig": `
{% use 'trait.twig' %}
{% block foo %}
{{ parent() }}
{% endblock %}
`,
       'trait.twig': `
{% block bar %}Hello{% endblock %}
`
   },
    expectedErrorMessage: 'TwingRuntimeError: The template has no parent and no traits defining the "foo" block in "index.twig" at line 4.'
});

runTest({
    description: 'An error is throw when using the parent function on a template that has no parent, one step deeper',
    templates: {
        "index.twig": `
{% extends "parent.twig" %}
`,
        'trait.twig': `
{% block bar %}Hello{% endblock %}

`,
        'parent.twig': `
{% use 'trait.twig' %}
{% block foo %}
{{ parent() }}
{% endblock %}
`
    },
    expectedErrorMessage: 'TwingRuntimeError: The template has no parent and no traits defining the "foo" block in "parent.twig" at line 4.'
});

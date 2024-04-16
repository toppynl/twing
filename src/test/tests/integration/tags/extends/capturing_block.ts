import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return 'capturing "block" tag with "extends" tag';
    }

    getTemplates() {
        return {
            'index.twig': `
{% extends "layout.twig" %}

{% set foo %}
    {%- block content %}FOO{% endblock %}
{% endset %}

{% block content1 %}BAR{{ foo }}{% endblock %}`,
            'layout.twig': `
{% block content %}{% endblock %}
{% block content1 %}{% endblock %}`
        };
    }

    getExpected() {
        return `
FOOBARFOO
`;
    }


    getContext() {
        return {};
    }
}

runTest(createIntegrationTest(new Test));

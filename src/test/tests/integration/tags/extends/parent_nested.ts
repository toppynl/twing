import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription(): string {
        return '"inheritance" - nested parent';
    }

    getTemplates() {
        return {
            'foo.twig': `
{% block content %}
    BAR
{% endblock %}`,
            'index.twig': `
{% extends "foo.twig" %}

{% block content %}
    {% block inside %}
        INSIDE OVERRIDDEN
    {% endblock %}

    BEFORE
    {{ parent() }}
    AFTER
{% endblock %}`
        };
    }

    getExpected() {
        return `

INSIDE OVERRIDDEN
    
    BEFORE
        BAR

    AFTER
`;
    }
}

runTest(createIntegrationTest(new Test));

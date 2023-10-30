import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function with missing nested template';
    }

    getTemplates() {
        return {
            'index.twig': `
{% extends "base.twig" %}

{% block content %}
    {{ parent() }}
{% endblock %}`,
            'base.twig': `
{% block content %}
    {{ include("foo.twig") }}
{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingErrorLoader: Template "foo.twig" is not defined in "base.twig" at line 3.';
    }
}

runTest(createIntegrationTest(new Test()));

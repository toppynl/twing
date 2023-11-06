import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getName() {
        return 'tags/include/missing_nested';
    }

    getTemplates() {
        return {
            'base.twig': `
{% block content %}
    {% include "foo.twig" %}
{% endblock %}`,
            'index.twig': `
{% extends "base.twig" %}

{% block content %}
    {{ parent() }}
{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Template "foo.twig" is not defined in "base.twig" at line 3.'
    }
}

runTest(createIntegrationTest(new Test));

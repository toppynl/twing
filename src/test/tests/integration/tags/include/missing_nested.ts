import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription(): string {
        return '"include" tag with missing nested template';
    }

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
        return 'TwingRuntimeError: Unable to find template "foo.twig" in "base.twig" at line 3, column 8.'
    }
}

runTest(createIntegrationTest(new Test));

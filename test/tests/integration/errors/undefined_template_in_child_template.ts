import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Exception for an undefined template in a child template';
    }

    getTemplates() {
          return {
            'index.twig': `
{% extends 'base.twig' %}

{% block sidebar %}
    {{ include('include.twig') }}
{% endblock %}`,
            'base.twig': `
{% block sidebar %}
{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingRuntimeError: Unable to find template "include.twig" in "index.twig" at line 5.';
    }
}

runTest(createIntegrationTest(new Test));

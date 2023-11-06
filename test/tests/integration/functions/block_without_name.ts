import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"block" function without arguments';
    }

    getTemplates() {
        return {
            'index.twig': `
{% extends 'base.twig' %}
{% block bar %}BAR{% endblock %}`,
            'base.twig': `
{% block foo %}{{ block() }}{% endblock %}
{% block bar %}BAR_BASE{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: The "block" function takes one argument (the block name) in "base.twig" at line 2.';
    }
}

runTest(createIntegrationTest(new Test()));

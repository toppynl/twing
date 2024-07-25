import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getName() {
        return 'functions/undefined_block';
    }

    getDescription() {
        return '"block" function with undefined block';
    }

    getTemplates() {
        return {
            'index.twig': `
{% extends "base.twig" %}
{% block foo %}{{ parent() }}{{ block('unknown') }}{{ block('bar') }}{% endblock %}`,
            'base.twig': `
{% block foo %}Foo{% endblock %}
{% block bar %}Bar{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        // @see https://github.com/twigphp/Twig/issues/2753
        return 'TwingRuntimeError: Block "unknown" on template "base.twig" does not exist in "index.twig" at line 3, column 33.';
    }

    getContext() {
        return {};
    }
}

runTest(createIntegrationTest(new Test()));

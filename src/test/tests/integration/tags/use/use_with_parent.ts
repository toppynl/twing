import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"use" tag with a parent block';
    }

    getTemplates() {
        return {
            'blocks.twig': `
{% block content 'BLOCK' %}`,
            'index.twig': `
{% extends "parent.twig" %}

{% use 'blocks.twig' %}

{% block body %}
    {{ parent() -}}
    CHILD
    {{ block('content') }}
{% endblock %}`,
            'parent.twig': `
{% block body %}
    PARENT
{% endblock %}`
        };
    }

    getExpected() {
        return `
PARENT
CHILD
    BLOCK
`;
    }

}

runTest(createIntegrationTest(new Test));

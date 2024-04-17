import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"use" tag';
    }

    getTemplates() {
        return {
            'bar.twig': `
{% block content 'bar' %}
{% block bar 'bar' %}`,
            'foo.twig': `
{% use "bar.twig" %}

{% block content 'foo' %}
{% block foo 'foo' %}`,
            'index.twig': `
{% use "foo.twig" %}

{{ block('content') }}
{{ block('foo') }}
{{ block('bar') }}`
        };
    }

    getExpected() {
        return `
foo
foo
bar
`;
    }

}

runTest(createIntegrationTest(new Test));

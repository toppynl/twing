import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getName() {
        return 'exceptions/child_contents_outside_blocks';
    }

    getDescription() {
        return 'Exception for child templates defining content outside blocks defined by parent';
    }

    getTemplates() {
        return {
            'index.twig': `
{% extends 'base.twig' %}

Content outside a block.

{% block sidebar %}
    Content inside a block.
{% endblock %}`,
            'base.twig': `
{% block sidebar %}
{% endblock %}`
        };
    }

    getExpectedErrorMessage() {
        return 'TwingParsingError: A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag in "index.twig" at line 3, column 1?';
    }
}

runTest(createIntegrationTest(new Test));

runTest({
    description: 'Exception is thrown for child templates defining content outside blocks defined by parent, when the content starts with a BOM',
    templates: {
        'index.twig': `
{% extends 'base.twig' %}

${String.fromCharCode(0xEF, 0xBB, 0xBF)}Content outside a block.

{% block sidebar %}
    Content inside a block.
{% endblock %}`,
        'base.twig': `
{% block sidebar %}
{% endblock %}`
    },
    expectedErrorMessage: 'TwingParsingError: A template that extends another one cannot include content outside Twig blocks. Did you forget to put the content inside a {% block %} tag in "index.twig" at line 3, column 1?'
});

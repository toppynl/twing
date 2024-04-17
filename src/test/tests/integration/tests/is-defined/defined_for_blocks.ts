import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

/**
 * Note that the expected result from the original TwigPHP test is incorrect - but for some reason, the test passes successfully on TwigPHP.
 * @see * https://twigfiddle.com/22p2t1
 */
class Test extends TestBase {
    getName() {
        return 'tests/defined_for_blocks';
    }

    getDescription() {
        return '"defined" support for blocks';
    }

    getTemplates() {
        return {
            'index.twig': `{% extends 'parent' %}
{% block icon %}icon{% endblock %}
{% block body %}
    {{ parent() }}
    index::foo {{ block('foo') is defined ? 'ok' : 'ko' }}
    index::footer {{ block('footer') is defined ? 'ok' : 'ko' }}
    index::icon {{ block('icon') is defined ? 'ok' : 'ko' }}
    index::block1 {{ block('block1') is defined ? 'ok' : 'ko' }}
    {%- embed 'embed' %}
        {% block content %}content{% endblock %}
    {% endembed %}
{% endblock %}
{% use 'blocks' %}`,
            'blocks': `{% block block1 %}{%endblock %}
`,
            'embed': `embed::icon {{ block('icon') is defined ? 'ok' : 'ko' }}
embed::content {{ block('content') is defined ? 'ok' : 'ko' }}
embed::block1 {{ block('block1') is defined ? 'ok' : 'ko' }}`,
            'parent': `{% block body %}
    parent::icon {{ block('icon') is defined ? 'ok' : 'ko' -}}
{% endblock %}
{% block footer %}{% endblock %}`
        };
    }

    getExpected() {
        return `
parent::icon ok
    index::foo ko
    index::footer ok
    index::icon ok
    index::block1 okembed::icon ko
embed::content ok
embed::block1 ko
`;
    }
}

runTest(createIntegrationTest(new Test));

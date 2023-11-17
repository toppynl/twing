import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";

class Test extends TestBase {
    getDescription() {
        return '"block" function with a template argument';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ block('foo', 'included.twig') }}
{{ block('foo', included_loaded) }}
{{ block('foo', included_loaded_internal) }}
{% set output = block('foo', 'included.twig') %}
{{ output }}
{% block foo %}NOT FOO{% endblock %}`,
            'included.twig': `
{% block foo %}FOO{% endblock %}`
        };
    }

    getExpected() {
        return `
FOO
FOO
FOO
FOO
NOT FOO
`;
    }

    async getContext() {
        const environment = createEnvironment(
            createArrayLoader({
                'included.twig': `
{% block foo %}FOO{% endblock %}`
            })
        );

        return environment.loadTemplate('included.twig')
            .then((template) => {
                return {
                    included_loaded: template,
                    included_loaded_internal: template
                }
            });
    }
}

runTest(createIntegrationTest(new Test()));

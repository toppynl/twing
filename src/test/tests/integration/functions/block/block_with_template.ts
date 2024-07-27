import {runTest} from "../../TestBase";
import {createEnvironment, createSynchronousEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../main/lib/loader/array";

const template = createSynchronousEnvironment(createSynchronousArrayLoader({
    'included.twig': `
{% block foo %}FOO{% endblock %}`
})).loadTemplate('included.twig');

runTest(({
    description: '"block" function with a template argument',
    templates: {
        'index.twig': `
{{ block('foo', 'included.twig') }}
{{ block('foo', included_loaded) }}
{{ block('foo', included_loaded_internal) }}
{% set output = block('foo', 'included.twig') %}
{{ output }}
{% block foo %}NOT FOO{% endblock %}`,
        'included.twig': `
{% block foo %}FOO{% endblock %}`
    },
    trimmedExpectation: `
FOO
FOO
FOO
FOO
NOT FOO
`,
    context: new Promise((resolve) => {
        const environment = createEnvironment(
            createArrayLoader({
                'included.twig': `
{% block foo %}FOO{% endblock %}`
            })
        );

        resolve(environment.loadTemplate('included.twig')
            .then((template) => {
                return {
                    included_loaded: template,
                    included_loaded_internal: template
                }
            }));
    }),
    synchronousContext: {
        included_loaded: template,
        included_loaded_internal: template
    }
}));

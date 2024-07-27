import {runTest} from "../../TestBase";
import {createEnvironment, createSynchronousEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../main/lib/loader/array";

runTest({
    description: '"extends" tag with template instance',
    templates: {
        'foo.twig': `
{% block content %}BAR{% endblock %}`,
        'index.twig': `
{% extends foo %}

{% block content %}
    {{ parent() }}FOO
{% endblock %}`
    },
    trimmedExpectation: `
BARFOO
`,
    context: new Promise((resolve) => {
        const environment = createEnvironment(
            createArrayLoader({
                'foo.twig': `
{% block content %}BAR{% endblock %}`
            })
        );

        resolve(environment.loadTemplate('foo.twig')
            .then((template) => {
                return {
                    foo: template
                }
            })
        );
    }),
    synchronousContext: {
        foo: createSynchronousEnvironment(
            createSynchronousArrayLoader({
                'foo.twig': `
{% block content %}BAR{% endblock %}`
            })
        ).loadTemplate('foo.twig')
    }
});

runTest({
    description: '"extends" tag with template instance',
    templates: {
        'foo.twig': `
{% block content %}BAR{% endblock %}`,
        'index.twig': `
{% extends foo %}

{% block content %}
    {{ parent() }}FOO
{% endblock %}`
    },
    trimmedExpectation: `
BARFOO
`,
    context: new Promise((resolve) => {
        const environment = createEnvironment(
            createArrayLoader({
                'foo.twig': `
{% block content %}BAR{% endblock %}`
            })
        );

        resolve(environment.loadTemplate('foo.twig')
            .then((template) => {
                return {
                    foo: template
                };
            })
        );
    }),
    synchronousContext: {
        foo: createSynchronousEnvironment(
            createSynchronousArrayLoader({
                'foo.twig': `
{% block content %}BAR{% endblock %}`
            })
        ).loadTemplate('foo.twig')
    }
});

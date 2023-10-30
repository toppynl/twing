import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {createEnvironment} from "../../../../../src/lib/environment";
import {TwingLoaderArray} from "../../../../../src";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
{% block content %}BAR{% endblock %}`,
            'index.twig': `
{% extends foo %}

{% block content %}
    {{ parent() }}FOO
{% endblock %}`
        };
    }

    getExpected() {
        return `
BARFOO
`;
    }


    async getContext() {
        const environment = createEnvironment(
            new TwingLoaderArray({
                'foo.twig': `
{% block content %}BAR{% endblock %}`
            })
        );

        return environment.loadTemplate('foo.twig')
            .then((template) => {
                return {
                    foo: template
                }
            });
    }
}

runTest(createIntegrationTest(new Test));

import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";

class Test extends TestBase {
    getName() {
        return 'tests/defined_for_blocks_with_template';
    }

    getDescription() {
        return '"defined" support for blocks with a template argument';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ block('foo', 'included.twig') is defined ? 'ok' : 'ko' }}
{{ block('foo', included_loaded) is defined ? 'ok' : 'ko' }}
{{ block('foo', included_loaded_internal) is defined ? 'ok' : 'ko' }}`,
            'included.twig': `
{% block foo %}FOO{% endblock %}`
        };
    }

    getExpected() {
        return `
ok
ok
ok
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
                };
            });
    }
    
    getType(): "template" | "execution context" | undefined {
        return "execution context";
    }
}

runTest(createIntegrationTest(new Test));

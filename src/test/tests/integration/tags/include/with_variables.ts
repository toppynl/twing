import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription(): string {
        return '"include" tag with variables';
    }

    getTemplates() {
        return {
            'foo.twig': `{{ foo }}
`,
            'index.twig': `{% include "foo.twig" with {'foo': 'bar'} %}
{% include "foo.twig" with vars %}
{% include "foo.twig" with vars_as_obj %}`
        };
    }

    getContext() {
        return {
            vars: new Map([['foo', 'bar']]),
            vars_as_obj: {
                foo: 'bar'
            }
        };
    }

    getExpected() {
        return `bar
bar
bar
`;
    }

}

runTest(createIntegrationTest(new Test));

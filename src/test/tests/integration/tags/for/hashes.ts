import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag can iterate over hashes';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for key, item in items %}
  * {{ key }}/{{ item }}
{% endfor %}`
        };
    }

    getExpected() {
        return `
  * 0/a
  * b/1
`;
    }


    getContext() {
        return {
            items: {
                0: 'a',
                b: 1
            }
        };
    }
}

runTest(createIntegrationTest(new Test));

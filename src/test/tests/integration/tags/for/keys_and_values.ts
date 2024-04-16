import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"for" tag can iterate over keys and values';
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
  * 1/b
`;
    }


    getContext() {
        return {
            items: [
                'a',
                'b'
            ]
        };
    }
}

runTest(createIntegrationTest(new Test));

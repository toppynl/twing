import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"shuffle" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set result = items|shuffle %}
{{ result|length }}
{{ result|sort|join(',') }}
`
        };
    }

    getExpected() {
        return `
3
a,b,c
`;
    }

    getContext() {
        return {
            items: ['a', 'b', 'c']
        };
    }
}

runTest(createIntegrationTest(new Test()));

import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing allows to use named operators as variable names';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for match in matches %}
    {{- match }}
{% endfor %}
{{ in }}
{{ is }}`
        };
    }

    getExpected() {
        return `
1
2
3
in
is
`;
    }

    getContext() {
        return {
            matches: [1, 2, 3],
            in: 'in',
            is: 'is'
        }
    }
}

runTest(createIntegrationTest(new Test));

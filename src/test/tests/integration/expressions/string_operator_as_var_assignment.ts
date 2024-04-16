import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports the string operators as variable names in assignments';
    }

    getTemplates() {
        return {
            'index.twig': `
{% for matches in [1, 2] %}
    {{- matches }}
{% endfor %}

{% set matches = [1, 2] %}

OK
`
        };
    }

    getExpected() {
        return `
1
2


OK`;
    }

    getContext() {
        return {}
    }
}

runTest(createIntegrationTest(new Test));

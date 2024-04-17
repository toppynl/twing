import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Whitespace trimming on tags (right side).';
    }

    getTemplates() {
        return {
            'index.twig': `
**{% if true -%}

    \t    foo{% endif %}**

**{{ 'foo' -}}

**

**{# comment -#}

**

**{% verbatim -%}

foo{% endverbatim %}**
`
        };
    }

    getExpected() {
        return `
**foo**

**foo**

****

**foo**
`;
    }
}

runTest(createIntegrationTest(new Test));

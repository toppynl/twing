import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Whitespace trimming on tags (left side).';
    }

    getTemplates() {
        return {
            'index.twig': `
**{% if true %}
foo

    \t    {%- endif %}**

**

\t    {{- 'foo' }}**

**


{#- comment #}**

**{% verbatim %}
foo

    \t    {%- endverbatim %}**
`
        };
    }

    getExpected() {
        return `
**foo**

**foo**

****

**
foo**
`;
    }
}

runTest(createIntegrationTest(new Test));

import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Line whitespace trimming on tags (right side).';
    }

    getTemplates() {
        return {
            'index.twig': `
**{% if true ~%}
foo{% endif %}**

**{{ 'foo' ~}}
foo
**

**{# comment ~#}
\tfoo
**

**{% verbatim ~%}
    foo{% endverbatim %}**
`
        };
    }

    getExpected() {
        return `
**
foo**

**foo
foo
**

**
\tfoo
**

**
    foo**
`;
    }
}

runTest(createIntegrationTest(new Test));

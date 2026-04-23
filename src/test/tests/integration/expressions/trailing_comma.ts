import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'trailing comma is allowed in function calls, method calls, and filter calls';
    }

    getTemplates() {
        return {
            'index.twig': `
{# trailing comma in function call #}
{{ max(1, 2, 3,) }}

{# trailing comma in method call #}
{{ obj.method(1, 2,) }}

{# trailing comma in filter call #}
{{ 'hello'|slice(1, 3,) }}
`
        };
    }

    getExpected() {
        return `
3

foo

ell
`;
    }

    getContext() {
        return {
            obj: {
                method: (_a: unknown, _b: unknown) => 'foo'
            }
        };
    }
}

runTest(createIntegrationTest(new Test()));

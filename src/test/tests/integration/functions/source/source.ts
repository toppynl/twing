import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"source" function';
    }

    getTemplates() {
        return {
            'index.twig': `
FOO
{{ source("foo.twig") }}
{# named arguments with equals #}
{{ source(name = "foo.twig") }}
{{ source(ignore_missing = true, name = "missing.twig") }}
{# named arguments with colon #}
{{ source(name: "foo.twig") }}
{{ source(ignore_missing: true, name: "missing.twig") }}

BAR`,
            'foo.twig': `
{{ foo }}<br />`
        };
    }

    getExpected() {
        return `
FOO

{{ foo }}<br />

{{ foo }}<br />


{{ foo }}<br />


BAR
`;
    }
}

runTest(createIntegrationTest(new Test()));

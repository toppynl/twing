import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" tag with "only" directive';
    }

    getTemplates() {
        return {
            'foo.twig': `
{% for k, v in _context %}{{ k }},{% endfor %}`,
            'index.twig': `
{% include "foo.twig" only %}
`
        };
    }

    getExpected() {
        return `
global,_parent,`;
    }
}

runTest(createIntegrationTest(new Test));

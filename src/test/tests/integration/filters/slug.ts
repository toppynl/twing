import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"slug" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ 'Hello World'|slug }}
{{ 'Héllo Wörld'|slug }}
{{ '  multiple   spaces  '|slug }}
{{ 'Hello World'|slug('_') }}
{{ 'already-a-slug'|slug }}
`
        };
    }

    getExpected() {
        return `
hello-world
hello-world
multiple-spaces
hello_world
already-a-slug
`;
    }
}

runTest(createIntegrationTest(new Test()));

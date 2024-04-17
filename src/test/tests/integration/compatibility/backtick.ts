import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getName() {
        return 'backtick support';
    }

    getDescription() {
        return 'backticks';
    }

    getTemplates() {
        return {
            'index.twig': `{# Foo \`bar\` #}
Foo \`bar\`
`
        };
    }

    getExpected() {
        return `Foo \`bar\``;
    }
}

runTest(createIntegrationTest(new Test));

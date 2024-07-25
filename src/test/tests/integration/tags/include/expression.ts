import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getTemplates() {
        return {
            'foo.twig': `
FOOBAR`,
            'index.twig': `
FOO
{% include foo %}

BAR`
        };
    }

    getExpected() {
        return `
FOO

FOOBAR
BAR`;
    }


    getContext() {
        return {
            foo: 'foo.twig'
        }
    }
}

runTest(createIntegrationTest(new Test));

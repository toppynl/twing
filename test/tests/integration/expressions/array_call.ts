import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return 'Twing supports method calls';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ items.foo }}
{{ items['foo'] }}
{{ items[foo] }}
{{ items[items[foo]] }}`
        };
    }

    getExpected() {
        return `
bar
bar
foo
bar
`;
    }

    getContext() {
        return {
            foo: 'bar',
            items: {
                foo: 'bar',
                bar: 'foo'
            }
        }
    }
}

runTest(createIntegrationTest(new Test));

import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"capitalize" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ "i like Twing."|capitalize }}
{{ undef|capitalize }}`
        };
    }

    getExpected() {
        return `
I like Twing.`;
    }

    getContext(): any {
        return {
            undef: undefined
        };
    }
}

runTest(createIntegrationTest(new Test()));

import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions} from "../../../../src/lib/environment";

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
    
    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            strictVariables: false
        };
    }
}

runTest(createIntegrationTest(new Test()));

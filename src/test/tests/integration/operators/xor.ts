import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions, TwingSynchronousEnvironmentOptions} from "../../../../main/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"xor" logical operator';
    }

    getTemplates() {
        return {
            'index.twig': `{{ (true xor true) ? 'ko' : 'ok' }}
{{ (true xor false) ? 'ok' : 'ko' }}
{{ (false xor true) ? 'ok' : 'ko' }}
{{ (false xor false) ? 'ko' : 'ok' }}`
        };
    }

    getExpected() {
        return `ok
ok
ok
ok`;
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            parserOptions: {
                level: 3
            }
        };
    }

    getSynchronousEnvironmentOptions(): TwingSynchronousEnvironmentOptions {
        return {
            parserOptions: {
                level: 3
            }
        };
    }
}

runTest(createIntegrationTest(new Test));

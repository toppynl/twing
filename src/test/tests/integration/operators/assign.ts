import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions, TwingSynchronousEnvironmentOptions} from "../../../../main/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"=" assignment expression operator';
    }

    getTemplates() {
        return {
            'index.twig': `{% do x = 42 %}{{ x }}
{% do a = b = 7 %}{{ a }},{{ b }}
{% do greeting = 'hello' %}{{ greeting }}`
        };
    }

    getExpected() {
        return `42
7,7
hello`;
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

runTest(createIntegrationTest(new Test()));

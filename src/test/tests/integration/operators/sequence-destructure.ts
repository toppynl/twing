import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions, TwingSynchronousEnvironmentOptions} from "../../../../main/lib/environment";

class Test extends TestBase {
    getDescription() {
        return 'sequence destructuring via = operator';
    }

    getTemplates() {
        return {
            'index.twig': `{% do [a, b, c] = arr %}{{ a }},{{ b }},{{ c }}
{% do [x, , z] = arr %}{{ x }},{{ z }}
{% do [p, q] = short %}{{ p }},{{ q }}`
        };
    }

    getExpected() {
        return `1,2,3
1,3
10,20`;
    }

    getContext() {
        return {
            arr: [1, 2, 3],
            short: [10, 20]
        };
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

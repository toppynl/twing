import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";
import {TwingEnvironmentOptions, TwingSynchronousEnvironmentOptions} from "../../../../main/lib/environment";

class Test extends TestBase {
    getDescription() {
        return 'object destructuring via = operator';
    }

    getTemplates() {
        return {
            'index.twig': `{% do {name, email} = user %}{{ name }},{{ email }}
{% do {title: heading} = article %}{{ heading }}
{% do {missing} = user %}{{ missing is null ? 'null' : missing }}`
        };
    }

    getExpected() {
        return `Alice,alice@example.com
Hello World
null`;
    }

    getContext() {
        return {
            user: new Map([['name', 'Alice'], ['email', 'alice@example.com']]),
            article: new Map([['title', 'Hello World']])
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

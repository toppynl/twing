import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {TwingEnvironmentOptions} from "../../../../../src/lib/environment";

class Test extends TestBase {
    getDescription() {
        return '"dump" function';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ dump('foo') }}
{{ dump(foo, bar) }}`
        };
    }

    getExpected() {
        return `
string(3) "foo"

string(3) "foo"
string(3) "bar"
`;
    }

    getEnvironmentOptions(): TwingEnvironmentOptions {
        return {
            autoEscapingStrategy: "html"
        }
    }

    getContext() {
        return {
            foo: 'foo',
            bar: 'bar'
        }
    }
}

runTest(createIntegrationTest(new Test()));

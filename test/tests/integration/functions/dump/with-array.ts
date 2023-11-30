import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"dump" function with array';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ dump({
    foo: {
        bar: "foo.bar"
    }
}) }}
{{ dump() }}
`
        };
    }

    getExpected() {
        return `
array(1) {
    [foo] =>
    array(1) {
        [bar] =>
        string(7) "foo.bar"
    }
}

array(2) {
    [foo] =>
    string(3) "foo"
    [bar] =>
    string(3) "bar"
}
`;
    }
    
    getContext() {
        return {
            foo: 'foo',
            bar: 'bar'
        }
    }
}

runTest(createIntegrationTest(new Test()));

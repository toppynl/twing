import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

const DATE_W3C = 'DATE_W3C';

const Obj = class {
    public ARRAY_AS_PROPS: number = 2;
};

const object = new Obj();

class Test extends TestBase {
    getDescription() {
        return '"constant" function';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ constant('DATE_W3C') == expect ? 'true' : 'false' }}
{{ constant('ARRAY_AS_PROPS', object) }}
{# named arguments #}
{{ constant(name = 'DATE_W3C') == expect ? 'true' : 'false' }}
{{ constant(object = object, name = 'ARRAY_AS_PROPS') }}`
        };
    }

    getExpected() {
        return `
true
2
true
2`;
    }

    getContext() {
        return {
            DATE_W3C,
            expect: DATE_W3C,
            object: object
        }
    }
}

runTest(createIntegrationTest(new Test()));

import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"constant" test';
    }

    getTemplates() {
        return {
            'index.twig': `{{ 8 is constant('E_NOTICE') ? 'ok' : 'no' }}
{{ 'bar' is constant('TwigTestFoo::BAR_NAME') ? 'ok' : 'no' }}
{{ value is constant('TwigTestFoo::BAR_NAME') ? 'ok' : 'no' }}
{{ 2 is constant('ARRAY_AS_PROPS', object) ? 'ok' : 'no' }}`
        };
    }

    getExpected() {
        return `ok
ok
ok
ok`;
    }

    getContext() {
        const Obj = class {
            public ARRAY_AS_PROPS = 2;
        };

        return {
            value: 'bar',
            object: new Obj(),
            E_NOTICE: 8,
            'TwigTestFoo::BAR_NAME': 'bar'
        };
    }
}

runTest(createIntegrationTest(new Test));

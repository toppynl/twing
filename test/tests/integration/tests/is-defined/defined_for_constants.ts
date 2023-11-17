import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

const DATE_W3C = 'DATE_W3C';

class Test extends TestBase {
    getDescription() {
        return '"defined" support for constants';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ constant('DATE_W3C') is defined ? 'ok' : 'ko' }}
{{ constant('ARRAY_AS_PROPS', object) is defined ? 'ok' : 'ko' }}
{{ constant('FOOBAR') is not defined ? 'ok' : 'ko' }}
{{ constant('FOOBAR', object) is not defined ? 'ok' : 'ko' }}`
        };
    }

    getExpected() {
        return `
ok
ok
ok
ok
`;
    }

    getContext() {
        const Obj = class {
            public ARRAY_AS_PROPS = 2;
        };

        return {
            DATE_W3C,
            object: new Obj()
        }
    }
}

runTest(createIntegrationTest(new Test));

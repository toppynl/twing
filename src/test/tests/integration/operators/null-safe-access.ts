import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"?." null-safe attribute access operator';
    }

    getTemplates() {
        return {
            'index.twig': `{{ obj?.name }}
{{ nullVar?.name }}
{{ nullVar?.name ?? 'default' }}`
        };
    }

    getExpected() {
        return `hello

default`;
    }

    getContext() {
        return {
            obj: {name: 'hello'},
            nullVar: null as any
        };
    }
}

runTest(createIntegrationTest(new Test));

import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Test extends TestBase {
    getDescription() {
        return '"include" function accept variables';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include("foo.twig", {'foo': 'bar'}) }}
{{- include("foo.twig", vars) }}`,
            'foo.twig': `
{{ foo }}`
        };
    }

    getExpected() {
        return `
bar
bar
`;
    }

    getContext() {
        return {
            vars: {
                foo: 'bar'
            }
        }
    }
}

runTest(createIntegrationTest(new Test()));

import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";
import {createEnvironment, createSynchronousEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../main/lib/loader/array";

class Test extends TestBase {
    getDescription() {
        return '"include" function accepts Template instance';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ include(foo) }} FOO`,
            'foo.twig': `
BAR`
        };
    }

    getExpected() {
        return `
BAR FOO
`;
    }

    async getContext() {
        const environment = createEnvironment(
            createArrayLoader({
                'foo.twig': `
BAR`
            })
        );
        
        return environment.loadTemplate('foo.twig')
            .then((template) => {
                return {
                    foo: template
                }
            });
    }
    
    getSynchronousContext(): any {
        const environment = createSynchronousEnvironment(
            createSynchronousArrayLoader({
                'foo.twig': `
BAR`
            })
        );
        
        return {
            foo: environment.loadTemplate('foo.twig')
        }
    }
}

runTest(createIntegrationTest(new Test()));

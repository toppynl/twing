import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"map" filter on object';
    }

    getContext(): any {
        return {
            peoples: {
                Bob: 'Smith',
                Alice: 'Dupond'
            }
        };
    }

    getTemplates() {
        return {
            'index.twig': `
{{ peoples|map((value, key) => "#{key} #{value}")|join(', ') }}
`
        };
    }

    getExpected() {
        return `
Bob Smith, Alice Dupond
`;
    }
}

export default Test;

runTest(createIntegrationTest(new Test()));

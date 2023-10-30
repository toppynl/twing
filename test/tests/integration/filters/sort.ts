import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class Test extends TestBase {
    getDescription() {
        return '"sort" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ array1|sort|join }}
{{ array2|sort|join }}
{{ traversable|sort|join }}`
        };
    }

    getExpected() {
        return `
14
barfoo
123
`;
    }

    getContext() {
        return {
            array1: [4, 1],
            array2: ['foo', 'bar'],
            traversable: new Map([[0, 3], [1, 2], [2, 1]])
        }
    }
}

runTest(createIntegrationTest(new Test()));

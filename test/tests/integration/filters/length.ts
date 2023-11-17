import TestBase, {runTest} from "../TestBase";
import {createIntegrationTest} from "../test";

class CountableMock {
    length: number;

    constructor(count: number) {
        this.length = count;
    }

    toString() {
        throw new Error('toString shall not be called on Countables');
    }
}

class ToStringMock {
    value: string;

    constructor(value: string) {
        this.value = value;
    }

    toString() {
        return this.value;
    }
}

class Test extends TestBase {
    getDescription() {
        return '"length" filter';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ array|length }}
{{ string|length }}
{{ number|length }}
{{ to_string_able|length }}
{{ countable|length }}
{{ null|length }}
{{ non_countable|length }}
{{ empty_array|length }}`
        };
    }

    getExpected() {
        return `
2
3
4
6
42
0
1
0
`;
    }

    getContext() {
        return {
            array: [1, 4],
            string: 'foo',
            number: 1000,
            to_string_able: new ToStringMock('foobar'),
            countable: new CountableMock(42), // also asserts we do *not* call toString()
            'null': null,
            non_countable: {
                toString: '' // ensure that toString is not callable
            },
            empty_array: []
        } as any
    }
}

runTest(createIntegrationTest(new Test()));

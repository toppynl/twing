import TestBase, {runTest} from "../../TestBase";
import {createIntegrationTest} from "../../test";

class Foo {
    public array: any[];
    public position: number;

    constructor() {
        this.array = [];
        this.position = 0;
    }

    * [Symbol.iterator]() {
        yield 1;
        yield 2;
    }

    bar(param1: string | null = null, param2: string | null = null) {
        return 'bar' + (param1 ? '_' + param1 : '') + (param2 ? '-' + param2 : '');
    }

    getFoo() {
        return 'foo';
    }

    getSelf() {
        return this;
    }

    is() {
        return 'is';
    }

    in() {
        return 'in';
    }

    not() {
        return 'not';
    }
}

class Test extends TestBase {
    getDescription() {
        return '"attribute" function';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ attribute(obj, method) }}
{{ attribute(array, item) }}
{{ attribute(obj, "bar", ["a", "b"]) }}
{{ attribute(obj, "bar", arguments) }}
{{ attribute(obj, method) is defined ? 'ok' : 'ko' }}
{{ attribute(obj, nonmethod) is defined ? 'ok' : 'ko' }}`
        };
    }

    getExpected() {
        return `
foo
bar
bar_a-b
bar_a-b
ok
ko
`;
    }

    getContext() {
        return {
            obj: new Foo(),
            method: 'foo',
            array: {foo: 'bar'},
            item: 'foo',
            nonmethod: 'xxx',
            arguments: ['a', 'b']
        }
    }
}

runTest(createIntegrationTest(new Test()));

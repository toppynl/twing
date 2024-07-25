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
        return '"join" filter';
    }

    getTemplates() {
        return {
            'index.twig': `{{ ["foo", "bar"]|join(', ') }}
{{ foo|join(', ') }}
{{ bar|join(', ') }}

{{ ["foo", "bar"]|join(', ', ' and ') }}
{{ foo|join(', ', ' and ') }}
{{ bar|join(', ', ' and ') }}
{{ ["one", "two", "three"]|join(', ', ' and ') }}
{{ ["a", "b", "c"]|join('','-') }}
{{ ["a", "b", "c"]|join('-','-') }}
{{ ["a", "b", "c"]|join('-','') }}
{{ ["hello"]|join('|','-') }}

{{ {"a": "w", "b": "x", "c": "y", "d": "z"}|join }}
{{ {"a": "w", "b": "x", "c": "y", "d": "z"}|join(',') }}
{{ {"a": "w", "b": "x", "c": "y", "d": "z"}|join(',','-') }}
{{ {"a": "w", "b": "x", "c": "y", "d": "z"}|join }}
{{ 5|join }}
`
        };
    }

    getExpected() {
        return `foo, bar
1, 2
3, 4

foo and bar
1 and 2
3 and 4
one, two and three
ab-c
a-b-c
a-bc
hello

wxyz
w,x,y,z
w,x,y-z
wxyz

`;
    }

    getContext() {
        return {
            foo: new Foo(),
            bar: [3, 4]
        }
    }
}

runTest(createIntegrationTest(new Test()));

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
        return 'Twing supports the in operator when using objects';
    }

    getTemplates() {
        return {
            'index.twig': `
{% if object in object_list %}
TRUE
{% endif %}`
        };
    }

    getExpected() {
        return `
TRUE
`;
    }

    getContext() {
        let foo = new Foo();
        let foo1 = new Foo();

        return {
            object: foo,
            object_list: [foo1, foo],
        };
    }
}

runTest(createIntegrationTest(new Test));

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
        return 'Twing supports method calls';
    }

    getTemplates() {
        return {
            'index.twig': `
{{ items.foo.foo }}
{{ items.foo.getFoo() }}
{{ items.foo.bar }}
{{ items.foo['bar'] }}
{{ items.foo.bar('a', 43) }}
{{ items.foo.bar(foo) }}
{{ items.foo.self.foo() }}
{{ items.foo.is }}
{{ items.foo.in }}
{{ items.foo.not }}`
        };
    }

    getExpected() {
        return `
foo
foo
bar

bar_a-43
bar_bar
foo
is
in
not
`;
    }

    getContext() {
        return {
            foo: 'bar',
            items: {
                foo: new Foo(),
                bar: 'foo'
            }
        }
    }

    getEnvironmentOptions() {
        return {
            strictVariables: false
        }
    }
}

runTest(createIntegrationTest(new Test));

class AnotherFoo {
    oof: string;

    constructor() {
        this.oof = 'oof';
    }

    foo() {
        return 'foo';
    }

    getFoo() {
        return 'getFoo';
    }

    getBar() {
        return 'getBar';
    }

    isBar() {
        return 'isBar';
    }

    hasBar() {
        return 'hasBar';
    }

    isOof() {
        return 'isOof';
    }

    hasFooBar() {
        return 'hasFooBar';
    }

    __call() {

    }
}

runTest({
    description: `method call resolves methods by their name`,
    templates: {
        "index.twig": `{{ foo.foo }}`
    },
    context: Promise.resolve({
        foo: new AnotherFoo()
    }),
    trimmedExpectation: `foo`
});

runTest({
    description: `method call resolves get{name} if {name} does not exist`,
    templates: {
        "index.twig": `{{ foo.bar }}`
    },
    context: Promise.resolve({
        foo: new AnotherFoo()
    }),
    trimmedExpectation: `getBar`
});

runTest({
    description: `method call resolves is{name} if {name} and get{name} do not exist`,
    templates: {
        "index.twig": `{{ foo.Oof }}`
    },
    context: Promise.resolve({
        foo: new AnotherFoo()
    }),
    trimmedExpectation: `isOof`
});

runTest({
    description: `method call resolves has{name} if {name}, get{name} and is{name} do not exist`,
    templates: {
        "index.twig": `{{ foo.fooBar }}`
    },
    context: Promise.resolve({
        foo: new AnotherFoo()
    }),
    trimmedExpectation: `hasFooBar`
});

runTest({
    description: `method call resolves method in a case-insensitive way`,
    templates: {
        "index.twig": `{{ foo.getfoo }} {{ foo.GeTfOo }}`
    },
    context: Promise.resolve({
        foo: new AnotherFoo()
    }),
    trimmedExpectation: `getFoo getFoo`
});

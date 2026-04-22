import {runCase} from "../harness";

runCase({
    description: "cache miss renders body and stores result",
    template: `{% cache 'k' %}hello{% endcache %}`,
    expectation: "hello",
    assertCalls: (t, calls) => {
        t.equal(calls.length, 1, "one adapter call");
        t.ok(calls[0].executedBody, "body executed on miss");
        t.equal(calls[0].key, "k", "correct cache key");
    }
});

runCase({
    description: "cache hit returns cached string without executing body",
    template: `{% cache 'k' %}body-should-not-render{% endcache %}`,
    prePopulated: {"k": "cached"},
    expectation: "cached",
    assertCalls: (t, calls) => {
        t.equal(calls.length, 1, "one adapter call");
        t.notOk(calls[0].executedBody, "body not executed on hit");
    }
});

runCase({
    description: "dynamic key from context",
    template: `{% cache 'u_' ~ id %}u={{ id }}{% endcache %}`,
    context: {id: 42},
    expectation: "u=42",
    assertCalls: (t, calls) => {
        t.equal(calls[0].key, "u_42", "computed key");
    }
});

runCase({
    description: "ttl expression is passed to adapter",
    template: `{% cache 'k' ttl(300) %}x{% endcache %}`,
    expectation: "x",
    assertCalls: (t, calls) => {
        t.equal(calls[0].ttl, 300, "ttl passed through");
    }
});

runCase({
    description: "no ttl means null",
    template: `{% cache 'k' %}x{% endcache %}`,
    expectation: "x",
    assertCalls: (t, calls) => {
        t.equal(calls[0].ttl, null, "ttl defaults to null");
    }
});

runCase({
    description: "ttl from context variable",
    template: `{% cache 'k' ttl(seconds) %}x{% endcache %}`,
    context: {seconds: 60},
    expectation: "x",
    assertCalls: (t, calls) => {
        t.equal(calls[0].ttl, 60, "ttl evaluated from context");
    }
});

runCase({
    description: "nested caches are independent",
    template: `outer:{% cache 'outer' %}A{% cache 'inner' %}B{% endcache %}C{% endcache %}`,
    expectation: "outer:ABC",
    assertCalls: (t, calls) => {
        const keys = calls.map((c) => c.key).sort();
        t.deepEqual(keys, ["inner", "outer"], "both outer and inner keys seen");
        t.ok(calls.every((c) => c.executedBody), "both bodies executed on cold cache");
    }
});

runCase({
    description: "body uses context variables on miss",
    template: `{% cache 'k' %}hi {{ name }}{% endcache %}`,
    context: {name: "world"},
    expectation: "hi world"
});

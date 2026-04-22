import {runCase} from "../harness";

runCase({
    description: "cache miss renders body and stores result",
    template: `{% cache 'k' %}hello{% endcache %}`,
    expectation: "hello",
    assertCalls: (calls) => {
        if (calls.length !== 1 || !calls[0].executedBody || calls[0].key !== "k") {
            throw new Error(`unexpected calls: ${JSON.stringify(calls)}`);
        }
    }
});

runCase({
    description: "cache hit returns cached string without executing body",
    template: `{% cache 'k' %}body-should-not-render{% endcache %}`,
    prePopulated: {"k": "cached"},
    expectation: "cached",
    assertCalls: (calls) => {
        if (calls.length !== 1 || calls[0].executedBody) {
            throw new Error(`expected cache hit with no body execution: ${JSON.stringify(calls)}`);
        }
    }
});

runCase({
    description: "dynamic key from context",
    template: `{% cache 'u_' ~ id %}u={{ id }}{% endcache %}`,
    context: {id: 42},
    expectation: "u=42",
    assertCalls: (calls) => {
        if (calls[0].key !== "u_42") {
            throw new Error(`expected computed key 'u_42', got ${calls[0].key}`);
        }
    }
});

runCase({
    description: "ttl expression is passed to adapter",
    template: `{% cache 'k' ttl(300) %}x{% endcache %}`,
    expectation: "x",
    assertCalls: (calls) => {
        if (calls[0].ttl !== 300) {
            throw new Error(`expected ttl 300, got ${calls[0].ttl}`);
        }
    }
});

runCase({
    description: "no ttl means null",
    template: `{% cache 'k' %}x{% endcache %}`,
    expectation: "x",
    assertCalls: (calls) => {
        if (calls[0].ttl !== null) {
            throw new Error(`expected ttl null, got ${calls[0].ttl}`);
        }
    }
});

runCase({
    description: "ttl from context variable",
    template: `{% cache 'k' ttl(seconds) %}x{% endcache %}`,
    context: {seconds: 60},
    expectation: "x",
    assertCalls: (calls) => {
        if (calls[0].ttl !== 60) {
            throw new Error(`expected ttl 60, got ${calls[0].ttl}`);
        }
    }
});

runCase({
    description: "nested caches are independent",
    template: `outer:{% cache 'outer' %}A{% cache 'inner' %}B{% endcache %}C{% endcache %}`,
    expectation: "outer:ABC",
    assertCalls: (calls) => {
        const keys = calls.map((c) => c.key).sort();
        if (keys.length !== 2 || keys[0] !== "inner" || keys[1] !== "outer") {
            throw new Error(`expected both outer and inner keys, got ${JSON.stringify(keys)}`);
        }
    }
});

runCase({
    description: "body uses context variables on miss",
    template: `{% cache 'k' %}hi {{ name }}{% endcache %}`,
    context: {name: "world"},
    expectation: "hi world"
});

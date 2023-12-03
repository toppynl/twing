import TestBase from "../../TestBase";

export default class extends TestBase {
    getDescription() {
        return 'Hash key can be omitted if it is the same as the variable name';
    }

    getTemplates() {
        return {
            'index.twig': `
{% set foo = "foo" %}
{% set hash = { foo, bar: "bar" } %}
{{ hash|join }}`
        };
    }

    getExpected() {
        return `
foobar`;
    }
}

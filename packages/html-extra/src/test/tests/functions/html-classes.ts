import {runCase} from "../harness";

runCase({
    description: '"html_classes" function: basic usage from Twig fixture',
    template: `{{ html_classes('a', {'b': true, 'c': false}, 'd', false ? 'e', true ? 'f', '0') }}
{% set class_a = 'a' %}
{%- set class_b -%}
b
{%- endset -%}
{{ html_classes(class_a) }}
{{ html_classes(class_b) }}
{{ html_classes({ (class_a): true }) }}
{{ html_classes({ (class_b): true }) }}`,
    trimmedExpectation: `a b d f 0
a
b
a
b`
});

runCase({
    description: '"html_classes" function: unsupported arg type throws',
    template: `{{ html_classes(true) }}`,
    expectedErrorMessage: 'TwingRuntimeError: The "html_classes" function argument 0 should be either a string or an array, got "boolean" in "index.twig" at line 1, column 4'
});

runCase({
    description: '"html_classes" function: unsupported key type throws',
    template: `{{ html_classes(['foo']) }}`,
    expectedErrorMessage: 'TwingRuntimeError: The "html_classes" function argument 0 (key 0) should be a string, got "number" in "index.twig" at line 1, column 4'
});

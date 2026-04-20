import tape from "tape";
import {preLexComponents} from "../../../main/lib/pre-lexer";

type Case = {
    name: string;
    input: string;
    expected: string;
};

const cases: Array<Case> = [
    {
        name: "simple_component",
        input: "<twig:foo />",
        expected: "{{ component('foo') }}"
    },
    {
        name: "component_with_attributes",
        input: `<twig:foo bar="baz" with_quotes="It's with quotes" />`,
        expected: `{{ component('foo', { bar: 'baz', with_quotes: 'It\\'s with quotes' }) }}`
    },
    {
        name: "component_with_dynamic_attributes",
        input: `<twig:foo dynamic="{{ dynamicVar }}" :otherDynamic="anotherVar" />`,
        expected: `{{ component('foo', { dynamic: (dynamicVar), otherDynamic: anotherVar }) }}`
    },
    {
        name: "component_with_closing_tag",
        input: "<twig:foo></twig:foo>",
        expected: "{% component 'foo' %}{% endcomponent %}"
    },
    {
        name: "component_with_block",
        input: `<twig:foo><twig:block name="foo_block">Foo</twig:block></twig:foo>`,
        expected: `{% component 'foo' %}{% block foo_block %}Foo{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_with_traditional_block",
        input: `<twig:foo>{% block foo_block %}Foo{% endblock %}</twig:foo>`,
        expected: `{% component 'foo' %}{% block foo_block %}Foo{% endblock %}{% endcomponent %}`
    },
    {
        name: "traditional_blocks_around_component_do_not_confuse",
        input: `Hello {% block foo_block %}Foo{% endblock %}<twig:foo />{% block bar_block %}Bar{% endblock %}`,
        expected: `Hello {% block foo_block %}Foo{% endblock %}{{ component('foo') }}{% block bar_block %}Bar{% endblock %}`
    },
    {
        name: "component_with_commented_block",
        input: `<twig:foo name="bar">{#  {% block baz %}#}</twig:foo>`,
        expected: `{% component 'foo' with { name: 'bar' } %}{#  {% block baz %}#}{% endcomponent %}`
    },
    {
        name: "component_with_component_inside_block",
        input: `<twig:foo><twig:block name="foo_block"><twig:bar /></twig:block></twig:foo>`,
        expected: `{% component 'foo' %}{% block foo_block %}{{ component('bar') }}{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_with_embedded_component_inside_block",
        input: `<twig:foo><twig:block name="foo_block"><twig:bar><twig:baz /></twig:bar></twig:block></twig:foo>`,
        expected: `{% component 'foo' %}{% block foo_block %}{% component 'bar' %}{% block content %}{{ component('baz') }}{% endblock %}{% endcomponent %}{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_with_embedded_component",
        input: `<twig:foo>foo_content<twig:bar><twig:baz /></twig:bar></twig:foo>`,
        expected: `{% component 'foo' %}{% block content %}foo_content{% component 'bar' %}{% block content %}{{ component('baz') }}{% endblock %}{% endcomponent %}{% endblock %}{% endcomponent %}`
    },
    {
        name: "attribute_with_no_value",
        input: `<twig:foo bar />`,
        expected: `{{ component('foo', { bar: true }) }}`
    },
    {
        name: "attribute_with_no_value_and_no_attributes",
        input: `<twig:foo/>`,
        expected: `{{ component('foo') }}`
    },
    {
        name: "component_with_default_block_content",
        input: `<twig:foo>Foo</twig:foo>`,
        expected: `{% component 'foo' %}{% block content %}Foo{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_with_default_block_that_holds_a_component_and_multi_blocks",
        input: `<twig:foo>Foo <twig:bar /><twig:block name="other_block">Other block</twig:block></twig:foo>`,
        expected: `{% component 'foo' %}{% block content %}Foo {{ component('bar') }}{% endblock %}{% block other_block %}Other block{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_with_character_:_on_his_name",
        input: `<twig:foo:bar></twig:foo:bar>`,
        expected: `{% component 'foo:bar' %}{% endcomponent %}`
    },
    {
        name: "component_with_character_@_on_his_name",
        input: `<twig:@foo></twig:@foo>`,
        expected: `{% component '@foo' %}{% endcomponent %}`
    },
    {
        name: "component_with_character_-_on_his_name",
        input: `<twig:foo-bar></twig:foo-bar>`,
        expected: `{% component 'foo-bar' %}{% endcomponent %}`
    },
    {
        name: "component_with_character_._on_his_name",
        input: `<twig:foo.bar></twig:foo.bar>`,
        expected: `{% component 'foo.bar' %}{% endcomponent %}`
    },
    {
        name: "nested_component_2_levels",
        input: `<twig:foo><twig:block name="child"><twig:bar><twig:block name="message">Hello World!</twig:block></twig:bar></twig:block></twig:foo>`,
        expected: `{% component 'foo' %}{% block child %}{% component 'bar' %}{% block message %}Hello World!{% endblock %}{% endcomponent %}{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_with_mixture_of_string_and_twig_in_argument",
        input: `<twig:foo text="Hello {{ name }}!"/>`,
        expected: `{{ component('foo', { text: 'Hello '~(name)~'!' }) }}`
    },
    {
        name: "component_with_mixture_of_dynamic_twig_from_start",
        input: `<twig:foo text="{{ name   }} is my name{{ ending~'!!' }}"/>`,
        expected: `{{ component('foo', { text: (name)~' is my name'~(ending~'!!') }) }}`
    },
    {
        name: "dynamic_attribute_with_quotation_included",
        input: `<twig:foo text="{{ "hello!" }}"/>`,
        expected: `{{ component('foo', { text: ("hello!") }) }}`
    },
    {
        name: "component_with_mixture_of_string_and_twig_with_quote_in_argument",
        input: `<twig:foo text="Hello {{ name }}, I'm Theo!"/>`,
        expected: `{{ component('foo', { text: 'Hello '~(name)~', I\\'m Theo!' }) }}`
    },
    {
        name: "component_with_dashed_attribute",
        input: `<twig:foobar data-action="foo#bar"></twig:foobar>`,
        expected: `{% component 'foobar' with { 'data-action': 'foo#bar' } %}{% endcomponent %}`
    },
    {
        name: "component_with_dashed_attribute_self_closing",
        input: `<twig:foobar data-action="foo#bar" />`,
        expected: `{{ component('foobar', { 'data-action': 'foo#bar' }) }}`
    },
    {
        name: "component_with_colon_attribute",
        input: `<twig:foobar my:attribute="yo"></twig:foobar>`,
        expected: `{% component 'foobar' with { 'my:attribute': 'yo' } %}{% endcomponent %}`
    },
    {
        name: "component_with_at_attribute",
        input: `<twig:foobar @attribute="yo"></twig:foobar>`,
        expected: `{% component 'foobar' with { '@attribute': 'yo' } %}{% endcomponent %}`
    },
    {
        name: "component_with_nested_at_attribute",
        input: `<twig:foobar foo:@attribute="yo"></twig:foobar>`,
        expected: `{% component 'foobar' with { 'foo:@attribute': 'yo' } %}{% endcomponent %}`
    },
    {
        name: "component_with_truthy_attribute",
        input: `<twig:foobar data-turbo-stream></twig:foobar>`,
        expected: `{% component 'foobar' with { 'data-turbo-stream': true } %}{% endcomponent %}`
    },
    {
        name: "component_with_empty_attributes",
        input: `<twig:foobar data-turbo-stream="" my-attribute=''></twig:foobar>`,
        expected: `{% component 'foobar' with { 'data-turbo-stream': '', 'my-attribute': '' } %}{% endcomponent %}`
    },
    {
        name: "ignore_twig_comment",
        input: `{# <twig:Alert/> #} <twig:Alert/>`,
        expected: `{# <twig:Alert/> #} {{ component('Alert') }}`
    },
    {
        name: "file_ended_with_comments",
        input: `{# <twig:Alert/> #}`,
        expected: `{# <twig:Alert/> #}`
    },
    {
        name: "mixing_component_and_file_ended_with_comments",
        input: `<twig:Alert/> {# <twig:Alert/> #}`,
        expected: `{{ component('Alert') }} {# <twig:Alert/> #}`
    },
    {
        name: "ignore_content_of_verbatim_block",
        input: `{% verbatim %}<twig:Alert/>{% endverbatim %}`,
        expected: `{% verbatim %}<twig:Alert/>{% endverbatim %}`
    },
    {
        name: "component_attr_spreading_self_closing",
        input: `<twig:foobar bar="baz"{{...attr}}/>`,
        expected: `{{ component('foobar', { bar: 'baz', ...attr }) }}`
    },
    {
        name: "component_attr_spreading_self_closing2",
        input: `<twig:foobar bar="baz"{{ ...customAttrs }} />`,
        expected: `{{ component('foobar', { bar: 'baz', ...customAttrs }) }}`
    },
    {
        name: "component_attr_spreading_self_closing3",
        input: `<twig:foobar bar="baz" {{...attr }} />`,
        expected: `{{ component('foobar', { bar: 'baz', ...attr }) }}`
    },
    {
        name: "component_attr_spreading_with_content1",
        input: `<twig:foobar bar="baz"{{...attr}}>content</twig:foobar>`,
        expected: `{% component 'foobar' with { bar: 'baz', ...attr } %}{% block content %}content{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_attr_spreading_with_content2",
        input: `<twig:foobar bar="baz"{{ ...customAttrs }}>content</twig:foobar>`,
        expected: `{% component 'foobar' with { bar: 'baz', ...customAttrs } %}{% block content %}content{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_attr_spreading_with_content3",
        input: `<twig:foobar bar="baz" {{ ...attr }}>content</twig:foobar>`,
        expected: `{% component 'foobar' with { bar: 'baz', ...attr } %}{% block content %}content{% endblock %}{% endcomponent %}`
    },
    {
        name: "component_with_comment_line",
        input: "<twig:foo \n   # bar  \n />",
        expected: `{{ component('foo') }}`
    }
];

tape("TwigPreLexer fixtures", ({equal, end}) => {
    for (const {name, input, expected} of cases) {
        equal(preLexComponents(input), expected, name);
    }

    end();
});

tape("TwigPreLexer throws on unclosed component", ({throws, end}) => {
    throws(() => {
        preLexComponents('<twig:foo name="bar">{% block a %}</twig:foo>');
    }, /Expected closing tag "<\/twig:foo>" not found at line 1\./);

    end();
});

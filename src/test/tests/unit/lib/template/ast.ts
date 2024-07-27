import * as tape from "tape";
import {createEnvironment, createSynchronousEnvironment} from "../../../../../main/lib/environment";
import {createArrayLoader, createSynchronousArrayLoader} from "../../../../../main/lib/loader/array";
import {TwingTemplateNode} from "../../../../../main/lib/node/template";
import {createSynchronousTemplate, createTemplate} from "../../../../../main/lib/template";

tape('createTemplate => ::ast', ({test}) => {
    test('without embedded templates', ({same, end}) => {
        const environment = createEnvironment(createArrayLoader({
            'index': `{{ 5 + 5 }}`
        }));

        return environment.loadTemplate('index')
            .then(({ast}) => {
                const serializedAST = JSON.stringify(ast);
                const deserializedAST: TwingTemplateNode = JSON.parse(serializedAST);
                const template = createTemplate(deserializedAST);

                return template.render(environment, {})
                    .then((output) => {
                        same(output, '10');
                    })
                    .finally(end);
            });
    });

    test('with embedded templates', ({same, end}) => {
        const environment = createEnvironment(createArrayLoader({
            'index': `{% embed "embed1" %}
{% block foo %}Foo{% endblock %}
{% endembed %}`,
            'embed1': `{% block foo %}{% embed "embed2" %}
{% block foo %}Foo{% endblock %}
{% endembed %}{% endblock %}`,
            'embed2': `{% block foo %}{% endblock %}`
        }));

        return environment.loadTemplate('index')
            .then(({ast}) => {
                const serializedAST = JSON.stringify(ast);
                const deserializedAST: TwingTemplateNode = JSON.parse(serializedAST);
                const template = createTemplate(deserializedAST);

                return template.render(environment, {})
                    .then((output) => {
                        same(output, 'Foo');
                    })
                    .finally(end);
            });
    });
});

tape('createTemplate => ::ast', ({test}) => {
    test('without embedded templates', ({same, end}) => {
        const environment = createSynchronousEnvironment(createSynchronousArrayLoader({
            'index': `{{ 5 + 5 }}`
        }));

        const {ast} = environment.loadTemplate('index');
        
        const serializedAST = JSON.stringify(ast);
        const deserializedAST: TwingTemplateNode = JSON.parse(serializedAST);
        const template = createSynchronousTemplate(deserializedAST);

        const output = template.render(environment, new Map())

        same(output, '10');
        
        end();
    });

    test('with embedded templates', ({same, end}) => {
        const environment = createSynchronousEnvironment(createSynchronousArrayLoader({
            'index': `{% embed "embed1" %}
{% block foo %}Foo{% endblock %}
{% endembed %}`,
            'embed1': `{% block foo %}{% embed "embed2" %}
{% block foo %}Foo{% endblock %}
{% endembed %}{% endblock %}`,
            'embed2': `{% block foo %}{% endblock %}`
        }));

        const {ast} = environment.loadTemplate('index')
        
        const serializedAST = JSON.stringify(ast);
        const deserializedAST: TwingTemplateNode = JSON.parse(serializedAST);
        const template = createSynchronousTemplate(deserializedAST);

        const output = template.render(environment, new Map())

        same(output, 'Foo');
        
        end();
    });
});

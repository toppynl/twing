import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";
import {TwingTemplateNode} from "../../../../../src/lib/node/template";
import {createTemplate} from "../../../../../src/lib/template";

tape('createTemplate => ::ast', ({test}) => {
    test('without embedded templates', ({same, end}) => {
        const environment = createEnvironment(createArrayLoader({
            'index': `{{ 5 + 5 }}`
        }));

        return environment.loadTemplate('index')
            .then(({ast}) => {
                const serializedAST = JSON.stringify(ast);
                const deserializedAST: TwingTemplateNode = JSON.parse(serializedAST);
                const template = createTemplate(environment, deserializedAST);

                return template.render({})
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
                const template = createTemplate(environment, deserializedAST);

                return template.render({})
                    .then((output) => {
                        same(output, 'Foo');
                    })
                    .finally(end);
            });
    });
});

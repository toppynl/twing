import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";
import {createTemplate} from "../../../../../src/lib/template";
import {createTemplateNode} from "../../../../../src/lib/node/template";
import {createBaseNode} from "../../../../../src/lib/node";
import {createSource} from "../../../../../src/lib/source";

tape('createTemplate => ::loadEmbeddedTemplate', ({test}) => {
    test('throws an error on invalid index', ({fail, same, end}) => {
        const environment = createEnvironment(createArrayLoader({}));
        const template = createTemplate(environment, createTemplateNode(
            createBaseNode(null, {}, {
                content: createBaseNode(null)
            }, 1, 1),
            null,
            createBaseNode(null),
            createBaseNode(null),
            createBaseNode(null),
            [],
            createSource('', ''),
            1, 1
        ));

        return template.loadEmbeddedTemplate(0)
            .then(() => fail())
            .catch((error) => {
                same((error as Error).message, 'Unable to find template "embedded#0".');
            })
            .finally(end);
    });
});

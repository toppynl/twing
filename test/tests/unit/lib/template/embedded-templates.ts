import * as tape from "tape";
import {createTemplate} from "../../../../../src/lib/template";
import {createTemplateNode} from "../../../../../src/lib/node/template";
import {createBaseNode} from "../../../../../src/lib/node";
import {createSource} from "../../../../../src/lib/source";

tape('createTemplate => ::embeddedTemplates', ({test}) => {
    test('throws an error on invalid index', ({same, end}) => {
        const embeddedTemplateNode = createTemplateNode(createBaseNode(null),
            null,
            createBaseNode(null),
            createBaseNode(null),
            createBaseNode(null),
            [],
            createSource('', ''),
            1, 1
        );
        
        const template = createTemplate(createTemplateNode(
            createBaseNode(null),
            null,
            createBaseNode(null),
            createBaseNode(null),
            createBaseNode(null),
            [
                embeddedTemplateNode
            ],
            createSource('', ''),
            1, 1
        ));
        
        same(template.embeddedTemplates.get(0)?.ast, embeddedTemplateNode);
        
        end();
    });
});

import tape from "tape";
import {createTemplate} from "../../../../../main/lib/template";
import {createTemplateNode} from "../../../../../main/lib/node/template";
import {createBaseNode} from "../../../../../main/lib/node";
import {createSource} from "../../../../../main/lib/source";

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

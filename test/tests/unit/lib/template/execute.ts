import * as tape from "tape";
import {createEnvironment} from "../../../../../src/lib/environment";
import {createArrayLoader} from "../../../../../src/lib/loader/array";
import {createTemplate} from "../../../../../src/lib/template";
import {createTemplateNode} from "../../../../../src/lib/node/template";
import {createBodyNode} from "../../../../../src/lib/node/body";
import {createBaseNode} from "../../../../../src/lib/node";
import {createSource} from "../../../../../src/lib/source";
import {spy} from "sinon";
import {createOutputBuffer} from "../../../../../src/lib/output-buffer";
import {createContext} from "../../../../../src/lib/context";
import {createSourceMapRuntime} from "../../../../../src/lib/source-map-runtime";

tape('createTemplate => ::execute', ({test}) => {
    test('executes the AST according to the passed options', ({test}) => {
        test('when no options is passed', ({same, end}) => {
            const environment = createEnvironment(createArrayLoader({}));
            const ast = createTemplateNode(
                createBodyNode(createBaseNode(null), 1, 1),
                null,
                createBaseNode(null),
                createBaseNode(null),
                createBaseNode(null),
                [],
                createSource('', ''),
                1, 1
            );

            const astSpy = spy(ast, "execute");

            const template = createTemplate(environment, ast);

            return template.execute(createContext(), createOutputBuffer(), new Map())
                .then(() => {
                    same(astSpy.firstCall.firstArg.sandboxed, false);
                    same(astSpy.firstCall.firstArg.sourceMapRuntime, undefined);
                })
                .finally(end);
        });

        test('when some options are passed', ({same, end}) => {
            const environment = createEnvironment(createArrayLoader({}));
            const ast = createTemplateNode(
                createBodyNode(createBaseNode(null), 1, 1),
                null,
                createBaseNode(null),
                createBaseNode(null),
                createBaseNode(null),
                [],
                createSource('', ''),
                1, 1
            );

            const astSpy = spy(ast, "execute");

            const template = createTemplate(environment, ast);

            const sourceMapRuntime = createSourceMapRuntime();

            return template.execute(createContext(), createOutputBuffer(), new Map(), {
                sandboxed: true,
                sourceMapRuntime
            }).then(() => {
                same(astSpy.firstCall.firstArg.sandboxed, true);
                same(astSpy.firstCall.firstArg.sourceMapRuntime, sourceMapRuntime);
            }).finally(end);
        });
    });
});

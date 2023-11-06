import {BaseNode, BaseNodeAttributes, createBaseNode} from "../node";
import {BodyNode} from "./body";
import {ArrayNode, getKeyValuePairs} from "./expression/array";

export const VARARGS_NAME = 'varargs';

export type MacroNodeAttributes = BaseNodeAttributes & {
    name: string;
};

export interface MacroNode extends BaseNode<"macro", MacroNodeAttributes, {
    body: BodyNode;
    arguments: ArrayNode;
}> {
}

export const createMacroNode = (
    name: string,
    body: BodyNode,
    macroArguments: ArrayNode,
    line: number,
    column: number,
    tag: string
): MacroNode => {
    const baseNode = createBaseNode("macro", {
        name
    }, {
        body,
        arguments: macroArguments
    }, line, column, tag);

    return {
        ...baseNode,
        compile: (compiler) => {
            const {body, arguments: macroArguments} = baseNode.children;

            compiler
                .raw(`async (outputBuffer, `)
            ;
            
            const keyValuePairs = getKeyValuePairs(macroArguments);
            const count = keyValuePairs.length;
            
            let pos = 0;
            
            for (const {key, value: defaultValue} of keyValuePairs) {
                const name = key.attributes.value;
                
                compiler
                    .raw('__' + name + '__ = ')
                    .subCompile(defaultValue)
                ;

                if (++pos < count) {
                    compiler.raw(', ');
                }
            }

            if (count) {
                compiler.raw(', ');
            }

            compiler
                .raw('...__varargs__')
                .raw(") => {\n")
                .indent()
                .write('let aliases = template.aliases.clone();\n')
                .write("let context = runtime.createContext(runtime.mergeGlobals(new Map([\n")
                .indent()
            ;

            let first = true;

            for (const {key} of keyValuePairs) {
                const name = key.attributes.value;
                
                if (!first) {
                    compiler.raw(',\n');
                }

                first = false;

                compiler
                    .write('[')
                    .string(name)
                    .raw(', __' + name + '__]')
                ;
            }

            if (!first) {
                compiler.raw(',\n');
            }

            compiler
                .write('[')
                .string(VARARGS_NAME)
                .raw(', ')
            ;

            compiler
                .raw("\__varargs__]\n")
                .outdent()
                .write("])));\n\n")
                .write("let blocks = new Map();\n")
                .write('let result;\n')
                .write('let error;\n\n')
                .write("outputBuffer.start();\n")
                .write("try {\n")
                .indent()
                .subCompile(body)
                .raw("\n")
                .write('let tmp = outputBuffer.getContents();\n')
                .write("result = (tmp === '') ? '' : runtime.createMarkup(tmp, runtime.getCharset());\n")
                .outdent()
                .write("}\n")
                .write('catch (e) {\n')
                .indent()
                .write('error = e;\n')
                .outdent()
                .write('}\n\n')
                .write("outputBuffer.endAndClean();\n\n")
                .write('if (error) {\n')
                .indent()
                .write('throw error;\n')
                .outdent()
                .write('}\n')
                .write('return result;\n')
                .outdent()
                .write("}")
            ;
        }
    }
};

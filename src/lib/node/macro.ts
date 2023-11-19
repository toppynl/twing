import {TwingBaseNode, TwingBaseNodeAttributes, createBaseNode} from "../node";
import {TwingBodyNode} from "./body";
import {TwingArrayNode, getKeyValuePairs} from "./expression/array";

export const VARARGS_NAME = 'varargs';

export type TwingMacroNodeAttributes = TwingBaseNodeAttributes & {
    name: string;
};

export interface TwingMacroNode extends TwingBaseNode<"macro", TwingMacroNodeAttributes, {
    body: TwingBodyNode;
    arguments: TwingArrayNode;
}> {
}

export const createMacroNode = (
    name: string,
    body: TwingBodyNode,
    macroArguments: TwingArrayNode,
    line: number,
    column: number,
    tag: string
): TwingMacroNode => {
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
                .write(`async (outputBuffer, sourceMapRuntime, `)
            ;
            
            const keyValuePairs = getKeyValuePairs(macroArguments);
            const count = keyValuePairs.length;
            
            let pos = 0;
            
            for (const {key, value: defaultValue} of keyValuePairs) {
                const name = key.attributes.value;
                
                compiler
                    .write('__' + name + '__ = ')
                    .subCompile(defaultValue)
                ;

                if (++pos < count) {
                    compiler.write(', ');
                }
            }

            if (count) {
                compiler.write(', ');
            }

            compiler
                .write('...__varargs__')
                .write(") => {\n")
                
                .write('let aliases = template.aliases.clone();\n')
                .write("let context = runtime.createContext(runtime.mergeGlobals(new Map([\n")
                
            ;

            let first = true;

            for (const {key} of keyValuePairs) {
                const name = key.attributes.value;
                
                if (!first) {
                    compiler.write(',\n');
                }

                first = false;

                compiler
                    .write('[')
                    .string(name)
                    .write(', __' + name + '__]')
                ;
            }

            if (!first) {
                compiler.write(',\n');
            }

            compiler
                .write('[')
                .string(VARARGS_NAME)
                .write(', ')
            ;

            compiler
                .write("\__varargs__]\n")
                
                .write("])));\n\n")
                .write("let blocks = new Map();\n")
                .write('let result;\n')
                .write('let error;\n\n')
                .write("outputBuffer.start();\n")
                .write("try {\n")
                
                .subCompile(body)
                .write("\n")
                .write('let tmp = outputBuffer.getContents();\n')
                .write("result = (tmp === '') ? '' : runtime.createMarkup(tmp, runtime.charset);\n")
                
                .write("}\n")
                .write('catch (e) {\n')
                
                .write('error = e;\n')
                
                .write('}\n\n')
                .write("outputBuffer.endAndClean();\n\n")
                .write('if (error) {\n')
                
                .write('throw error;\n')
                
                .write('}\n')
                .write('return result;\n')
                
                .write("}")
            ;
        }
    }
};

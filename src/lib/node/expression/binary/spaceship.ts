import {TwingNodeExpressionBinary} from "../binary";
import {TwingCompiler} from "../../../compiler";
import {TwingNodeType} from "../../../node-type";

export const type = new TwingNodeType('expression_spaceship');

export class TwingNodeExpressionBinarySpaceship extends TwingNodeExpressionBinary {
    get type() {
        return type;
    }

    compile(compiler: TwingCompiler) {
        compiler
            .raw('this.compare(')
            .subcompile(this.getNode('left'))
            .raw(', ')
            .subcompile(this.getNode('right'))
            .raw(') ? 0 : (')
            .subcompile(this.getNode('left'))
            .raw(' < ')
            .subcompile(this.getNode('right'))
            .raw(' ? -1 : 1)')
        ;
    }
}

import {getChildren, getChildrenCount, TwingBaseNode} from "../../main/lib/node";

const var_export = require('locutus/php/var/var_export');

export const nodeToString = (node: TwingBaseNode): string => {
    const attributeRepresentations: Array<string> = [];
    const {line, column} = node;

    const isANode = (candidate: any): candidate is TwingBaseNode => {
        return candidate &&
            (candidate as TwingBaseNode).type !== undefined &&
            (candidate as TwingBaseNode).attributes !== undefined &&
            (candidate as TwingBaseNode).children !== undefined;
    };

    for (const [name, value] of Object.entries(node.attributes)) {
        const attributeRepresentation = isANode(value) ? nodeToString(value) : String(var_export(value, true));
        attributeRepresentations.push(`${name}: ${attributeRepresentation.replace(/\n/g, '')}`);
    }

    attributeRepresentations.push(`line: ${line}`);
    attributeRepresentations.push(`column: ${column}`);

    const representation: Array<string> = [
        `Node<${node.type ? '"' + node.type + '"' : 'null'}, ${attributeRepresentations.join(', ')}> (`
    ];

    if (getChildrenCount(node)) {
        for (let [name, child] of getChildren(node)) {
            const length = ('' + name).length + 4;
            const nodeRepresentation: Array<string> = [];

            for (let line of nodeToString(child).split('\n')) {
                nodeRepresentation.push(' '.repeat(length) + line);
            }

            representation.push(`  ${name}: ${nodeRepresentation.join('\n').trimLeft()}`);
        }

        representation.push(')');
    } else {
        representation[0] += ')';
    }

    return representation.join('\n');
};

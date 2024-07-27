import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingForNode} from "../node/for";
import {TwingContext} from "../context";
import {ensureTraversable} from "../helpers/ensure-traversable";
import {count} from "../helpers/count";
import {iterate, iterateSynchronously} from "../helpers/iterate";

export const executeForNode: TwingNodeExecutor<TwingForNode> = async (forNode, executionContext) => {
    const {context, nodeExecutor: execute} = executionContext;
    const {
        sequence: sequenceNode,
        body,
        else: elseNode,
        valueTarget: targetValueNode,
        keyTarget: targetKeyNode
    } = forNode.children;
    const {hasAnIf} = forNode.attributes;

    context.set('_parent', context.clone());

    const executedSequence: TwingContext<any, any> | any = await execute(sequenceNode, executionContext);
    const sequence = ensureTraversable(executedSequence);

    context.set('_seq', sequence);

    if (elseNode) {
        context.set('_iterated', false);
    }

    context.set('loop', new Map([
        ['parent', context.get('_parent')],
        ['index0', 0],
        ['index', 1],
        ['first', true],
    ]));

    if (!hasAnIf) {
        const length = count(context.get('_seq'));

        const loop: Map<string, any> = context.get('loop');

        loop.set('revindex0', length - 1);
        loop.set('revindex', length);
        loop.set('length', length);
        loop.set('last', (length === 1));
    }

    const targetKey = await execute(targetKeyNode, executionContext);
    const targetValue = await execute(targetValueNode, executionContext);

    await iterate(context.get('_seq'), async (key, value) => {
        context.set(targetKey, key);
        context.set(targetValue, value);

        await execute(body, executionContext);
    });

    if (elseNode) {
        if (context.get('_iterated') === false) {
            await execute(elseNode, executionContext);
        }
    }

    const parent = context.get('_parent');

    context.delete('_seq');
    context.delete('_iterated');
    context.delete(targetKeyNode.attributes.name);
    context.delete(targetValueNode.attributes.name);
    context.delete('_parent');
    context.delete('loop');

    for (const [key, value] of parent) {
        if (!context.has(key)) {
            context.set(key, value);
        }
    }
};

export const executeForNodeSynchronously: TwingSynchronousNodeExecutor<TwingForNode> = (forNode, executionContext) => {
    const {context, nodeExecutor: execute} = executionContext;
    const {
        sequence: sequenceNode,
        body,
        else: elseNode,
        valueTarget: targetValueNode,
        keyTarget: targetKeyNode
    } = forNode.children;
    const {hasAnIf} = forNode.attributes;
    
    context.set('_parent', new Map(context.entries()));

    const executedSequence: TwingContext<any, any> | any = execute(sequenceNode, executionContext);
    const sequence = ensureTraversable(executedSequence);

    context.set('_seq', sequence);

    if (elseNode) {
        context.set('_iterated', false);
    }

    context.set('loop', new Map([
        ['parent', context.get('_parent')],
        ['index0', 0],
        ['index', 1],
        ['first', true],
    ]));

    if (!hasAnIf) {
        const length = count(context.get('_seq'));

        const loop: Map<string, any> = context.get('loop');

        loop.set('revindex0', length - 1);
        loop.set('revindex', length);
        loop.set('length', length);
        loop.set('last', (length === 1));
    }

    const targetKey = execute(targetKeyNode, executionContext);
    const targetValue = execute(targetValueNode, executionContext);

    iterateSynchronously(context.get('_seq'), (key, value) => {
        context.set(targetKey, key);
        
        // todo: @see https://github.com/twigphp/Twig/issues/4152
        if (key === '_parent') {
            context.set(targetValue, '[object Object]');
        }
        else {
            context.set(targetValue, value);
        }

        execute(body, executionContext);
    });

    if (elseNode) {
        if (context.get('_iterated') === false) {
            execute(elseNode, executionContext);
        }
    }

    const parent: Map<string, any> = context.get('_parent');

    context.delete('_seq');
    context.delete('_iterated');
    context.delete(targetKeyNode.attributes.name);
    context.delete(targetValueNode.attributes.name);
    context.delete('_parent');
    context.delete('loop');

    for (const [key, value] of parent) {
        if (!context.has(key)) {
            context.set(key, value);
        }
    }
};


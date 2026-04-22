import {TwingNodeExecutor, TwingSynchronousNodeExecutor} from "../node-executor";
import {TwingTypesNode} from "../node/types";

export const executeTypesNode: TwingNodeExecutor<TwingTypesNode> = () => Promise.resolve();

export const executeTypesNodeSynchronously: TwingSynchronousNodeExecutor<TwingTypesNode> = () => {};

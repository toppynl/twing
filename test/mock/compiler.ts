import {AnEnvironment} from "../../src/lib/environment";
import {TwingCompiler, createCompiler} from "../../src/lib/compiler";
import {MockLoader} from "./loader";
import {createMockedEnvironment} from "./environment";

export const createMockCompiler = (
    env: AnEnvironment | null = null
): TwingCompiler => {
    let loader = new MockLoader();

    return createCompiler(env ? env : createMockedEnvironment(loader));
};

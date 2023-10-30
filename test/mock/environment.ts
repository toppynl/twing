import {TwingLoaderInterface} from "../../src/lib/loader-interface";
import {TwingLoaderNull} from "../../src/lib/loader/null";
import {createEnvironment, TwingEnvironment, TwingEnvironmentOptions} from "../../src/lib/environment";

export const createMockedEnvironment = (
    loader?: TwingLoaderInterface,
    options: TwingEnvironmentOptions | null = null
): TwingEnvironment => {
    const environment = createEnvironment(loader || new TwingLoaderNull(), options);

    return environment;
};

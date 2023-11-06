import {TwingLoader} from "../../src/lib/loader";
import {createEnvironment, TwingEnvironment, TwingEnvironmentOptions} from "../../src/lib/environment";
import {createMockedLoader} from "./loader";

export const createMockedEnvironment = (
    loader?: TwingLoader,
    options: TwingEnvironmentOptions | null = null
): TwingEnvironment => {
    const environment = createEnvironment(loader || createMockedLoader(), options);

    return environment;
};

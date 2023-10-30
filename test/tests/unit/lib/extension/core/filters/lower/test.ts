import * as tape from 'tape';
import {TwingLoaderArray} from "../../../../../../../../src/lib/loader/array";
import {FilesystemEnvironment} from "../../../../../../../../src/lib/environment/filesystem-environment";
import {lower} from "../../../../../../../../src/lib/extension/core/filters/lower";

tape('lower', async (test) => {
    let env = new FilesystemEnvironment(new TwingLoaderArray({}));

    test.same(await lower(env, 'A'), 'a');
    test.same(await lower(env, '5'), '5');

    test.end();
});

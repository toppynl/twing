import * as tape from 'tape';
import {FilesystemLessEnvironment} from "../../../../../../src/lib/environment/filesystem-less-environment";

tape('browser environment', (test) => {
    test.test('cache from string', (test) => {
        let env = new FilesystemLessEnvironment(null);

        test.true(env.cacheFromString('foo') instanceof TwingCacheNull, 'should return null cache');

        test.end();
    });

    test.end();
});

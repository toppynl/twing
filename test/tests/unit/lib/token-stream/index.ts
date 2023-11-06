import * as tape from 'tape';
import {createArrayLoader} from "../../../../../src/lib/loader/array";
import {createSource} from "../../../../../src/lib/source";
import {createEnvironment} from "../../../../../src/lib/environment";

tape('TokenStream', ({test}) => {
    test('should provide textual representation', ({same, end}) => {
        
        let loader = createArrayLoader({
            index: ''
        });
        let twing = createEnvironment(loader);
        let stream = twing.tokenize(createSource('Hello {{ name }}', 'index'));

        same(stream.toString(), `TEXT(Hello )
VARIABLE_START({{)
NAME(name)
VARIABLE_END(}})
EOF()`);

        end();
    });
});

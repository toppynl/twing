import tape from "tape";
import {createArrayLoader, createEnvironment, createSynchronousArrayLoader, createSynchronousEnvironment} from "@toppynl/twing";
import {createCacheTagHandler} from "../../../main/lib/tag-handler/cache";

tape("cache tag without extension throws helpful error at render time", ({test}) => {
    test("async: missing runtime throws with runtime name in message", async ({match, fail, end}) => {
        const environment = createEnvironment(createArrayLoader({"index.twig": `{% cache 'k' %}x{% endcache %}`}));
        environment.addTagHandler(createCacheTagHandler());

        try {
            await environment.render("index.twig", {});
            fail("expected render to throw");
        } catch (error) {
            match((error as Error).message, /No runtime registered for "CacheRuntime"/);
        }
        end();
    });

    test("sync: missing runtime throws with runtime name in message", ({throws, end}) => {
        const environment = createSynchronousEnvironment(createSynchronousArrayLoader({"index.twig": `{% cache 'k' %}x{% endcache %}`}));
        environment.addTagHandler(createCacheTagHandler());

        throws(
            () => environment.render("index.twig", {}),
            /No runtime registered for "SynchronousCacheRuntime"/
        );
        end();
    });
});

import tape from "tape";
import {packageName} from "../../main/lib";

tape('@toppynl/twing-cache-extra scaffold', ({equal, end}) => {
    equal(packageName, "@toppynl/twing-cache-extra", "package exports its own name");
    end();
});

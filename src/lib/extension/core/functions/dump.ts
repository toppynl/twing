import {iterate} from "../../../helpers/iterate";
import {createMarkup, TwingMarkup} from "../../../markup";
import {varDump} from "../../../helpers/php";

export const dump = (context: any, ...vars: Array<any>): Promise<TwingMarkup> => {
    if (vars.length < 1) {
        const vars_ = new Map();

        return iterate(context, (key, value) => {
            vars_.set(key, value);

            return Promise.resolve();
        }).then(() => {
            return createMarkup(varDump(vars_));
        });
    }

    return Promise.resolve(createMarkup(varDump(...vars)));
};

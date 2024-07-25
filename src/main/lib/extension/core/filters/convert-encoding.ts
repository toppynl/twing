import {iconv} from "../../../helpers/iconv";
import {TwingCallable} from "../../../callable-wrapper";

export const convertEncoding: TwingCallable<[
    value: string | Buffer,
    to: string,
    from: string
], Buffer> = (_executionContext, value, to, from) => {
    return Promise.resolve(iconv(from, to, Buffer.from(value)));
};

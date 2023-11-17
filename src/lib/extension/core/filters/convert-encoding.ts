import {iconv} from "../../../helpers/iconv";

export const convertEncoding = (value: string | Buffer, to: string, from: string): Promise<Buffer> => {
    return Promise.resolve(iconv(from, to, Buffer.from(value)));
};

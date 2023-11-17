import {isEmpty} from "../tests/is-empty";

export const defaultFilter = (value: any, defaultValue: any | null): Promise<any> => {
    return isEmpty(value)
        .then((isEmpty) => {
            if (isEmpty) {
                return Promise.resolve(defaultValue);
            } else {
                return Promise.resolve(value);
            }
        });
};

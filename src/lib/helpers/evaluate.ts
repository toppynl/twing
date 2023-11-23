import {isAMapLike} from "./map-like";

export const evaluate = (value: any): boolean => {
    if (value === '0' || (isAMapLike(value) && value.size === 0)) {
        return false;
    }
    else if (Number.isNaN(value)) {
        return true;
    }
    else {
        return value;
    }
};

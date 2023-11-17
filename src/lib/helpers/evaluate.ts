import {isMapLike} from "./map-like";

export const evaluate = (value: any): boolean => {
    if (value === '0' || (isMapLike(value) && value.size === 0)) {
        return false;
    }
    else if (Number.isNaN(value)) {
        return true;
    }
    else {
        return value;
    }
};

import type {TwingCallable, TwingSynchronousCallable} from "@toppynl/twing";
import * as ct from "countries-and-timezones";

const resolveCountryTimezones = (countryCode: string): string[] => {
    const timezones = ct.getTimezonesForCountry(countryCode);
    if (!timezones || timezones.length === 0) {
        throw new Error(`No timezones found for country "${countryCode}"`);
    }
    return timezones.map(tz => tz.name);
};

export const countryTimezones: TwingCallable = async (_ctx, value: string) => resolveCountryTimezones(value);
export const countryTimezonesSynchronously: TwingSynchronousCallable = (_ctx, value: string) => resolveCountryTimezones(value);

import {z} from "zod";
import {listQuerySchema} from "./exercise-routes.js";

const IANA_ZONE_SHAPE = /^[A-Za-z]+(?:\/[A-Za-z0-9_+-]+)*$/

function isKnownTimeZone(value: string): boolean {
    try {
        new Intl.DateTimeFormat("en-US", {timeZone:value});
        return true;
    } catch (e) {
        if (e instanceof RangeError) {
            return false;
        }
        throw e;
    }
}

export const progressQuerySchema = listQuerySchema
    .extend({
        tz: z.string()
            .max(64)
            .regex(IANA_ZONE_SHAPE)
            .refine(isKnownTimeZone, {message: "Unknown time zone"})
            .default("UTC"),
        from: z.iso.datetime({offset: true}).optional(),
        to: z.iso.datetime({offset: true}).optional(),
    })
.refine(
    (q) => q.from === undefined || q.to === undefined ||
        Date.parse(q.from) <= Date.parse(q.to),
    {message: "from must not be after to", path: ["from"]},
);

export type ProgressQuery = z.infer<typeof progressQuerySchema>;
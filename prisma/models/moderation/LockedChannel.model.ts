import { createModel } from "schemix";
import ModerationModuleMode from "./ModerationModule.mode";


export default createModel((LockedChannelModel) => {
    LockedChannelModel
        .string("id")
        .dateTime("time")

        .relation("moderation", ModerationModuleMode, { fields: ["moderationId"], references: ["id"] })
        .string("moderationId", { unique: true })

        .id({ fields: ["id", "moderationId"]})
});

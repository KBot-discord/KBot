import { createModel } from "schemix";
import NotificationModuleModel from "../NotificationModule.model";
import TwitterFollowMode from "./TwitterFollow.mode";


export default createModel((TwitterModel) => {
    TwitterModel
        .string("id", { unique: true })

        .relation("follows", TwitterFollowMode, { list: true })
        .relation("notifications", NotificationModuleModel, { fields: ["notificationId"], references: ["id"] })
        .string("notificationId", { unique: true })

        .id({ fields: ["id", "notificationId"] })
});

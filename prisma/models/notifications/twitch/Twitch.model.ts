import { createModel } from "schemix";
import NotificationModule from "../NotificationModule.model"
import TwitchFollowModel from "./TwitchFollow.model";


export default createModel((TwitchModel) => {
    TwitchModel
        .string("id", { unique: true })

        .relation("follows", TwitchFollowModel, { list: true })
        .relation("notifications", NotificationModule, { fields: ["notificationId"], references: ["id"] })
        .string("notificationId", { unique: true })

        .id({ fields: ["id", "notificationId"] })
});

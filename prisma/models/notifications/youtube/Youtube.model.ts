import { createModel } from "schemix";
import SubscriptionModel from "./Subscription.model";
import NotificationModuleModel from "../NotificationModule.model";


export default createModel((YoutubeModel) => {
    YoutubeModel
        .string("id", { unique: true })

        .relation("subscriptions", SubscriptionModel, { list: true })
        .relation("notifications", NotificationModuleModel, { fields: ["notificationId"], references: ["id"] })
        .string("notificationId", { unique: true })

        .id({ fields: ["id", "notificationId"] })
});

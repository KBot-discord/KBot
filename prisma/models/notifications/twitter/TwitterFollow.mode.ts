import { createModel } from "schemix";
import TwitterModel from "./Twitter.model";
import TwitterAccountModel from "./TwitterAccount.model";


export default createModel((TwitterFollowModel) => {
    TwitterFollowModel
        .string("id")
        .string("message")
        .string("webhookId")
        .string("webhookToken")

        .relation("account", TwitterAccountModel, { fields: ["accountId"], references: ["id"] })
        .string("accountId")
        .relation("twitter", TwitterModel, { fields: ["twitterId"], references: ["id"] })
        .string("twitterId")

        .id({ fields: ["id", "accountId", "twitterId"] })
});

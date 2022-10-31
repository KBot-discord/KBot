import { createModel } from "schemix";
import TwitterFollowMode from "./TwitterFollow.mode";


export default createModel((TwitterAccountModel) => {
    TwitterAccountModel
        .string("id")
        .string("name")
        .string("image")

        .relation("follows", TwitterFollowMode, { list: true })

        .id({ fields: ["id"] })
});

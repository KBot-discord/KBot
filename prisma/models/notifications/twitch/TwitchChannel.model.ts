import { createModel } from "schemix";
import TwitchFollowModel from "./TwitchFollow.model";


export default createModel((TwitchChannelModel) => {
    TwitchChannelModel
        .string("id")
        .string("name")
        .string("image")

        .relation("follows", TwitchFollowModel, { list: true })

        .id({ fields: ["id"] })
});

import { createModel } from "schemix";


export default createModel((TwitchStreamModel) => {
    TwitchStreamModel
        .string("id")
        .string("title")
        .string("messageIds", { list: true })

        .id({ fields: ["id"] })
});

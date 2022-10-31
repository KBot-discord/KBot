import { createModel } from "schemix";


export default createModel((YoutubeStreamModel) => {
    YoutubeStreamModel
        .string("id")
        .string("title")
        .string("messageIds", { list: true })

        .id({ fields: ["id"] })
});

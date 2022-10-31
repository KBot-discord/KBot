import { createModel } from "schemix";
import GuildModel from "../Guild.model";


export default createModel((WelcomeModuleModel) => {
    WelcomeModuleModel
        .string("id")
        .boolean("moduleEnabled")
        .boolean("messagesEnabled")
        .string("channel")
        .string("message")
        .string("title")
        .string("description")
        .string("image")
        .string("color")

        .relation("guild", GuildModel, { fields: ["guildId"], references: ["id"] })
        .string("guildId", { unique: true })

        .id({ fields: ["id", "guildId"]})
});

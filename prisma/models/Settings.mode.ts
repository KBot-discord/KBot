import { createModel } from "schemix";
import GuildModel from "./Guild.model";


export default createModel((SettingsModel) => {
    SettingsModel
        .string("id")
        .string("staffRoles", { list: true })
        .string("botManagers", { list: true })

        .relation("guild", GuildModel, { fields: ["guildId"], references: ["id"] })
        .string("guildId", { unique: true })

        .id({ fields: ["id", "guildId"]})
});

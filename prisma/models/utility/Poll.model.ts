import { createModel } from "schemix";
import UtilityModuleModel from "./UtilityModule.model";


export default createModel((PollModel) => {
    PollModel
        .string("id")
        .string("channel")
        .dateTime("time")

        .relation("utility", UtilityModuleModel, { fields: ["utilityId"], references: ["id"] })
        .string("utilityId", { unique: true })

        .id({ fields: ["id", "utilityId"]})
});

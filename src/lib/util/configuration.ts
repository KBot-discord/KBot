// Imports
import { container } from "@sapphire/framework";
import { IdHints } from "../types/config";


export function getIdHint(key: string): string {
    return container.config.idHints[key.toLowerCase() as keyof IdHints]
}
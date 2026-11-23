import { asyncHandler } from "../utils/asyncHandler";
import * as srv from "../services/dashboard.service.js"

export const stats = asyncHandler(async (req, res) => {
    res.json(await srv.getStats())
})
import { asyncHandler } from "../utils/asyncHandler.js";
import * as srv from "../services/auth.services.js"

export const login = asyncHandler(async (req, res) => {
  const {email,password} = req.validated.body;
  res.json(await srv.login(email, password));
});

export const me = asyncHandler(async (req, res) => {
  res.json({user : await srv.GetMe(req.user.id)});
});


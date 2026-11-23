import { asyncHandler } from "../utils/asyncHandler";
import * as srv from "../services/appointment.service.js"

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ appointment: await svc.create(req.validated.body, req.user.id) });
});

export const list = asyncHandler(async (req, res) => {
  res.json({items: await srv.list(req.validated.query)});
});

export const updateStatus = asyncHandler(async (req, res) => {
  const appointment = await srv.updateStatus(req.validated.params.id, req.validated.body.status);
  res.json({appointment});
});

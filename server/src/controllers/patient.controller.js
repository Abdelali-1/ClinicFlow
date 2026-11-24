import { asyncHandler } from "../utils/asyncHandler.js";
import * as srv from "../services/patient.service.js"

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ patient: await srv.create(req.validated.body) });
});

export const list = asyncHandler(async (req, res) => {
  res.json(await srv.list(req.validated.query));
});

export const getOne = asyncHandler(async (req, res) => {
  res.json({patient : await srv.getById(req.validated.params.id)});
});

export const update = asyncHandler(async (req, res) => {
  res.json({patient : await srv.update(req.validated.params.id, req.validated.body)})  ;
});

export const remove = asyncHandler(async (req, res) => {
  await srv.remove(req.validated.params.id);
  res.status(204).end();
});

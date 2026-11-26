import { AppError } from "../utils/AppErrors.js";

export const notFound = (req, res, next) =>
    next(new AppError(
        404,
        "Introuvable",
        `L'URL demandée ${req.originalUrl} est introuvable.`
    ));

export const errorHandler = (err, req, res, next) => {

    if (err.code === "23505" && err.constraint === "patients_cin_active_uniq") {
        return res.status(409).json({
            message: "Cette CIN est déjà utilisée."
        });
    }
    // Valeur déjà existante (UNIQUE)
    else if (err.code === "23505") {
        return res.status(409).json({
            status: 409,
            message: "Cette valeur existe déjà."
        });
    }

    // Format UUID invalide
    if (err.code === "22P02") {
        return res.status(400).json({
            status: 400,
            message: "Format d'identifiant invalide."
        });
    }

    // Format JSON invalide
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({
            status: 400,
            message: "Format JSON invalide."
        });
    }

    const status = err.status || 500;

    if (status === 500) {
        console.error(err);
    }

    return res.status(status).json({
        status,
        message: status === 500
            ? "Une erreur interne du serveur est survenue."
            : err.message,
        details: err.details || null
    });
};
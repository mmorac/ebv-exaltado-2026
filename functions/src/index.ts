/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

// Inicializar Firebase Admin solo si no está ya inicializado
if (!admin.apps.length) {
    admin.initializeApp();
}

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

/**
 * Cloud Function para guardar inscripciones en Firestore
 * Endpoint: POST /guardarinscripcion
 * Body: { nombre: string, email: string }
 */
export const guardarinscripcion = onRequest(async (request, response) => {
    // Permitir CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "POST");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    try {
        const { nombre, email } = request.body;

        // Validar datos
        if (!nombre || !email) {
            response.status(400).json({
                error: "Los campos 'nombre' y 'email' son requeridos",
            });
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            response.status(400).json({
                error: "El email no tiene un formato válido",
            });
            return;
        }

        // Referencia a la colección Firestore
        const db = admin.firestore();
        const docRef = await db.collection("inscripciones").add({
            nombre,
            email,
            fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
        });

        logger.info("Inscripción guardada exitosamente", {
            docId: docRef.id,
            email,
        });

        response.status(201).json({
            success: true,
            message: "Inscripción guardada exitosamente",
            id: docRef.id,
        });
    } catch (error) {
        logger.error("Error al guardar inscripción", error);
        response.status(500).json({
            error: "Error al guardar la inscripción",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
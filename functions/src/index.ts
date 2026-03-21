/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {onRequest} from "firebase-functions/v2/https";
import {logger} from "firebase-functions/logger";
import { getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

// Inicializar Firebase Admin solo si no está ya inicializado
const app = getApps().length === 0 ? initializeApp() : getApps()[0];
const db = getFirestore(app);

// Tipos para los campos del formulario de inscripción
export type Language = 'es' | 'en' | 'pt';
export type AgeGroup = 'Bichitos' | 'Escarabajos' | 'Escorpiones';

export interface GuardianInfo {
  guardianName: string;
  postalCode: string;
  city: string;
  province: string;
  addressType: string;
  address: string;
  workPhone: string;
  cellPhone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  pickupPersonName: string;
  pickupPersonPhone: string;
  invitedBy: string;
  photoPermission: string;
  promoPermission: string;
  lopdConsent: boolean;
}

export interface ChildInput {
  childName: string;
  birthDate: string;
  bloodGroup: string;
  lastGradeCompleted: string;
  medicalInfo: string;
  foodAllergies: string;
  attendsSundaySchool: string;
  sundaySchoolLocation: string;
}

export interface RegistrationData {
  guardian: GuardianInfo;
  children: ChildInput[];
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

/**
 * Cloud Function para guardar inscripciones completas en Firestore
 * Endpoint: POST /guardarinscripcioncompleta
 * Body: { guardian: GuardianInfo, children: ChildInput[] }
 */
export const guardarinscripcion = onRequest(async (request, response) => {
    // Permitir CORS completo (antes de OPTIONS)
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
    }

    try {
        const { guardian, children }: RegistrationData = request.body;

        // Validar datos básicos
        if (!guardian || !children || !Array.isArray(children) || children.length === 0) {
            response.status(400).json({
                error: "Los campos 'guardian' y 'children' son requeridos. 'children' debe ser un array no vacío.",
            });
            return;
        }

        // Validar campos obligatorios del guardian
        if (!guardian.guardianName || !guardian.cellPhone || !guardian.lopdConsent) {
            response.status(400).json({
                error: "Los campos obligatorios del tutor son: guardianName, cellPhone, lopdConsent",
            });
            return;
        }

        // Validar cada niño
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child.childName || !child.birthDate) {
                response.status(400).json({
                    error: `Los campos obligatorios del niño ${i + 1} son: childName, birthDate`,
                });
                return;
            }
        }

        // Referencia a la colección Firestore
        const docRef = await db.collection("inscripciones").add({
            guardian,
            children,
            fechaCreacion: FieldValue.serverTimestamp(),
        });

        logger.info("Inscripción completa guardada exitosamente", {
            docId: docRef.id,
            guardianName: guardian.guardianName,
            childrenCount: children.length,
        });

        response.status(201).json({
            success: true,
            message: "Inscripción completa guardada exitosamente",
            id: docRef.id,
        });
    } catch (error) {
        logger.error("Error al guardar inscripción completa", error);
        response.status(500).json({
            error: "Error al guardar la inscripción completa",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * Cloud Function para obtener todas las inscripciones de Firestore
 * Endpoint: GET /obtenerinscripciones
 */
export const obtenerinscripciones = onRequest(async (request, response) => {
    // Permitir CORS completo (antes de OPTIONS)
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
    }

    try {
        // Referencia a la colección Firestore
        const snapshot = await db.collection("inscripciones").get();

        // Extraer datos de los documentos
        const inscripciones = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
        } as RegistrationData & { id: string }));

        logger.info("Inscripciones obtenidas exitosamente", {
            total: inscripciones.length,
        });

        response.status(200).json({
            success: true,
            message: "Inscripciones obtenidas exitosamente",
            total: inscripciones.length,
            data: inscripciones,
        });
    } catch (error) {
        logger.error("Error al obtener inscripciones", error);
        response.status(500).json({
            error: "Error al obtener las inscripciones",
            details: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

/**
 * Cloud Function para actualizar inscripciones completas en Firestore
 * Endpoint: PUT /actualizarinscripcion
 * Body: { id: string, guardian?: GuardianInfo, children?: ChildInput[] }
 */
export const actualizarinscripcion = onRequest(async (request, response) => {
    // Permitir CORS completo (antes de OPTIONS)
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type");

    if (request.method === "OPTIONS") {
        response.status(204).send("");
        return;
    }

    try {
        const { id, guardian, children }: { id: string; guardian?: GuardianInfo; children?: ChildInput[] } = request.body;

        // Validar ID requerido
        if (!id) {
            response.status(400).json({
                error: "El campo 'id' es requerido",
            });
            return;
        }

        // Preparar datos de actualización
        const updateData: any = {};
        if (guardian !== undefined) updateData.guardian = guardian;
        if (children !== undefined) updateData.children = children;

        if (Object.keys(updateData).length === 0) {
            response.status(400).json({
                error: "Debe proporcionar al menos un campo para actualizar (guardian o children)",
            });
            return;
        }

        // Validar campos obligatorios si se actualiza guardian
        if (guardian) {
            if (!guardian.guardianName || !guardian.cellPhone || guardian.lopdConsent === undefined) {
                response.status(400).json({
                    error: "Los campos obligatorios del tutor son: guardianName, cellPhone, lopdConsent",
                });
                return;
            }
        }

        // Validar cada niño si se actualizan children
        if (children) {
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (!child.childName || !child.birthDate) {
                    response.status(400).json({
                        error: `Los campos obligatorios del niño ${i + 1} son: childName, birthDate`,
                    });
                    return;
                }
            }
        }

        // Referencia a la colección Firestore
        const docRef = db.collection("inscripciones").doc(id);
        await docRef.update(updateData);

        logger.info("Inscripción completa actualizada exitosamente", {
            docId: id,
        });

        response.status(200).json({
            success: true,
            message: "Inscripción completa actualizada exitosamente",
            id,
        });
    } catch (error: any) {
        if (error.code === "not-found" || error.code === 5) {
            response.status(404).json({
                error: "Inscripción completa no encontrada",
            });
        } else {
            logger.error("Error al actualizar inscripción completa", error);
            response.status(500).json({
                error: "Error al actualizar la inscripción completa",
                details: error.message || "Unknown error",
            });
        }
    }
});
import { query } from "../config/db.js";

export async function getStats(){
    const {rows} = await query(`
        SELECT 
            (SELECT COUNT(*)::int FROM patients WHERE deleted_at IS NULL) AS "totalPatients",
            (SELECT COUNT(*)::int FROM appointments 
                 WHERE appointment_date >= date_trunc('day', now())
                    AND appointment_date <  date_trunc('day', now()) + interval '1 day'
                    AND deleted_at IS NULL) AS "todayAppointments",
            (SELECT COUNT(*)::int FROM appointments WHERE status = 'pending' AND deleted_at IS NULL) AS "pending",
            (SELECT COUNT(*)::int FROM appointments WHERE status = 'confirmed') AS "confirmed"
        `) ;
    return rows[0];
}
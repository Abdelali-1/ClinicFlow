import { query } from "../config/db";

export async function getStats(){
    const {rows} = await query(`
        SELECT 
            (SELECT COUNT(*)::int FROM patients) AS "totalPatients",
            (SELECT COUNT(*)::int FROM appointments 
                 WHERE appointment_date >= date_trunc('day', now())
                    AND appointment_date <  date_trunc('day', now()) + interval '1 day') AS "todayAppointments",
            (SELECT COUNT(*)::int FROM appointments WHERE status = 'pending') AS "pending",
            (SELECT COUNT(*)::int FROM appointments WHERE status = 'confirmed') AS "confirmed"
        `) ;
    return rows[0];
}
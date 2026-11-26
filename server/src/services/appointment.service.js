import { query, withTransaction } from "../config/db.js";
import { AppError } from "../utils/AppErrors.js";

const SELECT = `
  SELECT a.id, a.patient_id AS "patientId", p.full_name AS "patientName",
         a.appointment_date AS "appointmentDate", a.status, a.reason, a.notes,
         a.created_by AS "createdBy", a.created_at AS "createdAt"
  FROM appointments a JOIN patients p ON p.id = a.patient_id`;


export async function getById(id){
    const {rows} = await query(`${SELECT} WHERE a.id = $1`, [id]);
    if(!rows[0]) throw new AppError(404, 'Rendez-vous introuvable.');
    return rows[0];
} 

export async function create(d, userId){
    const date = d.appointmentDate.toISOString();

    const result = await withTransaction(async (client) => {
        await lockPatient(client, d.patientId);
        if(d.status === 'confirmed') await assertNoConflit(client, d.patientId, date);
        
        const {rows} = await client.query(`
            INSERT INTO appointments(patient_id, appointment_date, status, reason, notes, created_by)
                VALUES($1,$2,$3,$4,$5,$6) 
                RETURNING id`,
            [d.patientId, date, d.status, d.reason, d.notes ?? null, userId]
            );
        
        if (!rows[0]) {
            throw new AppError(500, 'Échec de la création du rendez-vous.');
        }
        return rows[0].id;
    });
    return await getById(result);
}

export async function list({date, status, patientId}) {
    const cond = ['a.deleted_at IS NULL'];
    const params = [];
    if(date){
        params.push(date);
        cond.push(`
            a.appointment_date >= $${params.length}::date 
            AND a.appointment_date < ($${params.length}::date + 1)`
        );
    }
    if(status) {
        params.push(status);
        cond.push(`a.status = $${params.length}`);
    }
    if(patientId) {
        params.push(patientId);
        cond.push(`a.patient_id = $${params.length}`);
    }

    const where = cond.length ? `WHERE ${cond.join(' AND ')}`: '';
    const {rows} = await query(`${SELECT} ${where} ORDER BY a.appointment_date ASC LIMIT 500`, params);

    return rows;
}

export async function updateStatus(id, status){
    await withTransaction(async (client) => {
        const {rows} = await client.query(`
            SELECT patient_id, appointment_date FROM appointments
                WHERE id = $1`,
            [id]
        );
        
        if(!rows[0]) throw new AppError(404,'Appointment not found');
        const {patient_id, appointment_date} = rows[0];
        
        await lockPatient(client,patient_id);
        if(status === 'confirmed') await assertNoConflit(client, patient_id, appointment_date, id);
        await client.query(`
            UPDATE appointments 
                SET status = $1, updated_at = now() 
                WHERE id = $2`,
            [status, id]
        );
    });
    return await getById(id);
}
async function assertNoConflit(client, patientId, date, excludeId = null){
    const {rows} = await client.query(`
        SELECT id FROM appointments
            WHERE patient_id = $1
            AND status = 'confirmed'
            AND appointment_date > $2::timestamptz - interval '30 minutes'
            AND appointment_date < $2::timestamptz + interval '30 minutes'
            AND ($3::uuid IS NULL OR id <> $3::uuid)
            LIMIT 1`,
        [patientId, date, excludeId]
    );
    if(rows.length){
        throw new AppError(409, 'Ce patient possède déjà un rendez-vous confirmé dans un intervalle de 30 minutes autour de cet horaire.');
    }
}

async function lockPatient(client, patientId){
    const {rows}= await client.query(`
        SELECT id FROM patients 
            WHERE id = $1 FOR UPDATE`,
        [patientId]);
    if(!rows[0]) throw new AppError(404,'Patient introuvable.');
}

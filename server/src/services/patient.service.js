import { query, withTransaction } from "../config/db.js";
import { AppError } from "../utils/AppErrors.js";

const COLS = `id, full_name AS "fullName", cin, phone, birth_date AS "birthDate",
              address, created_at AS "createdAt"`;

const LIST_COLS = `${COLS},
  (SELECT COUNT(*)::int FROM appointments a
     WHERE a.patient_id = patients.id AND a.deleted_at IS NULL) AS "appointmentsCount",
  (SELECT COUNT(*)::int FROM appointments a
     WHERE a.patient_id = patients.id AND a.deleted_at IS NULL
       AND a.status = 'confirmed') AS "confirmedCount"`;

export async function create(d){
    const {rows} = await query(`
        INSERT INTO patients (full_name, cin, phone, birth_date, address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING ${COLS}`,
        [d.fullName, d.cin, d.phone, d.birthDate, d.address ?? null]);

    return rows[0];
}

export async function getById(id){
    const {rows} = await query(`
        SELECT ${COLS} FROM patients 
        WHERE id = $1
        AND deleted_at IS NULL`
        ,[id]);
    if(!rows[0]) throw new AppError(404, 'Patient introuvable.');
    return rows[0];
}

export async function list({search, page, limit}){
    const params = [];
    let where = 'WHERE deleted_at IS NULL';
    if(search){
        params.push(`%${search.replace(/[%_\\]/g, '\\$&')}%`);
        where += ` AND (full_name ILIKE $1 OR cin ILIKE $1)`;
    }
    const offset = (page - 1) * limit;
    const [items, count] = await Promise.all([
        query(
            `SELECT ${LIST_COLS} FROM patients ${where}
            ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
            [...params, limit, offset]
        ),
        query(`SELECT COUNT(*)::int AS total FROM patients ${where}`,params)
    ]);

    const total = count.rows[0].total;
    return {items: items.rows, total, page, limit, totalPages: Math.max(1,Math.ceil(total / limit))} ;
}

export async function update(id, d){
    const {rows} = await query(`
        UPDATE patients 
            SET full_name=$1, cin=$2, phone=$3, birth_date=$4,address=$5
            WHERE id=$6 AND deleted_at IS NULL
            RETURNING ${COLS}`,
        [d.fullName, d.cin, d.phone, d.birthDate,d.address ?? null, id])

    if(!rows[0]) throw new AppError(404,'Patient introuvable.');
    return rows[0];
}

export async function remove(id){
    await withTransaction(async  (client) =>{
        const { rows } = await client.query(
            'SELECT id FROM patients WHERE id = $1 AND deleted_at IS NULL FOR UPDATE',
            [id]
        );

        if(!rows[0]) throw new AppError(404,'Patient introuvable.');

        const { rows: confirmed } = await client.query(
            `SELECT 1 FROM appointments
                WHERE patient_id = $1 AND status = 'confirmed' AND deleted_at IS NULL
                LIMIT 1`,
            [id]
        );

        if (confirmed.length) {
            throw new AppError(409, 'Suppression impossible : ce patient a des rendez-vous confirmés.');
        }

        await client.query(
            'UPDATE appointments SET deleted_at = now() WHERE patient_id = $1 AND deleted_at IS NULL',
        [id]
        );
        await client.query('UPDATE patients SET deleted_at = now() WHERE id = $1', [id]);
    }); 
    
}
import { query } from "../config/db.js";
import { AppError } from "../utils/AppErrors.js";

const COLS = `id, full_name AS "fullName", cin, phone, birth_date AS "birthDate",
              address, created_at AS "createdAt"`;

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
    if(!rows[0]) throw new AppError(404, 'Patient not found');
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
        query(`SELECT ${COLS} FROM patients ${where}
        ORDER BY created_at DESC 
        LIMIT $${params.length +1} 
        OFFSET $${params.length +2}`,
        [...params, limit, offset]),
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

    if(!rows[0]) throw new AppError(404,'Patient not found');
    return rows[0];
}

export async function remove(id){
    const {rows} = await query(`
        UPDATE patients 
            SET deleted_at = NOW()
            WHERE id = $1
            RETURNING id`,
        [id])
    if(!rows[0]) throw new AppError(404,'Patient not found');
}
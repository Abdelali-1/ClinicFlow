import pg from 'pg';
import {env} from './env.js';

//return  date as  clomun  YYYY-MM-DD instead of 2023-06-20T00:00:00.000Z
pg.types.setTypeParser(1082, (value) => value);

export const pool = new pg.Pool({
    connectionString: env.databaseUrl, max: 10
});

export const query = (text, parms) => pool.query(text, parms);

export async function withTransaction(callback) {
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch(err){
        await client.query('ROLLBACK');
        throw err;
    }
    finally{
        client.release();
    }
}  
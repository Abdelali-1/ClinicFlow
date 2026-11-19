import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {pool} from "../config/db.js";

const  dir = path.join(path.dirname(fileUrlToPath(import.meta.url)), "migrations");

const run = async () => {
    await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY, run_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);

    const done = new Set((await pool.query('SELECT name FROM  schema_mogrations')).rows.map((r) => r.name));
    for(const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort())
    {
        if(done.has(file)) continue;
        const  client = await pool.connect();
        try{
            await client.query('BEGIN');
            await client.query(fs.readFileSync(path.join(dir, file), 'utf8'));
            await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [file]);
            await client.query('COMMIT');
            console.log(`Migration ${file} applied successfully.`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Error occurred while applying migration ${file}:`, err);
            throw err;
        } finally {
            client.release();
        }
    }
}
run().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
});


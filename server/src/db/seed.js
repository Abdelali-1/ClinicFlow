import bcrypt from "bcrypt";
import { pool } from "../config/db.js";

const at = (dayOffset, h, m = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(h, m, 0, 0);
  return date.toISOString();
};

const run = async() =>{
    const client = await pool.connect();
    try{
        await client.query('BEGIN');
        await client.query('TRUNCATE appointments, patients, users CASCADE');

        const passwordHash = await bcrypt.hash('Aliouka123123@#', 10);
        const users = [
            ['Admin Clinic', 'admin@clinicFlow.com', 'admin'],
            ['Ali staff', 'ali.staff@clinicFlow.com', 'staff'],
            ['Omar Staff', 'omar.staff@clinicFlow.com', 'staff']
        ];
        const userIds = [];
        for(const [full_name,email,role] of users){
            const res = await client.query('INSERT INTO users(full_name,email,password_hash,role) VALUES($1, $2, $3, $4) RETURNING id',
                [full_name,email,passwordHash,role]
            );
            userIds.push(res.rows[0].id);
        }
        const patients = [
            ['Youssef Alaoui', 'AB123456', '0600000001', '1990-05-12', 'Casablanca'],
            ['Fatima Zahra', 'BE234567', '0600000002', '1985-11-03', 'Rabat'],
            ['Karim Bennani', 'CD345678', '0600000003', '2000-01-25', null],
            ['Salma Idrissi', 'EF456789', '0600000004', '1978-07-30', 'Marrakech'],
            ['Hamza Tazi', 'GH567890', '0600000005', '1995-09-18', 'Tanger'],
        ];

        const patientIds = [];
        for(const p of patients)
        {
            const res = await client.query('INSERT INTO patients(full_name,cin,phone,birth_date,address) VALUES($1,$2,$3,$4,$5) RETURNING id', p);
            patientIds.push(res.rows[0].id);
        }

        const appts = [
            [0, 0, 9, 0, 'confirmed', 'Consultation', 1],
            [1, 0, 10, 30, 'pending', 'Check-up', 1],
            [2, 0, 14, 0, 'confirmed', 'Blood test', 2],
            [0, 1, 11, 0, 'pending', 'Follow-up', 2],
            [3, 1, 15, 30, 'confirmed', 'Vaccination', 1],
            [4, -1, 9, 30, 'cancelled', 'Dental pain', 2],
            [1, 2, 10, 0, 'confirmed', 'X-ray', 0],
            [2, -2, 16, 0, 'confirmed', 'Consultation', 1],
            [3, 0, 16, 30, 'pending', 'Headache', 2],
            [4, 3, 8, 30, 'cancelled', 'Check-up', 0],
        ];
        for (const [pi, day, h, m, status, reason, ui] of appts) {
            await client.query(
                `INSERT INTO appointments(patient_id,appointment_date,status,reason,created_by)
                VALUES($1,$2,$3,$4,$5)`,
                [patientIds[pi], at(day, h, m), status, reason, userIds[ui]]
            );
        }
        await client.query('COMMIT');
        console.log('Database seeded successfully.');
    }
    catch(err){
        await client.query('ROLLBACK');
        console.error('Error seeding database:', err);
        throw err;
    }
    finally{
        client.release();
        await pool.end();
    }
};

run().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});

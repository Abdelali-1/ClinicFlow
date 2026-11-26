import request from 'supertest';
import app from '../app.js';
import { pool } from '../config/db.js';

const PASSWORD = 'Aliouka123';
const login = async (email) =>
  (await request(app).post('/api/auth/login').send({ email, password: PASSWORD })).body.token;

let adminToken, staffToken, patientId;
const cin = 'T' + Date.now().toString().slice(-8);
const asAdmin = () => ({ Authorization: `Bearer ${adminToken}` });
const asStaff = () => ({ Authorization: `Bearer ${staffToken}` });

const patientPayload = {
  fullName: 'Test Patient', cin, phone: '0601229322', birthDate: '1990-01-01',
};

// cancel confirmed appointments (otherwise delete -> 409), then delete the patient
const cleanupPatient = async (id) => {
  const list = await request(app)
    .get(`/api/appointments?patientId=${id}&status=confirmed`)
    .set(asAdmin());
  for (const a of list.body.items || []) {
    await request(app)
      .patch(`/api/appointments/${a.id}/status`)
      .set(asAdmin())
      .send({ status: 'cancelled' });
  }
  await request(app).delete(`/api/patients/${id}`).set(asAdmin());
};

beforeAll(async () => {
  adminToken = await login('admin@clinicflow.com');
  staffToken = await login('ali.staff@clinicflow.com');
  const res = await request(app).post('/api/patients').set(asStaff()).send(patientPayload);
  patientId = res.body.patient.id;
});

afterAll(async () => {
  await cleanupPatient(patientId);
  await pool.end();
});

/* ------------------------------------------------------------------ */
describe('Auth', () => {
  test('login OK returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@clinicflow.com', password: PASSWORD });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test('wrong password -> 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@clinicflow.com', password: 'nope' });
    expect(res.status).toBe(401);
  });

  test('invalid body -> 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });

  test('protected route without token -> 401', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).toBe(401);
  });
});

/* ------------------------------------------------------------------ */
describe('Patients', () => {
  test('duplicate CIN -> 409', async () => {
    const res = await request(app).post('/api/patients').set(asStaff()).send(patientPayload);
    expect(res.status).toBe(409);
  });

  test('unknown id -> 404', async () => {
    const res = await request(app)
      .get('/api/patients/00000000-0000-0000-0000-000000000000')
      .set(asStaff());
    expect(res.status).toBe(404);
  });

  test('staff cannot delete -> 403', async () => {
    const res = await request(app).delete(`/api/patients/${patientId}`).set(asStaff());
    expect(res.status).toBe(403);
  });

  test('search by CIN works', async () => {
    const res = await request(app).get(`/api/patients?search=${cin}`).set(asStaff());
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(1);
  });
});

/* ------------------------------------------------------------------ */
describe('Appointments: 30 minute rule', () => {
  const create = (iso, status = 'confirmed') =>
    request(app)
      .post('/api/appointments')
      .set(asStaff())
      .send({ patientId, appointmentDate: iso, status, reason: 'Test visit' });

  test('first confirmed appointment OK', async () => {
    const res = await create('2030-01-01T10:00:00.000Z');
    expect(res.status).toBe(201);
  });

  test('confirmed 10 min later -> 409', async () => {
    const res = await create('2030-01-01T10:10:00.000Z');
    expect(res.status).toBe(409);
  });

  test('pending 10 min later is allowed, but confirming it -> 409', async () => {
    const created = await create('2030-01-01T10:10:00.000Z', 'pending');
    expect(created.status).toBe(201);
    const res = await request(app)
      .patch(`/api/appointments/${created.body.appointment.id}/status`)
      .set(asStaff())
      .send({ status: 'confirmed' });
    expect(res.status).toBe(409);
  });

  test('confirmed 45 min later -> OK', async () => {
    const res = await create('2030-01-01T10:45:00.000Z');
    expect(res.status).toBe(201);
  });
});

/* ------------------------------------------------------------------ */
describe('Patients: soft delete', () => {
  let n = 0;
  const newPatient = async () => {
    n += 1;
    const res = await request(app)
      .post('/api/patients')
      .set(asStaff())
      .send({
        fullName: `Delete Test ${n}`,
        cin: `S${Date.now().toString().slice(-7)}${n}`,
        phone: '0600000000',
        birthDate: '1990-01-01',
      });
    return res.body.patient;
  };

  const addAppointment = (pid, status) =>
    request(app)
      .post('/api/appointments')
      .set(asStaff())
      .send({
        patientId: pid,
        appointmentDate: '2031-01-01T10:00:00.000Z',
        status,
        reason: 'Test visit',
      });

  test('patient with a confirmed appointment -> 409 and stays active', async () => {
    const p = await newPatient();
    await addAppointment(p.id, 'confirmed');

    const del = await request(app).delete(`/api/patients/${p.id}`).set(asAdmin());
    expect(del.status).toBe(409);

    const get = await request(app).get(`/api/patients/${p.id}`).set(asStaff());
    expect(get.status).toBe(200); // not deleted

    await cleanupPatient(p.id);
  });

  test('patient without confirmed appointment -> 204, then 404 and hidden from search', async () => {
    const p = await newPatient();
    await addAppointment(p.id, 'pending');

    const del = await request(app).delete(`/api/patients/${p.id}`).set(asAdmin());
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/patients/${p.id}`).set(asStaff());
    expect(get.status).toBe(404);

    const search = await request(app).get(`/api/patients?search=${p.cin}`).set(asStaff());
    expect(search.body.items.length).toBe(0);
  });

  test('appointments of a deleted patient are hidden', async () => {
    const p = await newPatient();
    await addAppointment(p.id, 'pending');
    await request(app).delete(`/api/patients/${p.id}`).set(asAdmin());

    const res = await request(app).get(`/api/appointments?patientId=${p.id}`).set(asStaff());
    expect(res.status).toBe(200);
    expect(res.body.items.length).toBe(0);
  });

  test('deleting twice -> 404', async () => {
    const p = await newPatient();
    await request(app).delete(`/api/patients/${p.id}`).set(asAdmin());
    const res = await request(app).delete(`/api/patients/${p.id}`).set(asAdmin());
    expect(res.status).toBe(404);
  });

  test('CIN of a deleted patient can be reused -> 201', async () => {
    const p = await newPatient();
    await request(app).delete(`/api/patients/${p.id}`).set(asAdmin());

    const res = await request(app)
      .post('/api/patients')
      .set(asStaff())
      .send({ fullName: 'Reused CIN', cin: p.cin, phone: '0600000000', birthDate: '1990-01-01' });
    expect(res.status).toBe(201);

    await request(app).delete(`/api/patients/${res.body.patient.id}`).set(asAdmin());
  });

  test('staff cannot delete -> 403', async () => {
    const p = await newPatient();
    const res = await request(app).delete(`/api/patients/${p.id}`).set(asStaff());
    expect(res.status).toBe(403);
    await request(app).delete(`/api/patients/${p.id}`).set(asAdmin());
  });
});
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; --- for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- fast ilike search  


CREATE TYPE user_role AS ENUM ('admin', 'staff');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE users(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name varchar(50) NOT NULL,
    email varchar(254) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE patients(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name varchar(50) NOT NULL,
    cin varchar(20) UNIQUE NOT NULL,
    phone varchar(20) NOT NULL,
    birth_date DATE NOT NULL,
    address TEXT ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE appointments(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    appointment_date TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    reason VARCHAR(255) NOT NULL,
    notes TEXT,
    created_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

--search index 
CREATE INDEX idx_patients_full_name_trgm ON patients USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_patients_cin_trgm ON patients USING gin (cin gin_trgm_ops);
CREATE INDEX idx_patients_created_at ON patients (created_at DESC);
CREATE INDEX idx_patients_active ON patients (created_at DESC) WHERE deleted_at IS NULL;

--search index for appointments
CREATE INDEX idx_appt_patient_date ON appointments (patient_id, appointment_date);
CREATE INDEX idx_appt_date ON appointments (appointment_date);
CREATE INDEX idx_appt_status ON appointments (status);
CREATE INDEX idx_appt_confirmed ON appointments (patient_id, appointment_date) WHERE status = 'confirmed';

--search index  for audit_logs
CREATE INDEX idx_audit_user ON audit_logs (user_id);
CREATE INDEX idx_audit_entity ON audit_logs (entity, entity_id);
CREATE INDEX idx_audit_created_at ON audit_logs (created_at DESC);
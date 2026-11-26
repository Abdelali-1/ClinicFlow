-- ADD: soft delete column on appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- DELETE: global unique on CIN
-- ADD: unique only among active patients
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_cin_key;
CREATE UNIQUE INDEX IF NOT EXISTS patients_cin_active_uniq
  ON patients (cin) WHERE deleted_at IS NULL;

-- CHANGE: name length 50 -> 120 (same as Zod)
ALTER TABLE users    ALTER COLUMN full_name TYPE VARCHAR(120);
ALTER TABLE patients ALTER COLUMN full_name TYPE VARCHAR(120);

-- DELETE: duplicate index (idx_patients_active already covers it)
DROP INDEX IF EXISTS idx_patients_created_at;

-- DELETE then ADD: appointment indexes, now ignoring soft-deleted rows
DROP INDEX IF EXISTS idx_appt_patient_date;
DROP INDEX IF EXISTS idx_appt_date;
DROP INDEX IF EXISTS idx_appt_status;
DROP INDEX IF EXISTS idx_appt_confirmed;

CREATE INDEX idx_appt_patient_date ON appointments (patient_id, appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_appt_date         ON appointments (appointment_date)             WHERE deleted_at IS NULL;
CREATE INDEX idx_appt_status       ON appointments (status)                       WHERE deleted_at IS NULL;
CREATE INDEX idx_appt_confirmed    ON appointments (patient_id, appointment_date)
  WHERE status = 'confirmed' AND deleted_at IS NULL;
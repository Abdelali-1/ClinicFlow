const bearer = [{ bearerAuth: [] }];
const id = { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } };
const json = (schema) => ({ content: { 'application/json': { schema } } });

const patientBody = {
  type: 'object',
  required: ['fullName', 'cin', 'phone', 'birthDate'],
  properties: {
    fullName: { type: 'string' },
    cin: { type: 'string' },
    phone: { type: 'string' },
    birthDate: { type: 'string', example: '1990-05-12' },
    address: { type: 'string', nullable: true },
  },
};

export default {
  openapi: '3.0.3',
  info: { title: 'ClinicFlow API', version: '1.0.0' },
  servers: [{ url: 'http://localhost:4000' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
  },
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          ...json({
            type: 'object',
            required: ['email', 'password'],
            properties: {
              email: { type: 'string', example: 'admin@clinicflow.com' },
              password: { type: 'string', example: 'Password123!' },
            },
          }),
        },
        responses: { 200: { description: 'token + user' }, 400: { description: 'Validation error' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/api/auth/me': {
      get: { tags: ['Auth'], summary: 'Current user', security: bearer, responses: { 200: { description: 'OK' }, 401: { description: 'Unauthorized' } } },
    },
    '/api/patients': {
      post: {
        tags: ['Patients'], summary: 'Create patient', security: bearer,
        requestBody: { required: true, ...json(patientBody) },
        responses: { 201: { description: 'Created' }, 400: { description: 'Validation error' }, 409: { description: 'Duplicate CIN' } },
      },
      get: {
        tags: ['Patients'], summary: 'List patients (paginated, searchable)', security: bearer,
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/patients/{id}': {
      get: { tags: ['Patients'], summary: 'Get patient', security: bearer, parameters: [id], responses: { 200: { description: 'OK' }, 404: { description: 'Not found' } } },
      put: {
        tags: ['Patients'], summary: 'Update patient', security: bearer, parameters: [id],
        requestBody: { required: true, ...json(patientBody) },
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' }, 409: { description: 'Duplicate CIN' } },
      },
      delete: { tags: ['Patients'], summary: 'Delete patient (admin only)', security: bearer, parameters: [id], responses: { 204: { description: 'Deleted' }, 403: { description: 'Forbidden' }, 404: { description: 'Not found' } } },
    },
    '/api/appointments': {
      post: {
        tags: ['Appointments'], summary: 'Create appointment', security: bearer,
        requestBody: {
          required: true,
          ...json({
            type: 'object',
            required: ['patientId', 'appointmentDate', 'reason'],
            properties: {
              patientId: { type: 'string', format: 'uuid' },
              appointmentDate: { type: 'string', format: 'date-time' },
              status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] },
              reason: { type: 'string' },
              notes: { type: 'string', nullable: true },
            },
          }),
        },
        responses: { 201: { description: 'Created' }, 404: { description: 'Patient not found' }, 409: { description: '30-minute rule violated' } },
      },
      get: {
        tags: ['Appointments'], summary: 'List appointments', security: bearer,
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string', example: '2026-11-18' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] } },
          { name: 'patientId', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/api/appointments/{id}/status': {
      patch: {
        tags: ['Appointments'], summary: 'Update status', security: bearer, parameters: [id],
        requestBody: {
          required: true,
          ...json({ type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['pending', 'confirmed', 'cancelled'] } } }),
        },
        responses: { 200: { description: 'OK' }, 404: { description: 'Not found' }, 409: { description: '30-minute rule violated' } },
      },
    },
    '/api/dashboard/stats': {
      get: { tags: ['Dashboard'], summary: 'Dashboard statistics', security: bearer, responses: { 200: { description: 'OK' } } },
    },
  },
};
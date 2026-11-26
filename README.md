# ClinicFlow
## ClinicFlow_server
-mdkir server

# 1. database
psql -U postgres -c "CREATE DATABASE clinicflow;"

-npm init -y
-npm i express pg bcrypt jsonwebtoken zod@3 cors helmet morgan dotenv
-npm i -D nodemon

npm run migrate
npm run seed
npm run dev

## swagger
npm i swagger-ui-express

## test
npm i -D jest supertest
npm run test
## Env variables (backend/.env)
PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, CLIENT_URL

# ClinicFlow
## ClinicFlow_client
npm create vite@latest client -- --template react
npm i 
npm i axios react-router-dom
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material
npm install @mui/x-data-grid
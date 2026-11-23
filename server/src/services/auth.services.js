import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppErrors.js';

const publicUser = (u) => ({id: u.id, fullName: u.full_name, email : u.email, role: u.role});

export async function login(email, password){
     const { rows } = await query(
        `SELECT id, full_name, email, password_hash, role
         FROM users
         WHERE email = $1`,
        [email]
    );

    const user = rows[0];
    const result = user && (await bcrypt.compare(password, user.password_hash));
    if(!result) throw new AppError(401,'Invalid user or password');

    const token = jwt.sign({sub: user.id, role: user.role}, env.jwtSecret, {expiresIn: env.jwtExpiration});
    return {token, user: publicUser(user)};
}

export async function GetMe(id){
    const {rows} = await query(
        `SELECT id, full_name, email, password_hash, role 
            FROM users 
            WHERE id = $1 `,
        [id]);

    if(!rows[0]) throw new AppError(401, 'User not exist');
    return publicUser(rows[0]);
}
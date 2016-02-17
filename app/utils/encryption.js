import _ from 'lodash';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const options = {
  subject: 'Auth token',
  audience: 'Forum user',
  issuer: 'DitchCrab',
};

let path = __dirname.split('/').slice(0, 3).join('/');
export function genToken(obj) {
  return new Promise((resolve, reject) => {
    let cert = fs.readFileSync( path + '/.ssh/id_rsa');
    jwt.sign(obj, cert, _.extend(options, {algorithm: 'RS256'}), (token) => {
      if (!token) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  })
};

export function verifyToken(token) {
  return new Promise((resolve, reject) => {
    let cert = fs.readFileSync( path + '/.ssh/public.pem');
    jwt.verify(token, cert, _.extend(options, {algorithms: ['RS256']}), (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  })
};

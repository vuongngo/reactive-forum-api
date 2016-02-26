import _ from 'lodash';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

const options = {
  subject: 'Auth token',
  audience: 'Forum user',
  issuer: 'DitchCrab',
};

var sshPath;
if (process.env.NODE_ENV === 'test') {
  sshPath = __dirname.split('/').slice(0, 3).join('/');
} else {
  sshPath = __dirname + 'Users/vuongngo';
}
export function genToken(obj) {
  return new Promise((resolve, reject) => {
    let cert = fs.readFileSync( path.join(sshPath, '/.ssh/id_rsa'));
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
    let cert = fs.readFileSync( path.join(sshPath, '/.ssh/public.pem'));
    jwt.verify(token, cert, _.extend(options, {algorithms: ['RS256']}), (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  })
};

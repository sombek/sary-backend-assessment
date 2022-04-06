/* eslint-env jest */

import request from 'supertest';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import app from '../../index';
import config from '../../config/config';
import db from '../../config/sequelize';

const apiVersionPath = `/api/v${config.apiVersion}`;

describe('## Auth APIs', () => {
  let testApp;

  beforeAll(() => {
    testApp = request(app);
  });

  afterAll((done) => {
    db.sequelize.close()
      .then(() => done())
      .catch(done);
  });

  const validUserCredentials = {
    employeeNumber: '1000',
    password: '123456',
  };

  const invalidUserCredentials = {
    employeeNumber: '999',
    password: '123456',
  };

  let jwtToken;

  describe(`# POST ${apiVersionPath}/auth/login`, () => {
    test('should return Authentication error', (done) => {
      testApp
        .post(`${apiVersionPath}/auth/login`)
        .send(invalidUserCredentials)
        // .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          console.log(res)
          expect(res.body.message).toEqual('Authentication error');
          done();
        })
        .catch(done);
    });

    test('should get valid JWT token', (done) => {
      testApp
        .post(`${apiVersionPath}/auth/login`)
        .send(validUserCredentials)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).toHaveProperty('token');
          jwt.verify(res.body.token, config.jwtSecret, (err, decoded) => {
            expect(!err);
            expect(decoded.username).toEqual(validUserCredentials.username);
            jwtToken = `Bearer ${res.body.token}`;
            done();
          });
        })
        .catch(done);
    });
  });

  describe(`# GET ${apiVersionPath}/users`, () => {
    test('should fail to get random number because of missing Authorization', (done) => {
      testApp
        .get(`${apiVersionPath}/auth/random-number`)
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).toEqual('Unauthorized');
          done();
        })
        .catch(done);
    });

    test('should fail to get users because of wrong token', (done) => {
      testApp
        .get(`${apiVersionPath}/users`)
        .set('Authorization', 'Bearer inValidToken')
        .expect(httpStatus.UNAUTHORIZED)
        .then((res) => {
          expect(res.body.message).toEqual('Unauthorized');
          done();
        })
        .catch(done);
    });

    test('should get at least one user', (done) => {
      testApp
        .get(`${apiVersionPath}/users`)
        .set('Authorization', jwtToken)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(typeof res.body.length > 0);
          done();
        })
        .catch(done);
    });
  });
});

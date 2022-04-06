/* eslint-env jest */

import request from "supertest";
import httpStatus from "http-status";
import app from "../../index";
import config from "../../config/config";
import db from "../../config/sequelize";
import jwt from "jsonwebtoken";

const apiVersionPath = `/api/v${config.apiVersion}`;
const validUserCredentials = {
  employeeNumber: "1000",
  password: "123456"
};
let jwtToken;
describe("## User APIs", () => {
  let testApp;

  beforeAll(() => {
    testApp = request(app);
    testApp
      .post(`${apiVersionPath}/auth/login`)
      .send(validUserCredentials)
      .expect(httpStatus.OK)
      .then((res) => {
        expect(res.body).toHaveProperty("token");
        jwtToken = `Bearer ${res.body.token}`;
      });
  })
    .catch(done);

  afterAll((done) => {
    db.sequelize.close()
      .then(() => done())
      .catch(done);
  });

  let user = {
    name: "Jest user", employeeNumber: "0001", employeeType: "Employee", password: "123456"
  };

  describe("# Error Handling", () => {
    test("should handle express validation error - employeeNumber is required", (done) => {
      testApp
        .post(`${apiVersionPath}/users`)
        .set('Authorization', jwtToken)
        .send({
          password: "KK123"
        })
        .expect(httpStatus.BAD_REQUEST)
        .catch(done);
    });
  });

  describe(`# POST ${apiVersionPath}/users`, () => {
    test("should create a new user", (done) => {
      testApp
        .post(`${apiVersionPath}/users`)
        .set('Authorization', jwtToken)
        .send(user)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.employeeNumber).toEqual(user.employeeNumber);
          user = res.body;
          done();
        })
        .catch(done);
    });
  });

  describe(`# GET ${apiVersionPath}/users`, () => {
    test("should get all users", (done) => {
      testApp
        .get(`${apiVersionPath}/users`)
        .set('Authorization', jwtToken)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(Array.isArray(res.body));
          done();
        })
        .catch(done);
    });

  });

});

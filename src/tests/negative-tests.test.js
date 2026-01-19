import got from 'got';
import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { BASE_URL, env, TIMEOUT } from '../environment/environment.js';

describe('NEGATIVE TESTS: Booking Flow',  function() {

    this.timeout(TIMEOUT);

    describe('Admin Login - Incorrect Password',  function() {
        let response;
        let responseBody;

        before(async function() {
            response = await got.post(`${BASE_URL}/auth`, {
                json: {
                    username: env.admin_username,
                    password: env.admin_password + env.admin_password
                }
            });
            responseBody = JSON.parse(response.body);
        });

        it('Admin Login response time is under 1000ms', function () {
            expect(response.timings.phases.total).to.be.below(1000);
        });

        it('Admin Login response Status is 200', function() {
            expect(response.statusCode).to.equal(200);
        });

        it('Admin Login response does not contain token', function() {
            expect(responseBody).not.to.have.property('token');
        });

        it('Admin Login response contains Bad Credentials message', function() {
            expect(responseBody).to.have.property('reason', 'Bad credentials');
        });
        
    });

});
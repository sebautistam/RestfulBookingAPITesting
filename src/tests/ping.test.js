import got from 'got';
import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { BASE_URL, env, TIMEOUT } from '../environment/environment.js';

describe('PING TEST', function() {

    this.timeout(TIMEOUT);
    let response;

    before(async function() {
        response = await got.get(`${BASE_URL}/ping`);
    });

    it('Ping response time is under 1000ms', function () {
        expect(response.timings.phases.total).to.be.below(1000);
    });

    it('Response Status is 201', async function() {
        expect(response.statusCode).to.equal(201);
    });

    it('Response includes correct text ("Created")', async function() {
        expect(response.body).to.include('Created');
    });
});
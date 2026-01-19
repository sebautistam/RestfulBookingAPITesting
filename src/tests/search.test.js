import got from 'got';
import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { BASE_URL, env, TIMEOUT } from '../environment/environment.js';
import { bookingSearchResponseSchema } from '../schemas/full-booking.schemas.js';


describe('Seach for a Booking Flow', function(){
    this.timeout(TIMEOUT);

    let createResponse, bookingId;

    before(async function() {
        const bookingData = {
            firstname: env.first_name,
            lastname: env.last_name,
            totalprice: Number(env.total_price),
            depositpaid: env.deposit_paid === 'true',
            bookingdates: {
                checkin: env.checkin_date,
                checkout: env.checkout_date
            },
            additionalneeds: env.additional_needs
        };

        createResponse = await got.post(`${BASE_URL}/booking`, {
            json: bookingData,
            responseType: 'json'
        });        
        bookingId= createResponse.body.bookingid;
    });

    describe('Search for a booking by First Name',  function() {
        let response, responseBody;

        before(async function() {
            response = await got.get(`${BASE_URL}/booking`, {
                searchParams: { firstname: env.first_name },
                responseType: 'json'
            });
            responseBody = response.body;
        });
        
        it('Find Booking time by First Name is under 3000ms', async function () {
            expect(response.timings.phases.total).to.be.below(3000);
        });

        it('Search Booking by First Name returns status 200', async function () {
            expect(response.statusCode).to.equal(200);
        });

        it('Look for Booking by First Name', async function() {
            const found = responseBody.some(booking => booking.bookingid === bookingId);
            expect(found).to.be.true;
        });

        it('Search Booking by First Name response matches schema', async function () {
            const { error } = bookingSearchResponseSchema.validate(responseBody);
            expect(error, error?.message).to.be.undefined;
        });
    });

    describe('Search for a booking by Last Name',  function() {

        let response, responseBody;

        before( async function() {
            response = await got.get(`${BASE_URL}/booking`, {
                searchParams: { lastname: env.last_name },
                responseType: 'json'
            });
            responseBody = response.body;
        });

        it('Find Booking time by Last Name is under 3000ms', async function () {
            expect(response.timings.phases.total).to.be.below(3000);
        });

        it('Search Booking by Last Name returns status 200', async function () {
            expect(response.statusCode).to.equal(200);
        });

        it('Look for Booking by Last Name', async function() {
            const found = responseBody.some(booking => booking.bookingid === bookingId);
            expect(found).to.be.true;
        });

        it('Search Booking by Last Name response matches schema', async function () {
            const { error } = bookingSearchResponseSchema.validate(responseBody);
            expect(error, error?.message).to.be.undefined;
        });
        
    });

    describe('Update Only Name in Booking and look for it', function() {

        let response, responseBody;

        before(async function(){
            const updateResponse = await got.patch(`${BASE_URL}/booking/${bookingId}`, {
                json: { firstname: env.first_name2 },
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${env.admin_username}:${env.admin_password}`).toString('base64')}`
                }
            }).json();

            response = await got.get(`${BASE_URL}/booking`, {
                searchParams: { firstname: env.first_name2 },
                responseType: 'json'
            });
            responseBody = response.body;
        });

        it('Find Booking time by Updated First Name is under 3000ms', async function () {
            expect(response.timings.phases.total).to.be.below(3000);
        });

        it('Search Booking by Updated First Name returns status 200', async function () {
            expect(response.statusCode).to.equal(200);
        });

        it('Look for Booking by Updated First Name', async function() {
            const found = responseBody.some(booking => booking.bookingid === bookingId);
            expect(found).to.be.true;
        });

        it('Search Booking by Updated First Name response matches schema', async function () {
            const { error } = bookingSearchResponseSchema.validate(responseBody);
            expect(error, error?.message).to.be.undefined;
        });

    });

});
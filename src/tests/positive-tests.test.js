import got from 'got';
import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { BASE_URL, env, TIMEOUT } from '../environment/environment.js';

describe('POSITIVE TESTS: Full Booking Flow',  function() {

    this.timeout(TIMEOUT);
    let bookingIdCreated;

    describe('Admin Login',  function() {

        let authResponse;

        before(async function() {
            authResponse = await got.post(`${BASE_URL}/auth`, {
                json: {
                    username: env.admin_username,
                    password: env.admin_password
                }
            });
        });

        it('Create Booking response time is under 1000ms', function () {
            expect(authResponse.timings.phases.total).to.be.below(1000);
        });

        it('Admin Login Header: Content-Type is application/json', function() {
            expect(authResponse.headers).to.have.property('content-type', 'application/json; charset=utf-8');
        });

        it('Admin Login Response Status is 200', function() {
            expect(authResponse.statusCode).to.equal(200);
        });

        it('Admin Login response contains token', function() {
            const authBody = JSON.parse(authResponse.body);
            expect(authBody).to.have.property('token');
        });
    
    });

    describe('Create Booking',  function() {
        let createResponse, createResponseBody;

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

        before(async function() {
            createResponse = await got.post(`${BASE_URL}/booking`, {
                json: bookingData,
                responseType: 'json'
            });        
            createResponseBody = createResponse.body;
        });

        it('Create Booking response time is under 3000ms', function () {
            expect(createResponse.timings.phases.total).to.be.below(3000);
        });
        
        it('Create Booking Header: Content-Type is application/json', function() {
            expect(createResponse.headers).to.have.property('content-type', 'application/json; charset=utf-8');
        });

        it('Create Booking Response Status is 200',  function() {
            expect(createResponse.statusCode).to.equal(200);
        });

        it('Create Booking response contains a Booking ID', function() {
            expect(createResponseBody).to.have.property('bookingid');
            bookingIdCreated= createResponseBody.bookingid;
        });

        it('Create Booking response has correct info', function() {
            expect(createResponseBody.booking.firstname).to.equal(env.first_name);
            expect(createResponseBody.booking.lastname).to.equal(env.last_name);
            expect(createResponseBody.booking.totalprice).to.equal(Number(env.total_price));
            expect(createResponseBody.booking.depositpaid).to.equal(env.deposit_paid === 'true');
            expect(createResponseBody.booking.bookingdates.checkin).to.equal(env.checkin_date);
            expect(createResponseBody.booking.bookingdates.checkout).to.equal(env.checkout_date);
            expect(createResponseBody.booking.additionalneeds).to.equal(env.additional_needs);
        });
        
    });

    describe('Get Booking Just created',  function() {
        let getResponse;
        let getResponseBody;

        before(async function() {
            getResponse = await got.get(`${BASE_URL}/booking/${bookingIdCreated}`, {
                responseType: 'json'
            });        
            getResponseBody = getResponse.body;
        });

        it('Get Booking response time is under 500ms', function () {
            expect(getResponse.timings.phases.total).to.be.below(500);
        });

        it('Get Created Booking Response Status is 200',  function() {
            expect(getResponse.statusCode).to.equal(200);
        });

        it('Get Created Booking has correct First Name', function() {
            expect(getResponseBody.firstname).to.equal(env.first_name);
        });
    });
    
    describe('Update Booking',  function() {

        let updateResponse, updateResponseBody;

        const updateData = {
        firstname: env.first_name2,
        lastname: env.last_name2,
        totalprice: Number(env.total_price2),
        depositpaid: env.deposit_paid2 === 'true',
        bookingdates: {
            checkin: env.checkin_date2,
            checkout: env.checkout_date2
        },
        additionalneeds: env.additional_needs2
        };

        before(async function() {
            updateResponse = await got.put(`${BASE_URL}/booking/${bookingIdCreated}`, {
                json: updateData,
                headers: {
                    'Authorization': `Basic ${Buffer
                        .from(`${env.admin_username}:${env.admin_password}`)
                        .toString('base64')}`
                },
                responseType: 'json'
            });       
            updateResponseBody = updateResponse.body;
        });

        it('Update Booking response time is under 3000ms', function () {
            expect(updateResponse.timings.phases.total).to.be.below(3000);
        });

        it('Update Booking Header: Content-Type is application/json',  function() {
            expect(updateResponse.headers).to.have.property('content-type', 'application/json; charset=utf-8');
        });

        it('Update Booking Response Status is 200',   function() {
            expect(updateResponse.statusCode).to.equal(200);
        });

        it('Create Booking response has correct info',  function() {
            expect(updateResponseBody.firstname).to.equal(env.first_name2);
            expect(updateResponseBody.lastname).to.equal(env.last_name2);
            expect(updateResponseBody.totalprice).to.equal(Number(env.total_price2));
            expect(updateResponseBody.depositpaid).to.equal(env.deposit_paid2 === 'true');
            expect(updateResponseBody.bookingdates.checkin).to.equal(env.checkin_date2);
            expect(updateResponseBody.bookingdates.checkout).to.equal(env.checkout_date2);
            expect(updateResponseBody.additionalneeds).to.equal(env.additional_needs2);
        });    
    });
    
    describe('Delete Booking', function () {
        let deleteResponse;
        
        before( async function() {
            deleteResponse = await got.delete(`${BASE_URL}/booking/${bookingIdCreated}`, {
                headers: {
                    'Authorization': `Basic ${Buffer
                        .from(`${env.admin_username}:${env.admin_password}`)
                        .toString('base64')}`
                }
            });
        });

        it('Delete Booking response time is under 1000ms', function () {
            expect(deleteResponse.timings.phases.total).to.be.below(1000);
        });

        it('Delete Booking Response Status is 201',  async function() {
            expect(deleteResponse.statusCode).to.equal(201);
        });

        it('Delete Booking Response includes correct text ("Created") ',  async function() {
            expect(deleteResponse.body).to.include('Created');
        });

    });

});

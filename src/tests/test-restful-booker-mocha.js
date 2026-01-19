import got from 'got';
import { describe, it, before } from 'mocha';
import { expect } from 'chai';
import { BASE_URL, env, TIMEOUT } from '../environment/environment.js';

describe('Restful Booker API Tests', function() {
    this.timeout(TIMEOUT);

    describe('POSITIVE TESTING', function() {
        describe('Full Booking Flow', function() {
            let bookingId;
            
            it('Admin Login', async function() {
                const response = await got.post(`${BASE_URL}/auth`, {
                    json: {
                        username: env.admin_username,
                        password: env.admin_password
                    }
                }).json();
                
                expect(response).to.have.property('token');
            });

            it('Create Booking', async function() {
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

                const response = await got.post(`${BASE_URL}/booking`, {
                    json: bookingData
                }).json();

                expect(response).to.have.property('bookingid');
                bookingId = response.bookingid;
                
                expect(response.booking.firstname).to.equal(env.first_name);
                expect(response.booking.lastname).to.equal(env.last_name);
                expect(response.booking.totalprice).to.equal(Number(env.total_price));
                expect(response.booking.depositpaid).to.equal(env.deposit_paid === 'true');
                expect(response.booking.bookingdates.checkin).to.equal(env.checkin_date);
                expect(response.booking.bookingdates.checkout).to.equal(env.checkout_date);
                expect(response.booking.additionalneeds).to.equal(env.additional_needs);
            });

            it('Get Booking Just Created', async function() {
                const response = await got.get(`${BASE_URL}/booking/${bookingId}`).json();
                expect(response.firstname).to.equal(env.first_name);
            });

            it('Update Booking', async function() {
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

                const response = await got.put(`${BASE_URL}/booking/${bookingId}`, {
                    json: updateData,
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${env.admin_username}:${env.admin_password}`).toString('base64')}`
                    }
                }).json();

                expect(response.firstname).to.equal(env.first_name2);
                expect(response.lastname).to.equal(env.last_name2);
                expect(response.totalprice).to.equal(Number(env.total_price2));
            });

            it('Get Updated Booking', async function() {
                const response = await got.get(`${BASE_URL}/booking/${bookingId}`).json();
                expect(response.firstname).to.equal(env.first_name2);
            });

            it('Delete Booking', async function() {
                const response = await got.delete(`${BASE_URL}/booking/${bookingId}`, {
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${env.admin_username}:${env.admin_password}`).toString('base64')}`
                    }
                });
                
                expect(response.statusCode).to.equal(201);
                expect(response.body).to.include('Created');
            });
        });

        describe('Look for Booking Flow', function() {
            let bookingIdFlow2;
            
            before(async function() {
                // Create booking for the search tests
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

                const response = await got.post(`${BASE_URL}/booking`, {
                    json: bookingData
                }).json();

                bookingIdFlow2 = response.bookingid;
            });

            it('Looking for Booking by First Name', async function() {
                const response = await got.get(`${BASE_URL}/booking`, {
                    searchParams: { firstname: env.first_name }
                }).json();
                
                const found = response.some(booking => booking.bookingid === bookingIdFlow2);
                expect(found).to.be.true;
            });

            it('Looking for Booking by Last Name', async function() {
                const response = await got.get(`${BASE_URL}/booking`, {
                    searchParams: { lastname: env.last_name }
                }).json();
                
                const found = response.some(booking => booking.bookingid === bookingIdFlow2);
                expect(found).to.be.true;
            });

            it('Update Only Name', async function() {
                const response = await got.patch(`${BASE_URL}/booking/${bookingIdFlow2}`, {
                    json: { firstname: env.first_name2 },
                    headers: {
                        'Authorization': `Basic ${Buffer.from(`${env.admin_username}:${env.admin_password}`).toString('base64')}`
                    }
                }).json();
                
                expect(response.firstname).to.equal(env.first_name2);
            });

            it('Looking for Booking by Updated First Name', async function() {
                const response = await got.get(`${BASE_URL}/booking`, {
                    searchParams: { firstname: env.first_name2 }
                }).json();
                
                const found = response.some(booking => booking.bookingid === bookingIdFlow2);
                expect(found).to.be.true;
            });
        });
    });

    describe('NEGATIVE TESTING', function() {
        it('Admin Login - Incorrect Password', async function() {
            const response = await got.post(`${BASE_URL}/auth`, {
                json: {
                    username: env.admin_username,
                    password: env.admin_password + env.admin_password
                },
                throwHttpErrors: false
            });
            
            const body = JSON.parse(response.body);
            expect(response.statusCode).to.equal(200);
            expect(body).to.not.have.property('token');
            expect(body).to.have.property('reason', 'Bad credentials');
        });

        it('Create Booking - Missing First Name', async function() {
            try {
                await got.post(`${BASE_URL}/booking`, {
                    json: {
                        lastname: env.last_name,
                        totalprice: Number(env.total_price),
                        depositpaid: env.deposit_paid === 'true',
                        bookingdates: {
                            checkin: '',
                            checkout: ''
                        },
                        additionalneeds: ''
                    }
                });
                throw new Error('Should have failed without first name');
            } catch (error) {
                if (error.response) {
                    expect(error.response.statusCode).to.equal(500);
                } else {
                    throw error;
                }
            }
        });

        it('Get Booking - Invalid ID', async function() {
            try {
                await got.get(`${BASE_URL}/booking/999999999`);
                throw new Error('Should have failed with invalid ID');
            } catch (error) {
                if (error.response) {
                    expect(error.response.statusCode).to.equal(404);
                    expect(error.response.body).to.include('Not Found');
                } else {
                    throw error;
                }
            }
        });

        it('Delete Booking without credentials', async function() {
            try {
                await got.delete(`${BASE_URL}/booking/1`);
                throw new Error('Should have failed without credentials');
            } catch (error) {
                if (error.response) {
                    expect(error.response.statusCode).to.equal(403);
                    expect(error.response.body).to.include('Forbidden');
                } else {
                    throw error;
                }
            }
        });
    });
});
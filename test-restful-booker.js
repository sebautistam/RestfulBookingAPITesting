// test-restful-booker.js
import got from 'got';

const BASE_URL = 'https://restful-booker.herokuapp.com';

// Environment variables
const env = {
    admin_username: 'admin',
    admin_password: 'password123',
    first_name: 'Sergio',
    last_name: 'Bautista',
    total_price: '200',
    deposit_paid: 'true',
    checkin_date: '2026-02-19',
    checkout_date: '2026-02-22',
    additional_needs: 'Non-smoker',
    first_name2: 'Marlen',
    last_name2: 'Moreno',
    total_price2: '300',
    deposit_paid2: 'false',
    checkin_date2: '2026-03-15',
    checkout_date2: '2026-03-20',
    additional_needs2: 'breakfast'
};

// Test utilities
async function test(name, testFn) {
    try {
        await testFn();
        console.log(`✓ ${name}`);
        return true;
    } catch (error) {
        console.error(`✗ ${name}: ${error.message}`);
        return false;
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

// PING TEST
async function runPingTest() {
    console.log('\n=== PING TEST ===\n');
    
    await test('Ping API', async () => {
        const response = await got.get(`${BASE_URL}/ping`);
        assert(response.statusCode === 201, 'Ping should return status 201');
        assert(response.body.includes('Created'), 'Ping should return Created message');
    });
}

// POSITIVE TESTING
async function runPositiveTests() {
    console.log('\n=== POSITIVE TESTING ===\n');

    // Full Booking Flow
    console.log('--- Full Booking Flow ---');
    
    // Local variables for this flow
    let bookingId;
    
    await test('Admin Login', async () => {
        const response = await got.post(`${BASE_URL}/auth`, {
            json: {
                username: env.admin_username,
                password: env.admin_password
            }
        }).json();
        
        assert(response.token, 'Response should contain token');
    });

    await test('Create Booking', async () => {
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

        assert(response.bookingid, 'Response should contain bookingid');
        bookingId = response.bookingid;
        
        assert(response.booking.firstname === env.first_name, 'First name mismatch');
        assert(response.booking.lastname === env.last_name, 'Last name mismatch');
        assert(response.booking.totalprice === Number(env.total_price), 'Price mismatch');
        assert(response.booking.depositpaid === (env.deposit_paid === 'true'), 'Deposit mismatch');
        assert(response.booking.bookingdates.checkin === env.checkin_date, 'Checkin date mismatch');
        assert(response.booking.bookingdates.checkout === env.checkout_date, 'Checkout date mismatch');
        assert(response.booking.additionalneeds === env.additional_needs, 'Additional needs mismatch');
    });

    await test('Get Booking Just Created', async () => {
        const response = await got.get(`${BASE_URL}/booking/${bookingId}`).json();
        assert(response.firstname === env.first_name, 'Retrieved booking first name mismatch');
    });

    await test('Update Booking', async () => {
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
            username: env.admin_username,
            password: env.admin_password
        }).json();

        assert(response.firstname === env.first_name2, 'Updated first name mismatch');
        assert(response.lastname === env.last_name2, 'Updated last name mismatch');
        assert(response.totalprice === Number(env.total_price2), 'Updated price mismatch');
    });

    await test('Get Updated Booking', async () => {
        const response = await got.get(`${BASE_URL}/booking/${bookingId}`).json();
        assert(response.firstname === env.first_name2, 'Retrieved updated booking first name mismatch');
    });

    await test('Delete Booking', async () => {
        const response = await got.delete(`${BASE_URL}/booking/${bookingId}`, {
            username: env.admin_username,
            password: env.admin_password
        });
        assert(response.statusCode === 201, 'Delete should return status 201');
        assert(response.body.includes('Created'), 'Delete should return Created message');
    });

    // Look for Booking Flow
    console.log('\n--- Look for Booking Flow ---');
    
    // Local variables for this flow
    let bookingIdFlow2;
    
    await test('Create Booking Flow 2', async () => {
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

        assert(response.bookingid, 'Response should contain bookingid');
        bookingIdFlow2 = response.bookingid;
    });

    await test('Looking for Booking by First Name', async () => {
        const response = await got.get(`${BASE_URL}/booking`, {
            searchParams: { firstname: env.first_name }
        }).json();
        
        const found = response.some(booking => booking.bookingid === bookingIdFlow2);
        assert(found, 'Should find booking by first name');
    });

    await test('Looking for Booking by Last Name', async () => {
        const response = await got.get(`${BASE_URL}/booking`, {
            searchParams: { lastname: env.last_name }
        }).json();
        
        const found = response.some(booking => booking.bookingid === bookingIdFlow2);
        assert(found, 'Should find booking by last name');
    });

    await test('Update Only Name', async () => {
        const response = await got.patch(`${BASE_URL}/booking/${bookingIdFlow2}`, {
            json: { firstname: env.first_name2 },
            username: env.admin_username,
            password: env.admin_password
        }).json();
        
        assert(response.firstname === env.first_name2, 'First name should be updated');
    });

    await test('Looking for Booking by Updated First Name', async () => {
        const response = await got.get(`${BASE_URL}/booking`, {
            searchParams: { firstname: env.first_name2 }
        }).json();
        
        const found = response.some(booking => booking.bookingid === bookingIdFlow2);
        assert(found, 'Should find booking by updated first name');
    });
}

// NEGATIVE TESTING
async function runNegativeTests() {
    console.log('\n=== NEGATIVE TESTING ===\n');
    
    await test('Admin Login - Incorrect Password', async () => {
        const response = await got.post(`${BASE_URL}/auth`, {
            json: {
                username: env.admin_username,
                password: env.admin_password + env.admin_password
            },
            throwHttpErrors: false
        });
        
        const body = JSON.parse(response.body);
        
        assert(response.statusCode === 200, 'Should return status 200');
        assert(!body.token, 'Should not contain token with wrong password');
        assert(body.reason === 'Bad credentials', 'Should return Bad credentials error');
    });

    await test('Create Booking - Missing First Name', async () => {
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
                assert(error.response.statusCode === 500, 'Should return 500 status');
            } else {
                throw error;
            }
        }
    });

    await test('Get Booking - Invalid ID', async () => {
        try {
            await got.get(`${BASE_URL}/booking/999999999`);
            throw new Error('Should have failed with invalid ID');
        } catch (error) {
            if (error.response) {
                assert(error.response.statusCode === 404, 'Should return 404 status');
                assert(error.response.body.includes('Not Found'), 'Should contain Not Found message');
            } else {
                throw error;
            }
        }
    });

    await test('Delete Booking without credentials', async () => {
        try {
            await got.delete(`${BASE_URL}/booking/1`);
            throw new Error('Should have failed without credentials');
        } catch (error) {
            if (error.response) {
                assert(error.response.statusCode === 403, 'Should return 403 status');
                assert(error.response.body.includes('Forbidden'), 'Should contain Forbidden message');
            } else {
                throw error;
            }
        }
    });
}

// Main execution
async function runAllTests() {
    console.log('Starting Restful Booker API Tests...\n');
    
    await runPingTest();
    await runPositiveTests();
    await runNegativeTests();
    
    console.log('\n=== ALL TESTS COMPLETED ===');
}

// Run tests if this is the main module
if (import.meta.url === new URL(import.meta.url).href) {
    runAllTests().catch(console.error);
}

export { runAllTests };
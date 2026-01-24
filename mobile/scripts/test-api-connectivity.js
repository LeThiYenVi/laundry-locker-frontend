/**
 * Simple API Connectivity Test
 * Tests if the backend server is reachable and tests basic endpoints
 */

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

console.log('🔍 Testing API Connectivity...');
console.log(`Base URL: ${baseURL}\n`);

// Test endpoints
const endpoints = [
    { name: 'Stores', url: '/stores', method: 'GET', requiresAuth: false },
    { name: 'Lockers', url: '/lockers', method: 'GET', requiresAuth: false },
    { name: 'Services', url: '/services', method: 'GET', requiresAuth: false },
];

async function testEndpoint(endpoint) {
    const url = `${baseURL}${endpoint.url}`;
    const startTime = Date.now();
    
    try {
        const response = await fetch(url, {
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        const duration = Date.now() - startTime;
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ ${endpoint.name}: OK (${response.status}) - ${duration}ms`);
            if (Array.isArray(data.data)) {
                console.log(`   → Found ${data.data.length} items`);
            }
            return true;
        } else {
            console.log(`❌ ${endpoint.name}: FAILED (${response.status}) - ${data.message || 'Unknown error'}`);
            return false;
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        console.log(`❌ ${endpoint.name}: ERROR - ${error.message} (${duration}ms)`);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('   → Backend server is not running or not accessible');
        }
        return false;
    }
}

async function runTests() {
    console.log('Testing Public Endpoints:\n');
    
    let passCount = 0;
    let failCount = 0;
    
    for (const endpoint of endpoints) {
        const success = await testEndpoint(endpoint);
        if (success) passCount++;
        else failCount++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`Summary: ${passCount} passed, ${failCount} failed`);
    console.log('='.repeat(60));
    
    if (failCount > 0) {
        console.log('\n⚠️  Some tests failed. Please check:');
        console.log('   1. Backend server is running');
        console.log('   2. Backend is accessible at:', baseURL);
        console.log('   3. CORS is properly configured');
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed! Backend is reachable.');
        process.exit(0);
    }
}

runTests().catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
});

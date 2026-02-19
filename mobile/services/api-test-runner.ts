#!/usr/bin/env ts-node
/**
 * API Test Runner for Laundry Locker Mobile App
 * Tests all API endpoints systematically
 */

import { authService } from './user/authService';
import { lockerService } from './user/lockerService';
import { notificationService } from './user/notificationService';
import { orderService } from './user/orderService';
import { paymentService } from './user/paymentService';
import { serviceService } from './user/serviceService';
import { storeService } from './user/storeService';
import { userService } from './user/userService';

// ANSI Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

interface TestResult {
    name: string;
    category: string;
    status: 'PASS' | 'FAIL' | 'SKIP' | 'ERROR';
    message?: string;
    error?: string;
    duration?: number;
}

class APITestRunner {
    private results: TestResult[] = [];
    private testAccessToken: string | null = null;
    private testRefreshToken: string | null = null;
    private testData: {
        stores?: any[];
        lockers?: any[];
        services?: any[];
        orders?: any[];
        userId?: number;
    } = {};

    private log(message: string, color: string = colors.reset) {
        console.log(`${color}${message}${colors.reset}`);
    }

    private logSection(title: string) {
        console.log('\n' + '='.repeat(60));
        this.log(title, colors.cyan + colors.bright);
        console.log('='.repeat(60));
    }

    private async runTest(
        category: string,
        name: string,
        testFn: () => Promise<void>,
        requiresAuth: boolean = false
    ): Promise<void> {
        if (requiresAuth && !this.testAccessToken) {
            this.results.push({
                name,
                category,
                status: 'SKIP',
                message: 'Skipped - requires authentication',
            });
            this.log(`  ⊘ ${name} - SKIPPED (no auth)`, colors.yellow);
            return;
        }

        const startTime = Date.now();
        try {
            await testFn();
            const duration = Date.now() - startTime;
            this.results.push({ name, category, status: 'PASS', duration });
            this.log(`  ✓ ${name} (${duration}ms)`, colors.green);
        } catch (error: any) {
            const duration = Date.now() - startTime;
            const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
            this.results.push({
                name,
                category,
                status: 'FAIL',
                error: errorMessage,
                duration,
            });
            this.log(`  ✗ ${name} - ${errorMessage} (${duration}ms)`, colors.red);
        }
    }

    // ============================================
    // Authentication Tests
    // ============================================
    private async testAuthenticationService() {
        this.logSection('🔐 Authentication Service Tests');

        // Note: Phone login and email OTP require actual Firebase/Email setup
        // These tests are placeholders and will be skipped unless configured

        this.log('  ℹ Phone login tests require Firebase configuration', colors.yellow);
        this.log('  ℹ Email OTP tests require email service configuration', colors.yellow);

        // Token refresh test (if we have tokens)
        if (this.testRefreshToken) {
            await this.runTest('auth', 'Refresh Token', async () => {
                const response = await authService.refreshToken(this.testRefreshToken!);
                if (!response.success || !response.data.accessToken) {
                    throw new Error('Invalid refresh token response');
                }
                this.testAccessToken = response.data.accessToken;
                this.testRefreshToken = response.data.refreshToken;
            });
        }
    }

    // ============================================
    // Store Service Tests
    // ============================================
    private async testStoreService() {
        this.logSection('🏪 Store Service Tests');

        await this.runTest('store', 'Get All Stores', async () => {
            const response = await storeService.getAllStores();
            if (!response.success || !Array.isArray(response.data)) {
                throw new Error('Invalid response structure');
            }
            this.testData.stores = response.data;
            this.log(`    → Found ${response.data.length} stores`, colors.blue);
        });

        // Get store by ID (if we have stores)
        if (this.testData.stores && this.testData.stores.length > 0) {
            const storeId = this.testData.stores[0].id;
            await this.runTest('store', `Get Store By ID (${storeId})`, async () => {
                const response = await storeService.getStoreById(storeId);
                if (!response.success || !response.data.id) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Store: ${response.data.name}`, colors.blue);
            });
        }
    }

    // ============================================
    // Locker Service Tests
    // ============================================
    private async testLockerService() {
        this.logSection('🔐 Locker Service Tests');

        await this.runTest('locker', 'Get All Lockers', async () => {
            const response = await lockerService.getAllLockers();
            if (!response.success || !Array.isArray(response.data)) {
                throw new Error('Invalid response structure');
            }
            this.testData.lockers = response.data;
            this.log(`    → Found ${response.data.length} lockers`, colors.blue);
        });

        // Get lockers by store
        if (this.testData.stores && this.testData.stores.length > 0) {
            const storeId = this.testData.stores[0].id;
            await this.runTest('locker', `Get Lockers By Store (${storeId})`, async () => {
                const response = await lockerService.getLockersByStore(storeId);
                if (!response.success || !Array.isArray(response.data)) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Found ${response.data.length} lockers`, colors.blue);
            });
        }

        // Get locker by ID and its boxes
        if (this.testData.lockers && this.testData.lockers.length > 0) {
            const lockerId = this.testData.lockers[0].id;

            await this.runTest('locker', `Get Locker By ID (${lockerId})`, async () => {
                const response = await lockerService.getLockerById(lockerId);
                if (!response.success || !response.data.id) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Locker: ${response.data.name}`, colors.blue);
            });

            await this.runTest('locker', `Get Boxes By Locker (${lockerId})`, async () => {
                const response = await lockerService.getBoxesByLocker(lockerId);
                if (!response.success || !Array.isArray(response.data)) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Found ${response.data.length} boxes`, colors.blue);
            });

            await this.runTest('locker', `Get Available Boxes (${lockerId})`, async () => {
                const response = await lockerService.getAvailableBoxes(lockerId);
                if (!response.success || !Array.isArray(response.data)) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Found ${response.data.length} available boxes`, colors.blue);
            });
        }
    }

    // ============================================
    // Service Service Tests
    // ============================================
    private async testServiceService() {
        this.logSection('🧺 Laundry Service Tests');

        await this.runTest('service', 'Get All Services', async () => {
            const response = await serviceService.getAllServices();
            if (!response.success || !Array.isArray(response.data)) {
                throw new Error('Invalid response structure');
            }
            this.testData.services = response.data;
            this.log(`    → Found ${response.data.length} services`, colors.blue);
        });

        // Get services by store
        if (this.testData.stores && this.testData.stores.length > 0) {
            const storeId = this.testData.stores[0].id;
            await this.runTest('service', `Get Services By Store (${storeId})`, async () => {
                const response = await serviceService.getServicesByStore(storeId);
                if (!response.success || !Array.isArray(response.data)) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Found ${response.data.length} services`, colors.blue);
            });
        }

        // Get service by ID
        if (this.testData.services && this.testData.services.length > 0) {
            const serviceId = this.testData.services[0].id;
            await this.runTest('service', `Get Service By ID (${serviceId})`, async () => {
                const response = await serviceService.getServiceById(serviceId);
                if (!response.success || !response.data.id) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Service: ${response.data.name} - ${response.data.price}đ`, colors.blue);
            });
        }
    }

    // ============================================
    // Order Service Tests (requires auth)
    // ============================================
    private async testOrderService() {
        this.logSection('📦 Order Service Tests');

        await this.runTest('order', 'Get Orders (Paginated)', async () => {
            const response = await orderService.getOrders(0, 10);
            if (!response.success || !response.data.content) {
                throw new Error('Invalid response structure');
            }
            this.testData.orders = response.data.content;
            this.log(
                `    → Found ${response.data.totalElements} orders (page 1/${response.data.totalPages})`,
                colors.blue
            );
        }, true);

        // Test get order by ID if we have orders
        if (this.testData.orders && this.testData.orders.length > 0) {
            const orderId = this.testData.orders[0].id;

            await this.runTest('order', `Get Order By ID (${orderId})`, async () => {
                const response = await orderService.getOrderById(orderId);
                if (!response.success || !response.data.id) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Order Status: ${response.data.status}`, colors.blue);
            }, true);

            // Test get order by PIN (if order has a PIN)
            if (this.testData.orders[0].pin) {
                const pin = this.testData.orders[0].pin;
                await this.runTest('order', `Get Order By PIN (${pin})`, async () => {
                    const response = await orderService.getOrderByPin(pin);
                    if (!response.success || !response.data.id) {
                        throw new Error('Invalid response structure');
                    }
                }, true);
            }
        }

        this.log('  ℹ Create/Confirm/Checkout/Cancel order tests skipped - requires manual setup', colors.yellow);
    }

    // ============================================
    // Payment Service Tests (requires auth)
    // ============================================
    private async testPaymentService() {
        this.logSection('💳 Payment Service Tests');

        // Test get payments by order if we have orders
        if (this.testData.orders && this.testData.orders.length > 0) {
            const orderId = this.testData.orders[0].id;

            await this.runTest('payment', `Get Payments By Order (${orderId})`, async () => {
                const response = await paymentService.getPaymentsByOrder(orderId);
                if (!response.success || !Array.isArray(response.data)) {
                    throw new Error('Invalid response structure');
                }
                this.log(`    → Found ${response.data.length} payments`, colors.blue);
            }, true);
        }

        this.log('  ℹ Create payment tests skipped - requires manual order setup', colors.yellow);
    }

    // ============================================
    // Notification Service Tests (requires auth)
    // ============================================
    private async testNotificationService() {
        this.logSection('🔔 Notification Service Tests');

        await this.runTest('notification', 'Get Notifications (Paginated)', async () => {
            const response = await notificationService.getNotifications(0, 20);
            if (!response.success || !response.data.content) {
                throw new Error('Invalid response structure');
            }
            this.log(
                `    → Found ${response.data.totalElements} notifications (page 1/${response.data.totalPages})`,
                colors.blue
            );
        }, true);

        await this.runTest('notification', 'Get All Notifications', async () => {
            const response = await notificationService.getAllNotifications();
            if (!response.success || !Array.isArray(response.data)) {
                throw new Error('Invalid response structure');
            }
            this.log(`    → Found ${response.data.length} total notifications`, colors.blue);
        }, true);

        await this.runTest('notification', 'Get Unread Notifications', async () => {
            const response = await notificationService.getUnreadNotifications();
            if (!response.success || !Array.isArray(response.data)) {
                throw new Error('Invalid response structure');
            }
            this.log(`    → Found ${response.data.length} unread notifications`, colors.blue);
        }, true);

        await this.runTest('notification', 'Get Unread Count', async () => {
            const response = await notificationService.getUnreadCount();
            if (!response.success || typeof response.data.count !== 'number') {
                throw new Error('Invalid response structure');
            }
            this.log(`    → Unread count: ${response.data.count}`, colors.blue);
        }, true);

        this.log('  ℹ Mark as read/delete tests skipped - requires notification data', colors.yellow);
    }

    // ============================================
    // User Service Tests (requires auth)
    // ============================================
    private async testUserService() {
        this.logSection('👤 User Service Tests');

        await this.runTest('user', 'Get User Profile', async () => {
            const response = await userService.getProfile();
            if (!response.success || !response.data.id) {
                throw new Error('Invalid response structure');
            }
            this.testData.userId = response.data.id;
            this.log(
                `    → User: ${response.data.fullName} (${response.data.role})`,
                colors.blue
            );
        }, true);
    }

    // ============================================
    // Partner Service Tests (requires auth as partner)
    // ============================================
    private async testPartnerOrderService() {
        this.logSection('🤝 Partner Order Service Tests');

        this.log('  ℹ Partner tests require partner role authentication', colors.yellow);
        this.log('  ℹ Collect/Process/Ready/Return tests skipped - requires manual setup', colors.yellow);
    }

    // ============================================
    // Summary Report
    // ============================================
    private printSummary() {
        this.logSection('📊 Test Summary');

        const passed = this.results.filter((r) => r.status === 'PASS').length;
        const failed = this.results.filter((r) => r.status === 'FAIL').length;
        const skipped = this.results.filter((r) => r.status === 'SKIP').length;
        const total = this.results.length;

        console.log(`\nTotal Tests: ${total}`);
        this.log(`Passed: ${passed}`, colors.green);
        this.log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.reset);
        this.log(`Skipped: ${skipped}`, colors.yellow);

        const successRate = total > 0 ? ((passed / (total - skipped)) * 100).toFixed(1) : '0.0';
        console.log(`\nSuccess Rate: ${successRate}%`);

        // Show failed tests details
        const failedTests = this.results.filter((r) => r.status === 'FAIL');
        if (failedTests.length > 0) {
            this.logSection('❌ Failed Tests Details');
            failedTests.forEach((test) => {
                this.log(`\n${test.category} > ${test.name}`, colors.red + colors.bright);
                this.log(`  Error: ${test.error}`, colors.red);
            });
        }

        // Category breakdown
        this.logSection('📈 Category Breakdown');
        const categories = [...new Set(this.results.map((r) => r.category))];
        categories.forEach((category) => {
            const categoryTests = this.results.filter((r) => r.category === category);
            const categoryPassed = categoryTests.filter((r) => r.status === 'PASS').length;
            const categoryTotal = categoryTests.filter((r) => r.status !== 'SKIP').length;
            const rate = categoryTotal > 0 ? ((categoryPassed / categoryTotal) * 100).toFixed(0) : '0';
            console.log(`${category}: ${categoryPassed}/${categoryTotal} (${rate}%)`);
        });
    }

    // ============================================
    // Main Runner
    // ============================================
    async run() {
        this.log('\n🚀 Starting API Test Runner', colors.cyan + colors.bright);
        this.log('API Base URL: ' + (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api'), colors.blue);

        try {
            // Run tests in order
            await this.testAuthenticationService();
            await this.testStoreService();
            await this.testLockerService();
            await this.testServiceService();
            await this.testOrderService();
            await this.testPaymentService();
            await this.testNotificationService();
            await this.testUserService();
            await this.testPartnerOrderService();

            // Print summary
            this.printSummary();

            this.log('\n✅ Test run completed!', colors.green + colors.bright);
        } catch (error: any) {
            this.log('\n❌ Test run failed!', colors.red + colors.bright);
            console.error(error);
            process.exit(1);
        }
    }
}

// Run the tests
const runner = new APITestRunner();
runner.run().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});

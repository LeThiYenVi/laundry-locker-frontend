/**
 * Locker Controller Header
 * 
 * Quản lý điều khiển khóa solenoid và giao tiếp với backend
 */

#ifndef LOCKER_CONTROLLER_H
#define LOCKER_CONTROLLER_H

#include <Arduino.h>

// ============================================
// Box Status Enum
// ============================================
enum BoxStatus {
    STATUS_AVAILABLE,
    STATUS_OCCUPIED,
    STATUS_LOCKED,
    STATUS_ERROR
};

// ============================================
// Function Declarations
// ============================================

/**
 * Khởi tạo GPIO pins cho relay
 */
void initLockerController();

/**
 * Mở khóa box - Kích hoạt relay để mở solenoid
 * Tự động khóa lại sau UNLOCK_DURATION
 */
void unlockBox();

/**
 * Khóa box - Tắt relay để đóng solenoid
 */
void lockBox();

/**
 * Kiểm tra trạng thái khóa
 * @return true nếu đang mở, false nếu đã khóa
 */
bool isUnlocked();

/**
 * Gửi trạng thái box về backend
 * @param status Trạng thái hiện tại của box
 * @param isDoorOpen Trạng thái cửa (mở/đóng)
 * @return true nếu gửi thành công
 */
bool reportBoxStatus(BoxStatus status, bool isDoorOpen);

/**
 * Chuyển BoxStatus thành string
 */
const char* getStatusString(BoxStatus status);

#endif // LOCKER_CONTROLLER_H

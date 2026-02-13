/**
 * LSM6DSR TypeScript Library for Raspberry Pi
 *
 * A TypeScript implementation for the LSM6DSR 6-axis IMU sensor.
 *
 * @example
 * ```typescript
 * import { LSM6DSR, AccelODR, GyroODR } from 'lsm6dsr-ts';
 *
 * const sensor = new LSM6DSR();
 * sensor.begin();
 *
 * sensor.enableAccel();
 * sensor.enableGyro();
 *
 * const data = sensor.readIMU();
 * console.log('Accel:', data.accel);
 * console.log('Gyro:', data.gyro);
 *
 * sensor.close();
 * ```
 */

// Main sensor class
export { LSM6DSR } from './lsm6dsr';

// I2C utilities
export { I2CWrapper, MockI2CWrapper } from './i2c-wrapper';

// Register definitions
export {
  Registers,
  LSM6DSR_I2C_ADD_L,
  LSM6DSR_I2C_ADD_H,
  LSM6DSR_ID,
  AccelODR,
  AccelFullScale,
  GyroODR,
  GyroFullScale,
  FIFOMode,
  AccelOperatingMode,
  GyroOperatingMode,
  AccelSensitivity,
  GyroSensitivity,
  AccelODRHz,
  GyroODRHz,
  AccelFSValue,
  GyroFSValue,
} from './registers';

// Type definitions
export {
  Vector3D,
  RawVector3D,
  LSM6DSRConfig,
  SensorStatus,
  IMUData,
  I2CInterface,
  DataReadyCallback,
  ErrorCallback,
} from './types';

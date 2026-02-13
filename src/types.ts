/**
 * LSM6DSR Type Definitions
 */

import {
  AccelODR,
  AccelFullScale,
  GyroODR,
  GyroFullScale,
  AccelOperatingMode,
  GyroOperatingMode,
} from './registers';

// 3D Vector data
export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// Raw sensor data (16-bit signed integers)
export interface RawVector3D {
  x: number;
  y: number;
  z: number;
}

// Sensor configuration
export interface LSM6DSRConfig {
  i2cAddress?: number;
  i2cBusNumber?: number;
  accelODR?: AccelODR;
  accelFullScale?: AccelFullScale;
  gyroODR?: GyroODR;
  gyroFullScale?: GyroFullScale;
  accelOperatingMode?: AccelOperatingMode;
  gyroOperatingMode?: GyroOperatingMode;
  enableBlockDataUpdate?: boolean;
  enableAutoIncrement?: boolean;
}

// Status register data
export interface SensorStatus {
  accelDataReady: boolean;
  gyroDataReady: boolean;
  tempDataReady: boolean;
}

// Combined sensor reading
export interface IMUData {
  accel: Vector3D; // in mg (milligravities)
  gyro: Vector3D; // in mdps (millidegrees per second)
  temperature?: number; // in degrees Celsius
}

// I2C interface abstraction
export interface I2CInterface {
  readByte(register: number): number;
  readWord(register: number): number;
  readBlock(register: number, length: number): Buffer;
  writeByte(register: number, value: number): void;
  writeWord(register: number, value: number): void;
  writeBlock(register: number, buffer: Buffer): void;
  close(): void;
}

// Callback types for async operations
export type DataReadyCallback = (data: IMUData) => void;
export type ErrorCallback = (error: Error) => void;

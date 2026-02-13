/**
 * I2C Wrapper for LSM6DSR
 * Provides a simple synchronous interface for I2C communication
 */

import i2cBus, { I2CBus } from 'i2c-bus';
import { I2CInterface } from './types';

export class I2CWrapper implements I2CInterface {
  private bus: I2CBus;
  private address: number;

  constructor(busNumber: number, address: number) {
    this.bus = i2cBus.openSync(busNumber);
    this.address = address;
  }

  readByte(register: number): number {
    return this.bus.readByteSync(this.address, register);
  }

  readWord(register: number): number {
    return this.bus.readWordSync(this.address, register);
  }

  readBlock(register: number, length: number): Buffer {
    const buffer = Buffer.alloc(length);
    this.bus.readI2cBlockSync(this.address, register, length, buffer);
    return buffer;
  }

  writeByte(register: number, value: number): void {
    this.bus.writeByteSync(this.address, register, value);
  }

  writeWord(register: number, value: number): void {
    this.bus.writeWordSync(this.address, register, value);
  }

  writeBlock(register: number, buffer: Buffer): void {
    this.bus.writeI2cBlockSync(this.address, register, buffer.length, buffer);
  }

  close(): void {
    this.bus.closeSync();
  }
}

/**
 * Mock I2C interface for testing without hardware
 */
export class MockI2CWrapper implements I2CInterface {
  private registers: Map<number, number> = new Map();
  private address: number;

  constructor(address: number) {
    this.address = address;
    // Set default WHO_AM_I value
    this.registers.set(0x0f, 0x6b);
  }

  readByte(register: number): number {
    return this.registers.get(register) ?? 0;
  }

  readWord(register: number): number {
    const low = this.registers.get(register) ?? 0;
    const high = this.registers.get(register + 1) ?? 0;
    return (high << 8) | low;
  }

  readBlock(register: number, length: number): Buffer {
    const buffer = Buffer.alloc(length);
    for (let i = 0; i < length; i++) {
      buffer[i] = this.registers.get(register + i) ?? 0;
    }
    return buffer;
  }

  writeByte(register: number, value: number): void {
    this.registers.set(register, value & 0xff);
  }

  writeWord(register: number, value: number): void {
    this.registers.set(register, value & 0xff);
    this.registers.set(register + 1, (value >> 8) & 0xff);
  }

  writeBlock(register: number, buffer: Buffer): void {
    for (let i = 0; i < buffer.length; i++) {
      this.registers.set(register + i, buffer[i]);
    }
  }

  close(): void {
    // No-op for mock
  }

  // Test helper: set raw sensor data
  setRawAccelData(x: number, y: number, z: number): void {
    this.registers.set(0x28, x & 0xff);
    this.registers.set(0x29, (x >> 8) & 0xff);
    this.registers.set(0x2a, y & 0xff);
    this.registers.set(0x2b, (y >> 8) & 0xff);
    this.registers.set(0x2c, z & 0xff);
    this.registers.set(0x2d, (z >> 8) & 0xff);
  }

  setRawGyroData(x: number, y: number, z: number): void {
    this.registers.set(0x22, x & 0xff);
    this.registers.set(0x23, (x >> 8) & 0xff);
    this.registers.set(0x24, y & 0xff);
    this.registers.set(0x25, (y >> 8) & 0xff);
    this.registers.set(0x26, z & 0xff);
    this.registers.set(0x27, (z >> 8) & 0xff);
  }

  setDataReady(accel: boolean, gyro: boolean, temp: boolean): void {
    let status = 0;
    if (accel) status |= 0x01;
    if (gyro) status |= 0x02;
    if (temp) status |= 0x04;
    this.registers.set(0x1e, status);
  }
}

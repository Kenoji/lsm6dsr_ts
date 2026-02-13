/**
 * LSM6DSR Sensor Class
 * TypeScript implementation for Raspberry Pi
 */

import {
  Registers,
  LSM6DSR_I2C_ADD_H,
  LSM6DSR_ID,
  AccelODR,
  AccelFullScale,
  GyroODR,
  GyroFullScale,
  AccelSensitivity,
  GyroSensitivity,
  AccelODRHz,
  GyroODRHz,
  AccelFSValue,
  GyroFSValue,
  FIFOMode,
  AccelOperatingMode,
  GyroOperatingMode,
} from './registers';

import {
  Vector3D,
  RawVector3D,
  LSM6DSRConfig,
  SensorStatus,
  IMUData,
  I2CInterface,
} from './types';

import { I2CWrapper } from './i2c-wrapper';

export class LSM6DSR {
  private i2c: I2CInterface;
  private address: number;

  // Current settings
  private accelODR: AccelODR = AccelODR.Hz_104;
  private accelFS: AccelFullScale = AccelFullScale.G_2;
  private gyroODR: GyroODR = GyroODR.Hz_104;
  private gyroFS: GyroFullScale = GyroFullScale.DPS_2000;

  // Enabled state
  private accelEnabled: boolean = false;
  private gyroEnabled: boolean = false;

  /**
   * Create a new LSM6DSR sensor instance
   * @param config - Configuration options
   */
  constructor(config: LSM6DSRConfig = {}) {
    this.address = config.i2cAddress ?? LSM6DSR_I2C_ADD_H;
    const busNumber = config.i2cBusNumber ?? 1;

    this.i2c = new I2CWrapper(busNumber, this.address);

    // Store initial settings
    if (config.accelODR !== undefined) this.accelODR = config.accelODR;
    if (config.accelFullScale !== undefined) this.accelFS = config.accelFullScale;
    if (config.gyroODR !== undefined) this.gyroODR = config.gyroODR;
    if (config.gyroFullScale !== undefined) this.gyroFS = config.gyroFullScale;
  }

  /**
   * Create instance with custom I2C interface (for testing or alternative I2C implementations)
   */
  static withI2C(i2c: I2CInterface, config: Omit<LSM6DSRConfig, 'i2cBusNumber'> = {}): LSM6DSR {
    const sensor = Object.create(LSM6DSR.prototype) as LSM6DSR;
    sensor.i2c = i2c;
    sensor.address = config.i2cAddress ?? LSM6DSR_I2C_ADD_H;
    sensor.accelODR = config.accelODR ?? AccelODR.Hz_104;
    sensor.accelFS = config.accelFullScale ?? AccelFullScale.G_2;
    sensor.gyroODR = config.gyroODR ?? GyroODR.Hz_104;
    sensor.gyroFS = config.gyroFullScale ?? GyroFullScale.DPS_2000;
    sensor.accelEnabled = false;
    sensor.gyroEnabled = false;
    return sensor;
  }

  /**
   * Initialize the sensor
   * @returns true if initialization successful
   */
  begin(): boolean {
    // Check device ID
    const whoAmI = this.readWhoAmI();
    if (whoAmI !== LSM6DSR_ID) {
      throw new Error(`LSM6DSR not found. WHO_AM_I returned 0x${whoAmI.toString(16)}, expected 0x${LSM6DSR_ID.toString(16)}`);
    }

    // Disable I3C protocol
    this.disableI3C();

    // Enable register address auto-increment
    this.setAutoIncrement(true);

    // Enable Block Data Update (BDU)
    this.setBlockDataUpdate(true);

    // Set FIFO to bypass mode
    this.setFIFOMode(FIFOMode.BYPASS);

    // Set accelerometer: powered down, but remember ODR for when enabled
    this.writeAccelConfig(AccelODR.OFF, this.accelFS);

    // Set gyroscope: powered down, but remember ODR for when enabled
    this.writeGyroConfig(GyroODR.OFF, this.gyroFS);

    this.accelEnabled = false;
    this.gyroEnabled = false;

    return true;
  }

  /**
   * Read the WHO_AM_I register
   */
  readWhoAmI(): number {
    return this.i2c.readByte(Registers.WHO_AM_I);
  }

  // ==================== Accelerometer Methods ====================

  /**
   * Enable the accelerometer
   */
  enableAccel(): void {
    this.writeAccelConfig(this.accelODR, this.accelFS);
    this.accelEnabled = true;
  }

  /**
   * Disable the accelerometer
   */
  disableAccel(): void {
    this.writeAccelConfig(AccelODR.OFF, this.accelFS);
    this.accelEnabled = false;
  }

  /**
   * Check if accelerometer is enabled
   */
  isAccelEnabled(): boolean {
    return this.accelEnabled;
  }

  /**
   * Set accelerometer output data rate
   * @param odr - Output data rate
   */
  setAccelODR(odr: AccelODR): void {
    this.accelODR = odr;
    if (this.accelEnabled) {
      this.writeAccelConfig(odr, this.accelFS);
    }
  }

  /**
   * Get accelerometer output data rate in Hz
   */
  getAccelODR(): number {
    return AccelODRHz[this.accelODR];
  }

  /**
   * Set accelerometer full scale
   * @param fs - Full scale setting
   */
  setAccelFullScale(fs: AccelFullScale): void {
    this.accelFS = fs;
    if (this.accelEnabled) {
      this.writeAccelConfig(this.accelODR, fs);
    }
  }

  /**
   * Get accelerometer full scale value in g
   */
  getAccelFullScale(): number {
    return AccelFSValue[this.accelFS];
  }

  /**
   * Get accelerometer sensitivity (mg/LSB)
   */
  getAccelSensitivity(): number {
    return AccelSensitivity[this.accelFS];
  }

  /**
   * Read raw accelerometer data
   */
  readRawAccel(): RawVector3D {
    const buffer = this.i2c.readBlock(Registers.OUTX_L_A, 6);
    return {
      x: buffer.readInt16LE(0),
      y: buffer.readInt16LE(2),
      z: buffer.readInt16LE(4),
    };
  }

  /**
   * Read accelerometer data in mg (milligravities)
   */
  readAccel(): Vector3D {
    const raw = this.readRawAccel();
    const sensitivity = this.getAccelSensitivity();
    return {
      x: raw.x * sensitivity,
      y: raw.y * sensitivity,
      z: raw.z * sensitivity,
    };
  }

  /**
   * Read accelerometer data in g (gravities)
   */
  readAccelG(): Vector3D {
    const mg = this.readAccel();
    return {
      x: mg.x / 1000,
      y: mg.y / 1000,
      z: mg.z / 1000,
    };
  }

  /**
   * Check if new accelerometer data is available
   */
  isAccelDataReady(): boolean {
    const status = this.i2c.readByte(Registers.STATUS_REG);
    return (status & 0x01) !== 0;
  }

  // ==================== Gyroscope Methods ====================

  /**
   * Enable the gyroscope
   */
  enableGyro(): void {
    this.writeGyroConfig(this.gyroODR, this.gyroFS);
    this.gyroEnabled = true;
  }

  /**
   * Disable the gyroscope
   */
  disableGyro(): void {
    this.writeGyroConfig(GyroODR.OFF, this.gyroFS);
    this.gyroEnabled = false;
  }

  /**
   * Check if gyroscope is enabled
   */
  isGyroEnabled(): boolean {
    return this.gyroEnabled;
  }

  /**
   * Set gyroscope output data rate
   * @param odr - Output data rate
   */
  setGyroODR(odr: GyroODR): void {
    this.gyroODR = odr;
    if (this.gyroEnabled) {
      this.writeGyroConfig(odr, this.gyroFS);
    }
  }

  /**
   * Get gyroscope output data rate in Hz
   */
  getGyroODR(): number {
    return GyroODRHz[this.gyroODR];
  }

  /**
   * Set gyroscope full scale
   * @param fs - Full scale setting
   */
  setGyroFullScale(fs: GyroFullScale): void {
    this.gyroFS = fs;
    if (this.gyroEnabled) {
      this.writeGyroConfig(this.gyroODR, fs);
    }
  }

  /**
   * Get gyroscope full scale value in dps
   */
  getGyroFullScale(): number {
    return GyroFSValue[this.gyroFS];
  }

  /**
   * Get gyroscope sensitivity (mdps/LSB)
   */
  getGyroSensitivity(): number {
    return GyroSensitivity[this.gyroFS];
  }

  /**
   * Read raw gyroscope data
   */
  readRawGyro(): RawVector3D {
    const buffer = this.i2c.readBlock(Registers.OUTX_L_G, 6);
    return {
      x: buffer.readInt16LE(0),
      y: buffer.readInt16LE(2),
      z: buffer.readInt16LE(4),
    };
  }

  /**
   * Read gyroscope data in mdps (millidegrees per second)
   */
  readGyro(): Vector3D {
    const raw = this.readRawGyro();
    const sensitivity = this.getGyroSensitivity();
    return {
      x: raw.x * sensitivity,
      y: raw.y * sensitivity,
      z: raw.z * sensitivity,
    };
  }

  /**
   * Read gyroscope data in dps (degrees per second)
   */
  readGyroDPS(): Vector3D {
    const mdps = this.readGyro();
    return {
      x: mdps.x / 1000,
      y: mdps.y / 1000,
      z: mdps.z / 1000,
    };
  }

  /**
   * Check if new gyroscope data is available
   */
  isGyroDataReady(): boolean {
    const status = this.i2c.readByte(Registers.STATUS_REG);
    return (status & 0x02) !== 0;
  }

  // ==================== Temperature Methods ====================

  /**
   * Read raw temperature data
   */
  readRawTemperature(): number {
    const buffer = this.i2c.readBlock(Registers.OUT_TEMP_L, 2);
    return buffer.readInt16LE(0);
  }

  /**
   * Read temperature in degrees Celsius
   * Temperature sensitivity: 256 LSB/°C, offset: 25°C at 0
   */
  readTemperature(): number {
    const raw = this.readRawTemperature();
    return 25 + raw / 256;
  }

  /**
   * Check if new temperature data is available
   */
  isTempDataReady(): boolean {
    const status = this.i2c.readByte(Registers.STATUS_REG);
    return (status & 0x04) !== 0;
  }

  // ==================== Combined Reading Methods ====================

  /**
   * Get status of all data ready flags
   */
  getStatus(): SensorStatus {
    const status = this.i2c.readByte(Registers.STATUS_REG);
    return {
      accelDataReady: (status & 0x01) !== 0,
      gyroDataReady: (status & 0x02) !== 0,
      tempDataReady: (status & 0x04) !== 0,
    };
  }

  /**
   * Read all IMU data (accelerometer and gyroscope)
   * @param includeTemp - Include temperature reading
   */
  readIMU(includeTemp: boolean = false): IMUData {
    const data: IMUData = {
      accel: this.readAccel(),
      gyro: this.readGyro(),
    };

    if (includeTemp) {
      data.temperature = this.readTemperature();
    }

    return data;
  }

  // ==================== Configuration Methods ====================

  /**
   * Perform software reset
   */
  reset(): void {
    let ctrl3 = this.i2c.readByte(Registers.CTRL3_C);
    ctrl3 |= 0x01; // Set SW_RESET bit
    this.i2c.writeByte(Registers.CTRL3_C, ctrl3);

    // Wait for reset to complete (bit auto-clears)
    let timeout = 100;
    while (timeout > 0) {
      ctrl3 = this.i2c.readByte(Registers.CTRL3_C);
      if ((ctrl3 & 0x01) === 0) break;
      timeout--;
    }

    if (timeout === 0) {
      throw new Error('LSM6DSR reset timeout');
    }
  }

  /**
   * Set Block Data Update mode
   * When enabled, output registers are not updated until both MSB and LSB are read
   */
  setBlockDataUpdate(enable: boolean): void {
    let ctrl3 = this.i2c.readByte(Registers.CTRL3_C);
    if (enable) {
      ctrl3 |= 0x40; // Set BDU bit
    } else {
      ctrl3 &= ~0x40;
    }
    this.i2c.writeByte(Registers.CTRL3_C, ctrl3);
  }

  /**
   * Set register auto-increment mode
   * When enabled, register address automatically increments during multi-byte read/write
   */
  setAutoIncrement(enable: boolean): void {
    let ctrl3 = this.i2c.readByte(Registers.CTRL3_C);
    if (enable) {
      ctrl3 |= 0x04; // Set IF_INC bit
    } else {
      ctrl3 &= ~0x04;
    }
    this.i2c.writeByte(Registers.CTRL3_C, ctrl3);
  }

  /**
   * Disable I3C protocol
   */
  private disableI3C(): void {
    let ctrl9 = this.i2c.readByte(Registers.CTRL9_XL);
    ctrl9 |= 0x02; // Set I3C_DISABLE bit
    this.i2c.writeByte(Registers.CTRL9_XL, ctrl9);
  }

  /**
   * Set FIFO mode
   */
  setFIFOMode(mode: FIFOMode): void {
    let fifoCtrl4 = this.i2c.readByte(Registers.FIFO_CTRL4);
    fifoCtrl4 = (fifoCtrl4 & 0xf8) | (mode & 0x07);
    this.i2c.writeByte(Registers.FIFO_CTRL4, fifoCtrl4);
  }

  /**
   * Set accelerometer operating mode
   */
  setAccelOperatingMode(mode: AccelOperatingMode): void {
    let ctrl6 = this.i2c.readByte(Registers.CTRL6_C);
    if (mode === AccelOperatingMode.HIGH_PERFORMANCE) {
      ctrl6 &= ~0x10; // Clear XL_HM_MODE bit
    } else {
      ctrl6 |= 0x10; // Set XL_HM_MODE bit
    }
    this.i2c.writeByte(Registers.CTRL6_C, ctrl6);
  }

  /**
   * Set gyroscope operating mode
   */
  setGyroOperatingMode(mode: GyroOperatingMode): void {
    let ctrl7 = this.i2c.readByte(Registers.CTRL7_G);
    if (mode === GyroOperatingMode.HIGH_PERFORMANCE) {
      ctrl7 &= ~0x80; // Clear G_HM_MODE bit
    } else {
      ctrl7 |= 0x80; // Set G_HM_MODE bit
    }
    this.i2c.writeByte(Registers.CTRL7_G, ctrl7);
  }

  // ==================== Low-level Register Access ====================

  /**
   * Read a register
   */
  readRegister(register: number): number {
    return this.i2c.readByte(register);
  }

  /**
   * Write a register
   */
  writeRegister(register: number, value: number): void {
    this.i2c.writeByte(register, value);
  }

  /**
   * Read multiple registers
   */
  readRegisters(register: number, length: number): Buffer {
    return this.i2c.readBlock(register, length);
  }

  // ==================== Private Helper Methods ====================

  private writeAccelConfig(odr: AccelODR, fs: AccelFullScale): void {
    // CTRL1_XL: ODR_XL[7:4], FS_XL[3:2], LPF2_XL_EN[1], not_used[0]
    const value = ((odr & 0x0f) << 4) | ((fs & 0x03) << 2);
    this.i2c.writeByte(Registers.CTRL1_XL, value);
  }

  private writeGyroConfig(odr: GyroODR, fs: GyroFullScale): void {
    // CTRL2_G: ODR_G[7:4], FS_G[3:0]
    const value = ((odr & 0x0f) << 4) | (fs & 0x0f);
    this.i2c.writeByte(Registers.CTRL2_G, value);
  }

  // ==================== Cleanup ====================

  /**
   * Close the I2C connection
   */
  close(): void {
    this.i2c.close();
  }
}

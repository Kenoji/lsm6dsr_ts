/**
 * LSM6DSR Register Definitions
 * Based on STMicroelectronics LSM6DSR datasheet and Arduino library
 */

// I2C Device Addresses (7-bit)
export const LSM6DSR_I2C_ADD_L = 0x6a; // SA0 = 0
export const LSM6DSR_I2C_ADD_H = 0x6b; // SA0 = 1 (default)

// Device ID
export const LSM6DSR_ID = 0x6b;

// Register Addresses
export const Registers = {
  FUNC_CFG_ACCESS: 0x01,
  PIN_CTRL: 0x02,
  FIFO_CTRL1: 0x07,
  FIFO_CTRL2: 0x08,
  FIFO_CTRL3: 0x09,
  FIFO_CTRL4: 0x0a,
  COUNTER_BDR_REG1: 0x0b,
  COUNTER_BDR_REG2: 0x0c,
  INT1_CTRL: 0x0d,
  INT2_CTRL: 0x0e,
  WHO_AM_I: 0x0f,
  CTRL1_XL: 0x10,
  CTRL2_G: 0x11,
  CTRL3_C: 0x12,
  CTRL4_C: 0x13,
  CTRL5_C: 0x14,
  CTRL6_C: 0x15,
  CTRL7_G: 0x16,
  CTRL8_XL: 0x17,
  CTRL9_XL: 0x18,
  CTRL10_C: 0x19,
  ALL_INT_SRC: 0x1a,
  WAKE_UP_SRC: 0x1b,
  TAP_SRC: 0x1c,
  D6D_SRC: 0x1d,
  STATUS_REG: 0x1e,
  OUT_TEMP_L: 0x20,
  OUT_TEMP_H: 0x21,
  OUTX_L_G: 0x22,
  OUTX_H_G: 0x23,
  OUTY_L_G: 0x24,
  OUTY_H_G: 0x25,
  OUTZ_L_G: 0x26,
  OUTZ_H_G: 0x27,
  OUTX_L_A: 0x28,
  OUTX_H_A: 0x29,
  OUTY_L_A: 0x2a,
  OUTY_H_A: 0x2b,
  OUTZ_L_A: 0x2c,
  OUTZ_H_A: 0x2d,
  EMB_FUNC_STATUS_MAINPAGE: 0x35,
  FSM_STATUS_A_MAINPAGE: 0x36,
  FSM_STATUS_B_MAINPAGE: 0x37,
  STATUS_MASTER_MAINPAGE: 0x39,
  FIFO_STATUS1: 0x3a,
  FIFO_STATUS2: 0x3b,
  TIMESTAMP0: 0x40,
  TIMESTAMP1: 0x41,
  TIMESTAMP2: 0x42,
  TIMESTAMP3: 0x43,
  TAP_CFG0: 0x56,
  TAP_CFG1: 0x57,
  TAP_CFG2: 0x58,
  TAP_THS_6D: 0x59,
  INT_DUR2: 0x5a,
  WAKE_UP_THS: 0x5b,
  WAKE_UP_DUR: 0x5c,
  FREE_FALL: 0x5d,
  MD1_CFG: 0x5e,
  MD2_CFG: 0x5f,
  I3C_BUS_AVB: 0x62,
  INTERNAL_FREQ_FINE: 0x63,
  X_OFS_USR: 0x73,
  Y_OFS_USR: 0x74,
  Z_OFS_USR: 0x75,
  FIFO_DATA_OUT_TAG: 0x78,
  FIFO_DATA_OUT_X_L: 0x79,
  FIFO_DATA_OUT_X_H: 0x7a,
  FIFO_DATA_OUT_Y_L: 0x7b,
  FIFO_DATA_OUT_Y_H: 0x7c,
  FIFO_DATA_OUT_Z_L: 0x7d,
  FIFO_DATA_OUT_Z_H: 0x7e,
} as const;

// Accelerometer Output Data Rate (ODR)
export enum AccelODR {
  OFF = 0,
  Hz_1_6 = 0x0b, // Low power only
  Hz_12_5 = 0x01,
  Hz_26 = 0x02,
  Hz_52 = 0x03,
  Hz_104 = 0x04,
  Hz_208 = 0x05,
  Hz_417 = 0x06,
  Hz_833 = 0x07,
  Hz_1667 = 0x08,
  Hz_3333 = 0x09,
  Hz_6667 = 0x0a,
}

// Accelerometer Full Scale
export enum AccelFullScale {
  G_2 = 0,
  G_16 = 1,
  G_4 = 2,
  G_8 = 3,
}

// Gyroscope Output Data Rate (ODR)
export enum GyroODR {
  OFF = 0,
  Hz_12_5 = 0x01,
  Hz_26 = 0x02,
  Hz_52 = 0x03,
  Hz_104 = 0x04,
  Hz_208 = 0x05,
  Hz_417 = 0x06,
  Hz_833 = 0x07,
  Hz_1667 = 0x08,
  Hz_3333 = 0x09,
  Hz_6667 = 0x0a,
}

// Gyroscope Full Scale
export enum GyroFullScale {
  DPS_250 = 0,
  DPS_125 = 2,
  DPS_500 = 4,
  DPS_1000 = 8,
  DPS_2000 = 12,
  DPS_4000 = 1,
}

// FIFO Modes
export enum FIFOMode {
  BYPASS = 0,
  FIFO = 1,
  STREAM_TO_FIFO = 3,
  BYPASS_TO_STREAM = 4,
  STREAM = 6,
  BYPASS_TO_FIFO = 7,
}

// Operating Modes
export enum AccelOperatingMode {
  HIGH_PERFORMANCE = 0,
  LOW_POWER_NORMAL = 1,
}

export enum GyroOperatingMode {
  HIGH_PERFORMANCE = 0,
  LOW_POWER_NORMAL = 1,
}

// Sensitivity values (mg/LSB for accelerometer, mdps/LSB for gyroscope)
export const AccelSensitivity: Record<AccelFullScale, number> = {
  [AccelFullScale.G_2]: 0.061,
  [AccelFullScale.G_4]: 0.122,
  [AccelFullScale.G_8]: 0.244,
  [AccelFullScale.G_16]: 0.488,
};

export const GyroSensitivity: Record<GyroFullScale, number> = {
  [GyroFullScale.DPS_125]: 4.370,
  [GyroFullScale.DPS_250]: 8.750,
  [GyroFullScale.DPS_500]: 17.500,
  [GyroFullScale.DPS_1000]: 35.000,
  [GyroFullScale.DPS_2000]: 70.000,
  [GyroFullScale.DPS_4000]: 140.000,
};

// ODR to Hz mapping
export const AccelODRHz: Record<AccelODR, number> = {
  [AccelODR.OFF]: 0,
  [AccelODR.Hz_1_6]: 1.6,
  [AccelODR.Hz_12_5]: 12.5,
  [AccelODR.Hz_26]: 26,
  [AccelODR.Hz_52]: 52,
  [AccelODR.Hz_104]: 104,
  [AccelODR.Hz_208]: 208,
  [AccelODR.Hz_417]: 417,
  [AccelODR.Hz_833]: 833,
  [AccelODR.Hz_1667]: 1667,
  [AccelODR.Hz_3333]: 3333,
  [AccelODR.Hz_6667]: 6667,
};

export const GyroODRHz: Record<GyroODR, number> = {
  [GyroODR.OFF]: 0,
  [GyroODR.Hz_12_5]: 12.5,
  [GyroODR.Hz_26]: 26,
  [GyroODR.Hz_52]: 52,
  [GyroODR.Hz_104]: 104,
  [GyroODR.Hz_208]: 208,
  [GyroODR.Hz_417]: 417,
  [GyroODR.Hz_833]: 833,
  [GyroODR.Hz_1667]: 1667,
  [GyroODR.Hz_3333]: 3333,
  [GyroODR.Hz_6667]: 6667,
};

// Full scale to value mapping
export const AccelFSValue: Record<AccelFullScale, number> = {
  [AccelFullScale.G_2]: 2,
  [AccelFullScale.G_4]: 4,
  [AccelFullScale.G_8]: 8,
  [AccelFullScale.G_16]: 16,
};

export const GyroFSValue: Record<GyroFullScale, number> = {
  [GyroFullScale.DPS_125]: 125,
  [GyroFullScale.DPS_250]: 250,
  [GyroFullScale.DPS_500]: 500,
  [GyroFullScale.DPS_1000]: 1000,
  [GyroFullScale.DPS_2000]: 2000,
  [GyroFullScale.DPS_4000]: 4000,
};

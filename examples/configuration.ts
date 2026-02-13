/**
 * Configuration Example
 *
 * This example demonstrates various configuration options:
 * - Different ODR and full-scale settings
 * - Operating modes (high performance vs low power)
 * - Raw vs converted data reading
 */

import {
  LSM6DSR,
  AccelODR,
  AccelFullScale,
  GyroODR,
  GyroFullScale,
  AccelOperatingMode,
  GyroOperatingMode,
} from '../src';

async function main() {
  console.log('LSM6DSR Configuration Example');
  console.log('==============================\n');

  const sensor = new LSM6DSR();

  try {
    sensor.begin();

    // ====== Accelerometer Configuration ======
    console.log('--- Accelerometer Configuration ---\n');

    // Set different full scales and show sensitivity
    const accelScales = [
      AccelFullScale.G_2,
      AccelFullScale.G_4,
      AccelFullScale.G_8,
      AccelFullScale.G_16,
    ];

    console.log('Full Scale Settings:');
    for (const fs of accelScales) {
      sensor.setAccelFullScale(fs);
      console.log(
        `  ±${sensor.getAccelFullScale()}g: Sensitivity = ${sensor.getAccelSensitivity()} mg/LSB`
      );
    }
    console.log('');

    // Set different ODRs
    const accelODRs = [
      AccelODR.Hz_12_5,
      AccelODR.Hz_52,
      AccelODR.Hz_104,
      AccelODR.Hz_417,
      AccelODR.Hz_833,
    ];

    console.log('ODR Settings:');
    for (const odr of accelODRs) {
      sensor.setAccelODR(odr);
      console.log(`  ${sensor.getAccelODR()} Hz`);
    }
    console.log('');

    // ====== Gyroscope Configuration ======
    console.log('--- Gyroscope Configuration ---\n');

    const gyroScales = [
      GyroFullScale.DPS_125,
      GyroFullScale.DPS_250,
      GyroFullScale.DPS_500,
      GyroFullScale.DPS_1000,
      GyroFullScale.DPS_2000,
    ];

    console.log('Full Scale Settings:');
    for (const fs of gyroScales) {
      sensor.setGyroFullScale(fs);
      console.log(
        `  ±${sensor.getGyroFullScale()}dps: Sensitivity = ${sensor.getGyroSensitivity()} mdps/LSB`
      );
    }
    console.log('');

    // ====== Operating Modes ======
    console.log('--- Operating Modes ---\n');

    console.log('Accelerometer:');
    sensor.setAccelOperatingMode(AccelOperatingMode.HIGH_PERFORMANCE);
    console.log('  High Performance Mode: Max ODR = 6667 Hz');

    sensor.setAccelOperatingMode(AccelOperatingMode.LOW_POWER_NORMAL);
    console.log('  Low Power Mode: Max ODR = 208 Hz');

    console.log('\nGyroscope:');
    sensor.setGyroOperatingMode(GyroOperatingMode.HIGH_PERFORMANCE);
    console.log('  High Performance Mode: Full ODR range');

    sensor.setGyroOperatingMode(GyroOperatingMode.LOW_POWER_NORMAL);
    console.log('  Low Power Mode: Lower power consumption');
    console.log('');

    // ====== Data Reading Comparison ======
    console.log('--- Data Reading Comparison ---\n');

    // Configure for demonstration
    sensor.setAccelFullScale(AccelFullScale.G_2);
    sensor.setAccelODR(AccelODR.Hz_104);
    sensor.setGyroFullScale(GyroFullScale.DPS_250);
    sensor.setGyroODR(GyroODR.Hz_104);

    sensor.enableAccel();
    sensor.enableGyro();

    // Wait for data
    await sleep(100);

    // Read raw data
    const rawAccel = sensor.readRawAccel();
    const rawGyro = sensor.readRawGyro();
    const rawTemp = sensor.readRawTemperature();

    console.log('Raw Data (16-bit signed integers):');
    console.log(`  Accel: X=${rawAccel.x}, Y=${rawAccel.y}, Z=${rawAccel.z}`);
    console.log(`  Gyro:  X=${rawGyro.x}, Y=${rawGyro.y}, Z=${rawGyro.z}`);
    console.log(`  Temp:  ${rawTemp}`);
    console.log('');

    // Read converted data
    const accel = sensor.readAccel();
    const gyro = sensor.readGyro();
    const temp = sensor.readTemperature();

    console.log('Converted Data:');
    console.log(
      `  Accel: X=${accel.x.toFixed(2)}, Y=${accel.y.toFixed(2)}, Z=${accel.z.toFixed(2)} mg`
    );
    console.log(
      `  Gyro:  X=${gyro.x.toFixed(2)}, Y=${gyro.y.toFixed(2)}, Z=${gyro.z.toFixed(2)} mdps`
    );
    console.log(`  Temp:  ${temp.toFixed(2)} °C`);
    console.log('');

    // Read in different units
    const accelG = sensor.readAccelG();
    const gyroDPS = sensor.readGyroDPS();

    console.log('Alternative Units:');
    console.log(
      `  Accel: X=${accelG.x.toFixed(4)}, Y=${accelG.y.toFixed(4)}, Z=${accelG.z.toFixed(4)} g`
    );
    console.log(
      `  Gyro:  X=${gyroDPS.x.toFixed(4)}, Y=${gyroDPS.y.toFixed(4)}, Z=${gyroDPS.z.toFixed(4)} dps`
    );
    console.log('');

    // ====== Register Access ======
    console.log('--- Direct Register Access ---\n');

    // Read WHO_AM_I register
    const whoAmI = sensor.readRegister(0x0f);
    console.log(`WHO_AM_I (0x0F): 0x${whoAmI.toString(16).padStart(2, '0')}`);

    // Read CTRL1_XL register
    const ctrl1 = sensor.readRegister(0x10);
    console.log(`CTRL1_XL (0x10): 0x${ctrl1.toString(16).padStart(2, '0')}`);
    console.log(`  ODR_XL: ${(ctrl1 >> 4) & 0x0f}`);
    console.log(`  FS_XL: ${(ctrl1 >> 2) & 0x03}`);

    // Read CTRL2_G register
    const ctrl2 = sensor.readRegister(0x11);
    console.log(`CTRL2_G (0x11): 0x${ctrl2.toString(16).padStart(2, '0')}`);
    console.log(`  ODR_G: ${(ctrl2 >> 4) & 0x0f}`);
    console.log(`  FS_G: ${ctrl2 & 0x0f}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    sensor.close();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();

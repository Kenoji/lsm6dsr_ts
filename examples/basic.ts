/**
 * Basic LSM6DSR Example
 *
 * This example demonstrates basic usage of the LSM6DSR sensor:
 * - Initialize the sensor
 * - Enable accelerometer and gyroscope
 * - Read sensor data in a loop
 */

import {
  LSM6DSR,
  AccelODR,
  AccelFullScale,
  GyroODR,
  GyroFullScale,
} from '../src';

async function main() {
  console.log('LSM6DSR Basic Example');
  console.log('=====================\n');

  // Create sensor instance
  // Default: I2C bus 1, address 0x6B
  const sensor = new LSM6DSR({
    i2cBusNumber: 1,
    i2cAddress: 0x6b,
    accelODR: AccelODR.Hz_104,
    accelFullScale: AccelFullScale.G_2,
    gyroODR: GyroODR.Hz_104,
    gyroFullScale: GyroFullScale.DPS_2000,
  });

  try {
    // Initialize the sensor
    console.log('Initializing sensor...');
    sensor.begin();
    console.log('Sensor initialized successfully!\n');

    // Print configuration
    console.log('Configuration:');
    console.log(`  Accelerometer ODR: ${sensor.getAccelODR()} Hz`);
    console.log(`  Accelerometer FS: ±${sensor.getAccelFullScale()} g`);
    console.log(`  Gyroscope ODR: ${sensor.getGyroODR()} Hz`);
    console.log(`  Gyroscope FS: ±${sensor.getGyroFullScale()} dps`);
    console.log('');

    // Enable sensors
    console.log('Enabling accelerometer and gyroscope...');
    sensor.enableAccel();
    sensor.enableGyro();
    console.log('Sensors enabled!\n');

    // Wait for first data to be available
    await sleep(100);

    // Read data in a loop
    console.log('Reading sensor data (Ctrl+C to stop):\n');
    console.log('Accel (mg)                    | Gyro (mdps)');
    console.log('X        Y        Z           | X        Y        Z');
    console.log('-'.repeat(70));

    while (true) {
      // Check if data is ready
      const status = sensor.getStatus();

      if (status.accelDataReady && status.gyroDataReady) {
        // Read IMU data
        const data = sensor.readIMU();

        // Format output
        const ax = data.accel.x.toFixed(1).padStart(8);
        const ay = data.accel.y.toFixed(1).padStart(8);
        const az = data.accel.z.toFixed(1).padStart(8);
        const gx = data.gyro.x.toFixed(1).padStart(8);
        const gy = data.gyro.y.toFixed(1).padStart(8);
        const gz = data.gyro.z.toFixed(1).padStart(8);

        process.stdout.write(`\r${ax} ${ay} ${az}    | ${gx} ${gy} ${gz}`);
      }

      // Small delay to avoid flooding
      await sleep(10);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Cleanup
    sensor.close();
    console.log('\nSensor closed.');
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\nExiting...');
  process.exit(0);
});

main();

/**
 * Polling Example
 *
 * This example demonstrates how to poll the sensor at a specific rate
 * and process the data with timestamps.
 */

import {
  LSM6DSR,
  AccelODR,
  AccelFullScale,
  GyroODR,
  GyroFullScale,
  IMUData,
} from '../src';

// Configuration
const SAMPLE_RATE_MS = 10; // 100 Hz polling
const BUFFER_SIZE = 100; // Store last 100 samples

interface TimestampedIMUData extends IMUData {
  timestamp: number;
}

async function main() {
  console.log('LSM6DSR Polling Example');
  console.log('=======================\n');

  const sensor = new LSM6DSR({
    accelODR: AccelODR.Hz_208,
    accelFullScale: AccelFullScale.G_4,
    gyroODR: GyroODR.Hz_208,
    gyroFullScale: GyroFullScale.DPS_1000,
  });

  const dataBuffer: TimestampedIMUData[] = [];
  let sampleCount = 0;
  const startTime = Date.now();

  try {
    sensor.begin();
    sensor.enableAccel();
    sensor.enableGyro();

    console.log('Collecting data for 5 seconds...\n');

    const endTime = startTime + 5000;

    while (Date.now() < endTime) {
      const status = sensor.getStatus();

      if (status.accelDataReady && status.gyroDataReady) {
        const data = sensor.readIMU(true); // Include temperature
        const timestamp = Date.now() - startTime;

        const timestampedData: TimestampedIMUData = {
          ...data,
          timestamp,
        };

        // Add to buffer (circular buffer behavior)
        if (dataBuffer.length >= BUFFER_SIZE) {
          dataBuffer.shift();
        }
        dataBuffer.push(timestampedData);
        sampleCount++;
      }

      await sleep(SAMPLE_RATE_MS);
    }

    // Calculate statistics
    const duration = (Date.now() - startTime) / 1000;
    const actualRate = sampleCount / duration;

    console.log('Collection complete!\n');
    console.log('Statistics:');
    console.log(`  Total samples: ${sampleCount}`);
    console.log(`  Duration: ${duration.toFixed(2)} seconds`);
    console.log(`  Actual sample rate: ${actualRate.toFixed(1)} Hz`);
    console.log(`  Buffer size: ${dataBuffer.length} samples`);
    console.log('');

    // Calculate averages from buffer
    if (dataBuffer.length > 0) {
      const avgAccel = calculateAverage(dataBuffer.map((d) => d.accel));
      const avgGyro = calculateAverage(dataBuffer.map((d) => d.gyro));
      const avgTemp =
        dataBuffer.reduce((sum, d) => sum + (d.temperature ?? 0), 0) /
        dataBuffer.length;

      console.log('Average values (from buffer):');
      console.log(
        `  Accel: X=${avgAccel.x.toFixed(2)} Y=${avgAccel.y.toFixed(2)} Z=${avgAccel.z.toFixed(2)} mg`
      );
      console.log(
        `  Gyro:  X=${avgGyro.x.toFixed(2)} Y=${avgGyro.y.toFixed(2)} Z=${avgGyro.z.toFixed(2)} mdps`
      );
      console.log(`  Temp:  ${avgTemp.toFixed(2)} °C`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    sensor.close();
  }
}

function calculateAverage(
  vectors: { x: number; y: number; z: number }[]
): { x: number; y: number; z: number } {
  const sum = vectors.reduce(
    (acc, v) => ({
      x: acc.x + v.x,
      y: acc.y + v.y,
      z: acc.z + v.z,
    }),
    { x: 0, y: 0, z: 0 }
  );

  return {
    x: sum.x / vectors.length,
    y: sum.y / vectors.length,
    z: sum.z / vectors.length,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main();

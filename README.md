# lsm6dsr-ts

TypeScript library for the LSM6DSR 6-axis IMU sensor on Raspberry Pi.

## Features

- Full TypeScript support with type definitions
- Accelerometer: ±2g, ±4g, ±8g, ±16g full scale
- Gyroscope: ±125, ±250, ±500, ±1000, ±2000, ±4000 dps full scale
- Output data rates from 1.6 Hz to 6667 Hz
- Temperature sensor
- Block Data Update (BDU) support
- Low-level register access

## Installation

```bash
npm install lsm6dsr-ts
```

## Requirements

- Node.js 14.0.0 or higher
- Raspberry Pi with I2C enabled
- LSM6DSR sensor connected via I2C

### Enable I2C on Raspberry Pi

```bash
sudo raspi-config
# Navigate to: Interfacing Options > I2C > Enable
```

## Quick Start

```typescript
import { LSM6DSR, AccelODR, GyroODR } from 'lsm6dsr-ts';

// Create sensor instance
const sensor = new LSM6DSR();

// Initialize
sensor.begin();

// Enable sensors
sensor.enableAccel();
sensor.enableGyro();

// Read data
const data = sensor.readIMU();
console.log('Accel (mg):', data.accel);
console.log('Gyro (mdps):', data.gyro);

// Cleanup
sensor.close();
```

## API Reference

### Constructor

```typescript
const sensor = new LSM6DSR(config?: LSM6DSRConfig);
```

Configuration options:
- `i2cAddress`: I2C address (default: 0x6B)
- `i2cBusNumber`: I2C bus number (default: 1)
- `accelODR`: Accelerometer ODR (default: 104 Hz)
- `accelFullScale`: Accelerometer full scale (default: ±2g)
- `gyroODR`: Gyroscope ODR (default: 104 Hz)
- `gyroFullScale`: Gyroscope full scale (default: ±2000 dps)

### Initialization

```typescript
sensor.begin(): boolean      // Initialize sensor
sensor.reset(): void         // Software reset
sensor.readWhoAmI(): number  // Read WHO_AM_I register
```

### Accelerometer

```typescript
sensor.enableAccel(): void
sensor.disableAccel(): void
sensor.isAccelEnabled(): boolean

// Configuration
sensor.setAccelODR(odr: AccelODR): void
sensor.getAccelODR(): number  // Returns Hz
sensor.setAccelFullScale(fs: AccelFullScale): void
sensor.getAccelFullScale(): number  // Returns g
sensor.getAccelSensitivity(): number  // Returns mg/LSB

// Data reading
sensor.readRawAccel(): RawVector3D   // Raw 16-bit values
sensor.readAccel(): Vector3D          // Converted to mg
sensor.readAccelG(): Vector3D         // Converted to g
sensor.isAccelDataReady(): boolean
```

### Gyroscope

```typescript
sensor.enableGyro(): void
sensor.disableGyro(): void
sensor.isGyroEnabled(): boolean

// Configuration
sensor.setGyroODR(odr: GyroODR): void
sensor.getGyroODR(): number  // Returns Hz
sensor.setGyroFullScale(fs: GyroFullScale): void
sensor.getGyroFullScale(): number  // Returns dps
sensor.getGyroSensitivity(): number  // Returns mdps/LSB

// Data reading
sensor.readRawGyro(): RawVector3D    // Raw 16-bit values
sensor.readGyro(): Vector3D           // Converted to mdps
sensor.readGyroDPS(): Vector3D        // Converted to dps
sensor.isGyroDataReady(): boolean
```

### Temperature

```typescript
sensor.readRawTemperature(): number  // Raw 16-bit value
sensor.readTemperature(): number     // Converted to °C
sensor.isTempDataReady(): boolean
```

### Combined Reading

```typescript
sensor.readIMU(includeTemp?: boolean): IMUData
sensor.getStatus(): SensorStatus
```

### Operating Modes

```typescript
sensor.setAccelOperatingMode(mode: AccelOperatingMode): void
sensor.setGyroOperatingMode(mode: GyroOperatingMode): void
```

### Low-level Access

```typescript
sensor.readRegister(register: number): number
sensor.writeRegister(register: number, value: number): void
sensor.readRegisters(register: number, length: number): Buffer
```

## Enums

### AccelODR
- `OFF`, `Hz_1_6`, `Hz_12_5`, `Hz_26`, `Hz_52`, `Hz_104`, `Hz_208`, `Hz_417`, `Hz_833`, `Hz_1667`, `Hz_3333`, `Hz_6667`

### AccelFullScale
- `G_2`, `G_4`, `G_8`, `G_16`

### GyroODR
- `OFF`, `Hz_12_5`, `Hz_26`, `Hz_52`, `Hz_104`, `Hz_208`, `Hz_417`, `Hz_833`, `Hz_1667`, `Hz_3333`, `Hz_6667`

### GyroFullScale
- `DPS_125`, `DPS_250`, `DPS_500`, `DPS_1000`, `DPS_2000`, `DPS_4000`

## Wiring

| LSM6DSR | Raspberry Pi |
|---------|--------------|
| VCC     | 3.3V (Pin 1) |
| GND     | GND (Pin 6)  |
| SDA     | SDA1 (Pin 3) |
| SCL     | SCL1 (Pin 5) |

## Examples

See the `examples/` directory for more usage examples:
- `basic.ts` - Basic sensor reading
- `polling.ts` - Polling with timestamps
- `configuration.ts` - Configuration options

## License

MIT

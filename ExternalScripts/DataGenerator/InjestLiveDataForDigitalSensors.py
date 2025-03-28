import pyodbc
import random
import time
from datetime import datetime


# SQL Server Configuration
SERVER = 'p3nwplsk12sql-v17.shr.prod.phx3.secureserver.net'
DATABASE = 'inspirecenter_sensors'
USERNAME = 'inspirecenter_sensors'
PASSWORD = '9Rhf43m3@'
DRIVER = '{ODBC Driver 18 for SQL Server}'

# Sensor types with realistic value ranges
VALID_SENSORS = {
    "temperature": (15, 35),  # Celsius
    "humidity": (30, 80),  # Percentage
    "pressure": (980, 1050),  # hPa
    "luminance": (10, 1000),  # Lux
    "wind_speed": (0, 15),  # m/s
    "wind_direction": (0, 360)  # Degrees
}

try:
    # Connect to SQL Server
    conn = pyodbc.connect(
        f"DRIVER={DRIVER};"
        f"SERVER={SERVER};"
        f"DATABASE={DATABASE};"
        f"UID={USERNAME};"
        f"PWD={PASSWORD};"
        f"TrustServerCertificate=yes;"        
    )
    cursor = conn.cursor()
    print("Connected to SQL Server successfully!")

    # Get valid sensor devices within ID range (44 to 100) which are the new virtual sensors with valid sensor types
    query = """
    SELECT sd.id, s.name 
    FROM SensorDevices sd 
    JOIN Sensors s ON sd.sensorId = s.id
    WHERE sd.id BETWEEN 44 AND 100
    AND s.name IN ('temperature', 'humidity', 'pressure', 'luminance', 'wind_speed', 'wind_direction')
    """
    cursor.execute(query) 
    sensors = cursor.fetchall()

    if not sensors:
        print("️No valid sensors found in range 44-100!")
        cursor.close()
        conn.close()
        exit()

    print(f"Found {len(sensors)} valid sensors. Starting data insertion every 1 minute...")

    while True:  # Infinite loop to keep inserting data every minute
        records = []
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        for sensor_id, sensor_name in sensors:
            min_val, max_val = VALID_SENSORS[sensor_name]
            value = round(random.uniform(min_val, max_val), 2)
            records.append(f"({sensor_id}, {value}, '{current_time}')")

        # Insert data into database
        insert_query = f"INSERT INTO SensorDeviceDatas (sensorDeviceId, value, recordDate) VALUES {', '.join(records)};"
        cursor.execute(insert_query)
        conn.commit()
        print(f"Inserted {len(records)} records at {current_time}")

        time.sleep(60)  # Wait for 1 minute before inserting again

except Exception as e:
    print(f"Error: {e}")

finally:
    if conn:
        cursor.close()
        conn.close()
        print("Connection closed.")
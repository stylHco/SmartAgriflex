import random
import time
import requests
import json
from datetime import datetime
import pytz

# Define the URL for the POST request
POST_URL = "http://smartagriflex.inspirecenter.org/main.php" 

# Different JSON templates
json_templates = [
    {
        "nickname": "VirtualIndoorBoard1",
        "model": "grow",
        "uid": "virtualb01",
        "timestamp": "",
        "readings": {
            "pressure": 0.0,
            "temperature": 0.0,
            "humidity": 0.0,
            "luminance": 0.0,
        }
    },
    {
        "nickname": "VirtualIndoorBoard2",
        "model": "grow",
        "uid": "virtualb02",
        "timestamp": "",
        "readings": {
            "pressure": 0.0,
            "temperature": 0.0,
            "humidity": 0.0,
            "luminance": 0.0,
        }
    },
    {
        "nickname": "VirtualWeatherBoard1",
        "model": "grow",
        "uid": "virtualb03",
        "timestamp": "",
        "readings": {
            "temperature": 0.0,
            "humidity": 0.0,
            "pressure": 0.0,
            "wind_speed": 0.0,
            "wind_direction": 0.0
        }
    }, {
        "nickname": "VirtualWeatherBoard2",
        "model": "grow",
        "uid": "virtualb04",
        "timestamp": "",
        "readings": {
            "temperature": 0.0,
            "humidity": 0.0,
            "pressure": 0.0,
            "wind_speed": 0.0,
            "wind_direction": 0.0
        }
    },
    {
        "nickname": "VirtualWeatherStation1",
        "model": "grow",
        "uid": "",
        "timestamp": "virtualws01",
        "readings": {
            "temperature": 0.0,
            "humidity": 0.0,
            "barometer": 0.0,
            "wind_speed": 0.0,
            "wind_direction": 0.0,
            "solar_radiation": 0.0,
            "soil_temperature": 0.0,
            "soil_moisture": 0.0
        }
    },
    {
        "nickname": "VirtualWeatherStation1",
        "model": "grow",
        "uid": "",
        "timestamp": "virtualws02",
        "readings": {
            "temperature": 0.0,
            "humidity": 0.0,
            "barometer": 0.0,
            "wind_speed": 0.0,
            "wind_direction": 0.0,
            "solar_radiation": 0.0,
            "soil_temperature": 0.0,
            "soil_moisture": 0.0
        }

    }
]

# Define the ranges for the sensor readings (min, max)
sensor_ranges = {
    "temperature": (15, 35),
    "humidity": (30, 80),
    "pressure": (980, 1050),
    "light": (0, 1000),
    "moisture_1": (0, 100),
    "moisture_2": (0, 100),
    "moisture_3": (0, 100),
    "wind_speed": (0, 15),
    "voltage": (3.0, 5.0)
}

# Define unique IDs and nicknames
uids = [f"virtualb0{i}" for i in range(1, 7)]
nicknames = [f"VirtualWeatherBoard{i}" for i in range(1, 7)]


# Function to generate random sensor readings
def generate_random_readings(template_readings):
    readings = {}
    for sensor in template_readings.keys():
        min_val, max_val = sensor_ranges.get(sensor, (0, 1))
        readings[sensor] = round(random.uniform(min_val, max_val), 2)
    return readings


# Function to generate a random JSON object
def generate_json(template, uid, nickname):
    tz = pytz.timezone('Europe/Athens')
    current_time = datetime.now(tz).strftime('%Y-%m-%dT%H:%M:%SZ')

    json_data = json.loads(json.dumps(template))  # Deep copy
    json_data['timestamp'] = current_time
    json_data['uid'] = uid
    json_data['nickname'] = nickname
    json_data['readings'] = generate_random_readings(json_data['readings'])

    return json_data


# Function to send JSON data via POST request
def send_post_request(json_data):
    try:
        response = requests.post(POST_URL, json=json_data)
        if response.status_code == 200:
            print(f"Successfully sent data: {json.dumps(json_data, indent=2)}")
        else:
            print(f"Failed to send data. Status Code: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error sending data: {e}")


# Main loop to send data every minute
while True:
    for i, template in enumerate(json_templates):
        json_data = generate_json(template, uids[i], nicknames[i])
        send_post_request(json_data)

    time.sleep(60)  # 1 minute interval

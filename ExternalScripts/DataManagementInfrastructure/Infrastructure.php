<?php
header('Content-Type: application/json');

$serverName = "p3nwplsk12sql-v17.shr.prod.phx3.secureserver.net"; 
$connectionOptions = [
    "Database" => "inspirecenter_sensors", 
    "Uid" => "inspirecenter_sensors",
    "PWD" => ""
];

// Connect to SQL Server
$conn = sqlsrv_connect($serverName, $connectionOptions);
if ($conn === false) {
    die(print_r(sqlsrv_errors(), true));
}
else {
    echo("Connected!!");
}


$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

if (json_last_error() === JSON_ERROR_NONE) {
    // Extract data from JSON
    $nickname = $data['uid'];
    $readings = $data['readings'];
    $timestamp = $data['timestamp'];
  // Step 1: Find the device by nickname
  $sql = "SELECT id FROM devices WHERE uid = ?";
  $params = [$nickname];
  $stmt = sqlsrv_query($conn, $sql, $params);

  if ($stmt === false) {
      die(print_r(sqlsrv_errors(), true));
  }

  $device = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
  if ($device) {
      $deviceId = $device['id'];

      // Step 2: Loop through the readings
      foreach ($readings as $sensorName => $value) {
          // Find the sensor ID by name
          $sql = "SELECT id FROM sensors WHERE name = ?";
          $params = [$sensorName];
          $stmt = sqlsrv_query($conn, $sql, $params);

          if ($stmt === false) {
              die(print_r(sqlsrv_errors(), true));
          }

          $sensor = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
          if ($sensor) {
              $sensorId = $sensor['id'];

              // Step 3: Check if sensor_device relationship exists
              $sql = "SELECT id FROM sensorDevices WHERE sensorId = ? AND deviceId = ?";
              $params = [$sensorId, $deviceId];
              $stmt = sqlsrv_query($conn, $sql, $params);

              if ($stmt === false) {
                  die(print_r(sqlsrv_errors(), true));
              }

              $sensorDevice = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
              if ($sensorDevice) {
                  $sensorDeviceId = $sensorDevice['id'];

                  // Step 4: Insert data into sensor_device_data table
                  $sql = "
                      INSERT INTO SensorDeviceDatas (SensorDeviceId, value, RecordDate) 
                      VALUES (?, ?, ?)
                  ";
                  $params = [$sensorDeviceId, $value, $timestamp];
                  $stmt = sqlsrv_query($conn, $sql, $params);

                  if ($stmt === false) {
                      die(print_r(sqlsrv_errors(), true));
                  }
              } else {
                  echo "No sensor_device relationship found for sensor '$sensorName' and device '$nickname'.\n";
              }
          } else {
              echo "No sensor found with name '$sensorName'.\n";
          }
      }
  } else {
      echo "No device found with nickname '$nickname'.\n";
  }
} else {
  echo "Invalid JSON received.\n";
}

sqlsrv_close($conn);

?>
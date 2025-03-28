<?php

session_start(); 
header('Content-Type: text/html');


function configureUI(){
    echo"
    <!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Welcome to Smart Agriculture</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            background: #e8f5e9;
            color: #2e7d32;
        }
        .navbar {
            background: #1b5e20;
            padding: 15px;
            text-align: center;
            font-size: 1.5em;
            font-weight: bold;
            color: white;
        }
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 80vh;
            text-align: center;
            padding: 20px;
        }
        .card {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            max-width: 600px;
        }
        h1 {
            color: #1b5e20;
            font-size: 2.5em;
        }
        p {
            font-size: 1.2em;
            color: #388e3c;
        }
        .btn {
            background: #2e7d32;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            font-size: 1.2em;
            border-radius: 5px;
            display: inline-block;
            margin-top: 20px;
            transition: 0.3s;
        }
        .btn:hover {
            background: #1b5e20;
        }
    </style>
</head>
<body>
    <div class='navbar'>Smart AgriFlex</div>
    <div class='container'>
        <div class='card'>
            <h1>Welcome to Smart AgriFlex</h1>
            <p>Revolutionizing farming with cutting-edge technology to boost productivity, efficiency, and sustainability. Join us in shaping the future of agriculture.</p>
        </div>
    </div>
</body>
</html>


    
    ";
}

configureUI();

?>

<?php
$servername = "autota-server";
$username = "dbmasteruser";
$dbname = "AutoTAData";
$password ="bFG%,$zB$mlZSH6ElirW7;z<.R|-96ab";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

// sql to create table
$sql = "CREATE TABLE files (
id INT(4) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(255) NOT NULL,
size INT NOT NULL
)";

if ($conn->query($sql) === TRUE) {
  echo "Table files created successfully";
} else {
  echo "Error creating table: " . $conn->error;
}

$conn->close();
?>
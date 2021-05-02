<!DOCTYPE html>
<?php
    ////code from https://www.tutorialspoint.com/php/php_file_uploading.htm
   if(isset($_FILES['image'])){
      $errors= array();
      $file_name = $_FILES['image']['name'];
      $file_size = $_FILES['image']['size'];
      $file_tmp = $_FILES['image']['tmp_name'];
      $file_type = $_FILES['image']['type'];
      $file_ext=strtolower(end(explode('.',$_FILES['image']['name'])));
      $extensions= array("py");
      if(in_array($file_ext,$extensions)=== false){
         $errors[]="extension not allowed, please choose a .py file.";
      }
      
      if($file_size > 5000000) {
         $errors[]='Max File Size reached (5mb)';
      }
      if(empty($errors)==true) {
         $bool=false;
         $file = "/home/bitnami/input/".$file_name;
         $bool=move_uploaded_file($file_tmp, $file);
         if($bool == true){
             echo "Success";
             // TODO: Run Pylint and store output in database
             $command = escapeshellcmd('pylint');
             $output = shell_exec($command . ' ' . escapeshellarg($file));

             $json_output = shell_exec($command . ' ' . escapeshellarg($file) . ' -f json');
             echo $json_output;
         }
         else{
             echo "False";
         }
      }else{
         print_r($errors);
      }
   }
?>

<html>

<head>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.1/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.7.1/highlight.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.slim.js" integrity="sha256-HwWONEZrpuoh951cQD1ov2HUK5zA5DwJ1DNUXaM6FsY=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlightjs-line-numbers.js/2.8.0/highlightjs-line-numbers.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/split.js/1.6.0/split.min.js"></script>
    <script src="fileread.js"></script>
    <script>
    hljs.highlightAll();

    hljs.initLineNumbersOnLoad();
    </script>
</head>
<!-- The core Firebase JS SDK is always required and must be listed first -->
<script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-app.js"></script>

  <!-- Add Firebase products that you want to use -->
  <script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-auth.js"></script>

<!-- TODO: Add SDKs for Firebase products that you want to use
     https://firebase.google.com/docs/web/setup#available-libraries -->
<script src="https://www.gstatic.com/firebasejs/8.3.1/firebase-analytics.js"></script>

<script>
  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyBlAocRELnWD3fNH6KxNdak9D0CLJc7RHk",
    authDomain: "autota-bb470.firebaseapp.com",
    databaseURL: "https://autota-bb470-default-rtdb.firebaseio.com",
    projectId: "autota-bb470",
    storageBucket: "autota-bb470.appspot.com",
    messagingSenderId: "655006883389",
    appId: "1:655006883389:web:171f556225622b19c19454",
    measurementId: "G-0Z6NVEVWHX"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();
</script>

<body>
    <form action ="upload.php" method ="POST" enctype ="multipart/form-data">
        <input type ="File" name = "image" />
        <input type ="submit" name = "upload" />
    </form>

    <div class="grid-container">
        <div class="header">
            <div>
                <h2 id="title">AutoTA</h2>
            </div>
            <div>
                <svg id="upload-icon" xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-file-earmark-plus" viewBox="0 0 16 16">
                    <path d="M8 6.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V11a.5.5 0 0 1-1 0V9.5H6a.5.5 0 0 1 0-1h1.5V7a.5.5 0 0 1 .5-.5z"/>
                    <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                </svg>
            </div>
        </div>

        <div class="left">
            <div>
                <div id="card-container">
                <?php
                    $conn = mysqli_connect('ls-372939ade94c9ae5a641fcdc7d3e6e2c727a03af.ch4bcjnxytnt.us-east-2.rds.amazonaws.com', 'dbmasteruser', 'bFG%,$zB$mlZSH6ElirW7;z<.R|-96ab', 'autota');
                    $user = $_COOKIE["AUTOTA_AUTH"];
                    $sql = "SELECT id, uname, date, name FROM files WHERE uname='$user'";
                    $result = $conn->query($sql);

                    if ($result->num_rows > 0) {
                        // output data of each row
                        while($row = $result->fetch_assoc()) {
                            $id = $row['id'];
                            $date = $row['date'];
                            $name = $row['name'];
                            echo "<a href='main.php?submission=$id'>";
                            if (isset($_GET['submission']) and $_GET['submission'] == $id){
                                echo "<div id='selected-card' class='card'>";
                            } else {
                                echo "<div class='card'>";
                            }
                            echo "<div class='row first-row'>";
                            echo "<div>";
                            echo "<span class='on-demand-run'>On-Demand</span>";
                            echo "<span class='title'>Pylint Run [$name]</span>";
                            echo "</div>";
                            echo "<div>";
                            echo "<span class='run-date'>$date</span>";
                            echo "</div>";
                            echo "</div>";
                            echo "<div class='row second-row'>";
                            echo "</div>";
                            echo "</div>";
                            echo "</a>";
                            
                        }
                    }
                    $conn->close();
                ?>
                </div>
            </div>
        </div>
        <?php
        if(!isset($_GET['submission'])) {
            echo "<div class='middle'>";
            echo "<h1>Please select a submission</h1>";
            echo "</div>";
        } else {

            $conn = mysqli_connect('ls-372939ade94c9ae5a641fcdc7d3e6e2c727a03af.ch4bcjnxytnt.us-east-2.rds.amazonaws.com', 'dbmasteruser', 'bFG%,$zB$mlZSH6ElirW7;z<.R|-96ab', 'autota');

            $sub = $_GET['submission'];
            $sql = "SELECT name, pylint,json FROM files WHERE id=$sub";
            $result = $conn->query($sql);

            // TODO: Get submission from database.  The submission ID should be in $_GET['submission'].  Load the code and output in
            if ($result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $code = $row['name'];
                $text = $row['pylint'];
                $json = $row['json'];
                $rawcodepath = "/home/bitnami/input/" . $code;
                $rawcodefile = fopen($rawcodepath, "r");
                $rawcode = fread($rawcodefile, filesize($rawcodepath));
                $outputfile = fopen($text, "r");
                $output=fread($outputfile, filesize($text));

                echo "<div class='middle split'>";
                echo "<div id='code-container'>";
                echo "<pre><code class='python'>";
                echo $rawcode;
                echo "</code></pre></div>";
                echo "<div id='pylint-container'>";
                echo "<pre>";
                echo $output;
                echo "</pre></div></div>";

                echo "<script>$(document).ready(function() {
                    Split(['#code-container', '#pylint-container']);
                });</script>";
                $jsonfile = fopen($json, "r");
                $jsonoutput = fread($jsonfile, filesize($json));
                echo "<script>$(document).ready(function() {
                    // HACK. See https://github.com/wcoder/highlightjs-line-numbers.js/issues/71
                    setTimeout(function(){ test($jsonoutput); }, 100);
                });</script>";


            } else {
                echo 'Submission not found!';
            }

            // END TODO
        }

        ?>
        <div class="right"></div>

        <div class="footer">
            <p>&copy; 2021 Marquette University Department of Computer Science</p>
        </div>
    </div>

</body>

</html>

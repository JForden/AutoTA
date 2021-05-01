<?php 

    // connect to the database
    $conn = mysqli_connect('ls-372939ade94c9ae5a641fcdc7d3e6e2c727a03af.ch4bcjnxytnt.us-east-2.rds.amazonaws.com', 'dbmasteruser', 'bFG%,$zB$mlZSH6ElirW7;z<.R|-96ab', 'autota');

    // Upload files
    if(isset($_POST['upload'])){ // if submit buttom on form is clicked

        // name of uploaded file
        $filename = $_FILES['image']['name'];
        $upload_date = date("Y/m/d");

        // destination of the file on the server
        $dest = '/home/bitnami/htdocs/input/' . $filename;
        $jdest = '/home/bitnami/htdocs/json_output/';
        $pdest = '/home/bitnami/htdocs/pylint_output/';

        // get the file extension
        $ext = pathinfo($filename, PATHINFO_EXTENSION);

        // the physical file on a temporary uploads directory on the server
        $file = $_FILES['image']['tmp_name'];
        $size = $_FILES['image']['size'];
        $name = $_POST['user'];
        echo $name;
        // Check to see if file is python file
        if(!in_array($ext, ['py'])){
            echo "File extension must be .py";
        } else{
            // move the uploaded (temporary) file to the specified destination
            if(move_uploaded_file($file, $dest)){
                echo "File uploaded successfully";
                $command = escapeshellcmd('pylint');
                $jcommand =escapeshellcmd('pylint --output-format=json');
                $pylint_save = $pdest . $filename . '.txt';
                $json_save = $jdest . $filename . '.json';

                $output = shell_exec($command . ' ' . escapeshellarg($dest) . ' >> ' . $pylint_save);

                $json_output = shell_exec($jcommand . ' ' . escapeshellarg($dest). ' >> ' . $json_save);
                $sql = "INSERT INTO files (uname, date, name, pylint, json) VALUES ('$name','$upload_date','$filename', '$pylint_save', '$json_save')";
                if(mysqli_query($conn, $sql)){
                    echo "uploaded to database successfully";
                    header("Location: main.php?user=" . $name);
                }
                else{
                    echo "Failed to upload to database successfully";
                }
            } else{
                echo"Failed to upload file.";
                return;
            }
        } 
    }
?>

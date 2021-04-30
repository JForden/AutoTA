<?php 

    // connect to the database
    $conn = mysqli_connect('ls-372939ade94c9ae5a641fcdc7d3e6e2c727a03af.ch4bcjnxytnt.us-east-2.rds.amazonaws.com', 'dbmasteruser', 'bFG%,$zB$mlZSH6ElirW7;z<.R|-96ab', 'autota');


    // Upload files
    if(isset($_POST['upload'])){ // if submit buttom on form is clicked

        // name of uploaded file
        $filename = $_FILES['image']['name'];

        // destination of the file on the server
        $dest = 'uploads/' . $filename;

        // get the file extension
        $ext = pathinfo($filename, PATHINFO_EXTENSION);

        // the physical file on a temporary uploads directory on the server
        @$file = $_FILES['image']['tmp_name'];
        @$size = $_FILES['image']['size'];

        // Check to see if file is python file
        if(!in_array($ext, ['py'])){
            echo "File extension must be .py";
        } else{
            // move the uploaded (temporary) file to the specified destination
            if(move_uploaded_file($file, $dest)){
                $sql = "INSERT INTO files (name, size) VALUES ('$filename', '$size')";

                if(mysqli_query($conn, $sql)){
                    echo "File uploaded successfully";
                } else{
                    echo"Failed to upload file.";
                    }
            } else{
                echo"Failed to upload file.";
                }
        }

    }

?>

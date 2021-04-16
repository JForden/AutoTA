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
         $bool=move_uploaded_file($file_tmp,"/opt/lampp/htdocs/stuff/images/".$file_name);
         if($bool == true){
             echo "Success";
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
    <form action ='' method ="POST" enctype ="multipart/form-data">
        <input type ="File" name = "image" />
        <input type ="submit"/>
    
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
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="nightly-run">Nightly</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">Today</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="on-demand-run">On-Demand</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">Yesterday</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="on-demand-run">On-Demand</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">Monday</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="on-demand-run">On-Demand</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">Sunday</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="nightly-run">Nightly</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">Saturday</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="nightly-run">Nightly</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">Friday</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="nightly-run">Nightly</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">Thursday</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="on-demand-run">On-Demand</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">3/24/2021</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="nightly-run">Nightly</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">3/23/2021</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="row first-row">
                            <div>
                                <span class="nightly-run">Nightly</span>
                                <span class="title">Pylint Run</span>
                            </div>
                            <div>
                                <span class="run-date">3/22/2021</span>
                            </div>
                        </div>
                        <div class="row second-row">
                            <div>2 errors<br />
                            2 warnings</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="middle split">
            <div id="code-container">
                <pre><code class="python">"""
Created on Thu Nov 22 10:28:46 2018

@author: jack
"""
import math
class Complex():
    def arg(self):
        if self.re >0:
            return math.atan(self.im/self.re)
        if self.re&lt;0 and self.im >=0:
            return math.atan((self.im/self.re)+math.pi)
        if self.re&lt;0 and self.im&lt;0:
            return ((math.atan(self.im/self.re)-math.pi)
        if self.re ==0 and self.im >0:
            return(math.pi/2)
        if self.re ==0 and self.im&lt;0:
            return((math.pi/2)*-1)
        if self.re==0 and self.im==0:
            raise ValueError
if __name__=="__main__":
    a=Complex(0,0)
    print(a.arg())</code></pre>
            </div>
            <div id="pylint-container">
                <pre>
************* Module task2
task2.py:21:0: C0303: Trailing whitespace (trailing-whitespace)
task2.py:22:0: C0303: Trailing whitespace (trailing-whitespace)
task2.py:23:0: C0305: Trailing newlines (trailing-newlines)
task2.py:1:0: C0114: Missing module docstring (missing-module-docstring)
task2.py:3:0: C0116: Missing function or method docstring (missing-function-docstring)

-----------------------------------
Your code has been rated at 7.06/10</pre>
            </div>
        </div>
        <div class="right"></div>

        <div class="footer">
            <p>&copy; 2021 Marquette University Department of Computer Science</p>
        </div>
    </div>
    <button onclick="test()">Test Button</button>

    <script>
        Split(['#code-container', '#pylint-container']);
    </script>

</body>

</html>
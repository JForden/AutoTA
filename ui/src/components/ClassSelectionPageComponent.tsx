import { Component, useEffect, useState, useReducer, FormEvent, SetStateAction } from 'react';
import { Image,Grid, Button, Form, } from 'semantic-ui-react'
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { DropdownItemProps } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';
import NewUserModal from '../components/NewUserModal';
import codeimg from '../codeex.png'
import axios from 'axios';

interface DropDownOption {
    key: number,
    value: number,
    text: string
}

var Coptions = Array<DropDownOption>();
var LectureOptions = Array<DropDownOption>();
var Loptions = Array<DropDownOption>();

const ClassSelectionPageComponent = () => {

    const [studentClassNames,setstudentClassNames] = useState<Array<string>>([]);
    const [studentClassNumbers,setstudentClassNumbers] = useState<Array<string>>([]);
    const [studentNewClassNumber, setStudentNewClassNumber] = useState<number>(0);
    const [addClass,setaddClass] = useState<boolean>(false);
    const [ClassId, setClassId] = useState<String>("");
    const [LectureId, setLectureId] = useState<String>("");
    const [LabId, setLabId] = useState<String>("");


    const handleAddClassClick = () => {
        setaddClass(true);
      };
    const handleClassSubmit = () => {
      console.log(ClassId,LectureId,LabId);
      const formData = new FormData();
      formData.append("class_name", ClassId.toString());
      formData.append("lecture_name", LectureId.toString());
      formData.append("lab_name", LabId.toString());
      axios.post(process.env.REACT_APP_BASE_API_URL + `/class/add_class_student`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
        }
      })
      .then(res => {
        window.location.href = "code"
      })
      .catch(err => {
        window.alert('Invalid entry');
        window.location.href = "/class/classes"; 
      })
    };
    const handleClassIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setClassId(value);
    };
    const handleLectureIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLectureId(value);
    };
    const handleLabIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setLabId(value);
    };

    useEffect(() => {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/class/get_student_class_by_id`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}` 
            }
        }).then(res => {
            setstudentClassNames([]);
            setstudentClassNumbers([]);
            var data = res.data
            Object.entries(data).map(([key, value]) => {
                console.log(key);
                console.log(value);
                setstudentClassNumbers(oldArray => [...oldArray, key]);
                setstudentClassNames(oldArray => [...oldArray, value as string]);

            });
        });
    }, []);


    return (
        <div style={{ margin: "5%" }}>
          <Grid celled>
            {studentClassNames.map((name, index) => {
              return (
                <Grid.Row>
                  <Grid.Column width={3}>
                    <Image src={codeimg} href={"/class/" + studentClassNumbers[index] + "/upload"} target='_blank'></Image>
                  </Grid.Column>
                  <Grid.Column width={7}>
                    <h1 style={{ margin: "8.5%" }}>{name}</h1>
                  </Grid.Column>
                </Grid.Row>
              );
            })}
          </Grid>
                {addClass && (
                    <Form>
                    <Form.Input
                fluid
                label='Class Name'
                placeholder='COSC 1020'
                value={ClassId}
                onChange={handleClassIdChange}
                />
                <Form.Input
                fluid
                label='Lecture Number'
                placeholder='102'
                value={LectureId}
                onChange={handleLectureIdChange}
                />
                <Form.Input
                fluid
                label='Lab Number'
                placeholder='405'
                value={LabId}
                onChange={handleLabIdChange}
                />
                <Button content="Submit" type="submit" onClick={handleClassSubmit} ></Button>
          </Form>
          
          )
          
          }
      
          <Button
            content="Add new class"
            icon="plus"
            labelPosition="right"
            primary
            onClick={handleAddClassClick}
            style={{ marginTop: '1em' }}
          />
        </div>
      );
      
}

export default ClassSelectionPageComponent
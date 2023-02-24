import { Component, useEffect, useState, useReducer } from 'react';
import { Image,Grid, Button, } from 'semantic-ui-react'
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { DropdownItemProps } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';
import NewUserModal from '../components/NewUserModal';
import codeimg from '../codeex.png'
import axios from 'axios';

const ClassSelectionPageComponent = () => {

    const [studentClassNames,setstudentClassNames] = useState<Array<string>>([]);
    const [studentClassNumbers,setstudentClassNumbers] = useState<Array<string>>([]);
    const [showModal, setShowModal] = useState(false);


    const handleAddClassClick = () => {
        setShowModal(true);
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
        <div style={{margin: "5%"}}>
            <Grid celled>
             {studentClassNames.map((name, index) => {
                    return (
                        <Grid.Row>
                            <Grid.Column width={3}>
                                <Image src={codeimg} href={"/class/" + studentClassNumbers[index] + "/upload"} target='_blank' ></Image>
                            </Grid.Column>
                            <Grid.Column width={7}>
                                <h1 style={{margin: "8.5%"}}>{name}</h1>
                            </Grid.Column>
                        </Grid.Row>
                    )
            })}
            </Grid>
            <Button
                content="Add new class"
                icon="plus"
                labelPosition="right"
                primary
                onClick={handleAddClassClick}
                style={{marginTop: '1em'}}
            />
            {showModal && <NewUserModal username={'NAN'} password={'NAN'} isOpen={true} />}
        </div>
    )
}

export default ClassSelectionPageComponent
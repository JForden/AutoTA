import { Component, useEffect, useState } from 'react';
import 'semantic-ui-css/semantic.min.css'
import { Button, Form, Grid, Segment, Dimmer, Header, Icon, Table } from 'semantic-ui-react'
import axios from 'axios';
import MenuComponent from '../components/MenuComponent';
import React from 'react'
import { SemanticCOLORS } from 'semantic-ui-react'
import ErrorMessage from '../components/ErrorMessage';
import Countdown from 'react-countdown';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';

interface UploadProps {
    class_id?: string
}

interface UploadPageState {
    file?: File,
    color: SemanticCOLORS,
    isLoading: boolean
    error_message: string,
    isErrorMessageHidden: boolean,
    project_name: string,
    project_id: number,
    canRedeem: boolean,
    points: number
    time_until_next_submission: string,
    is_allowed_to_submit: boolean,
    hasScoreEnabled: boolean,
    hasUnlockEnabled: boolean,

}

const UploadPage = () => {
    let { class_id } = useParams<UploadProps>();
    var cid = class_id ? parseInt(class_id) : -1;
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error_message, setError_Message] = useState<string>("");
    const [isErrorMessageHidden, setIsErrorMessageHidden] = useState<boolean>(true);
    const [project_id, setProject_id] = useState<number>(0);
    const [canRedeem, setCanRedeem] = useState<boolean>(false);
    const [points, setPoints] = useState<number>(0);
    const [time_until_next_submission, setTime_Until_Next_Submission] = useState<string>("");
    const [is_allowed_to_submit, setIs_Allowed_To_Submit] = useState<boolean>(true);
    const [hasScoreEnabled, setHasScoreEnabled] = useState<boolean>(false);
    const [hasUnlockEnabled, setHasUnlockEnabled] = useState<boolean>(false);
    const [hasTbsEnabled, setHasTbsEnabled] = useState<boolean>(false);
    const [tbstime, setTbsTime] = useState<string>("");
    const [DaysSinceProjectStarted, setDaysSinceProjectStarted] = useState<number>(0);
    const [TimeUntilNextSubmission, setTimeUntilNextSubmission] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string>("");
    const [baseCharge, setBaseCharge] = useState<number>(0);
    const [RewardCharge, setRewardCharge] = useState<number>(0);
    const [HoursUntilRecharge, setHoursUntilRecharge] = useState<number>(0);
    const [MinutesUntilRecharge, setMinutesUntilRecharge] = useState<number>(0);
    const [SecondsUntilRecharge, setSecondsUntilRecharge] = useState<number>(0);
    const [RewardState, setRewardState] = useState<boolean>(false);
    const [displayClock, setDisplayClock] = useState<boolean>(false);


    useEffect(() => {
        getSubmissionDetails();
        getCharges();
    }, [])

    // On file select (from the pop up)
    function handleFileChange(event: React.FormEvent) {
        const target = event.target as HTMLInputElement;
        const files = target.files;

        if (files != null && files.length === 1) {
            // Update the state
            setFile(files[0])
        } else {
            setFile(null);
        }

    };

    function getCharges() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/GetCharges?class_id=${class_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {
            setBaseCharge(res.data.baseCharge);
            setRewardCharge(res.data.rewardCharge);
            setHoursUntilRecharge(parseInt(res.data.HoursUntilRecharge));
            setMinutesUntilRecharge(parseInt(res.data.MinutesUntilRecharge));
            setSecondsUntilRecharge(parseInt(res.data.SecondsUntilRecharge));
            if (parseInt(res.data.HoursUntilRecharge) === 0 && parseInt(res.data.MinutesUntilRecharge) === 0 && parseInt(res.data.SecondsUntilRecharge) === 0) {

                setDisplayClock(false);
            }
            else {
                setDisplayClock(true);
            }
        }
        )

    }

    function handleRedeem() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/extraday`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {
            alert("You have now recieved an extra day of unlimited submissions!  Instead of the regular 45 minutes coolday this Wednesday, you'll only have a 5 minute cooldown between submissions!");
            window.location.reload();
        })
    }
    function getSubmissionDetails() {
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/GetSubmissionDetails?class_id=${class_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        }).then(res => {
            console.log(res.data);
            setDaysSinceProjectStarted(parseInt(res.data[1]) + 1);
            setTbsTime(res.data[0]);
            setTimeUntilNextSubmission(res.data[2]);
        })
    }
    function submitSuggestions() {
        axios.post(process.env.REACT_APP_BASE_API_URL + `/submissions/submit_suggestion`,
            {
                "suggestion": suggestions
            },
            {
                headers:
                {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
                }
            }
        ).then(res => {
            alert("Thank you for your constructive feedback, if you have any other suggestions please feel free to submit them.");
        }, (error) => {
            alert("There was an error submitting your feedback. Please try again later.");
        })
    }

    function onTimerFinish() {
        window.location.reload();
    }

    function officeHoursPage() {
        window.location.href = "/class/OfficeHours/" + class_id;
    }

    function handleSubmit() {
        if (file !== null) {
            setIsErrorMessageHidden(true);
            setIsLoading(true);
            // Create an object of formData
            const formData = new FormData();

            // Update the formData object
            formData.append(
                "file",
                file,
                file.name
            );

            formData.append("class_id", cid.toString());

            // Request made to the backend api
            // Send formData object
            axios.post(process.env.REACT_APP_BASE_API_URL + `/upload/`, formData, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
                }
            })
                .then(res => {
                    window.location.href = "code";
                })
                .catch(err => {
                    setError_Message(err.response.data.message);
                    setIsErrorMessageHidden(false);
                    setIsLoading(false);
                })
        }
    }
    function consumeRewardCharge() {
        if (RewardCharge == 0) {
            alert("You don't have any reward charges to use");
            return;
        }
        axios.get(process.env.REACT_APP_BASE_API_URL + `/submissions/ConsumeCharge?class_id=${class_id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
            }
        })
            .then(res => {
                setRewardState(true);
            })
            .catch(err => {

            })
    }
    const pulseAnimation = `
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.85;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
`;


    return (
        <div>
            <Helmet>
                <title>Upload | TA-Bot</title>
            </Helmet>
            <MenuComponent showAdminUpload={false} showUpload={false} showHelp={false} showCreate={false} showLast={true} showReviewButton={false}></MenuComponent>
            <Grid textAlign='center' style={{ height: '100vh' }} verticalAlign='middle'>
                <Grid.Column width={4}>
                    <Form loading={isLoading} size='large' onSubmit={handleSubmit} disabled={true}>
                        <Dimmer.Dimmable dimmed={true}>
                            <Segment stacked style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <div style={{
                                    height: '100px',
                                    display: 'flex',
                                    flexDirection: 'column-reverse',
                                    justifyContent: 'space-between',
                                    marginRight: '20px'
                                }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: baseCharge >= 1 ? '#00BFFF' : '#ddd',
                                        boxShadow: baseCharge == 0 ? '0 0 8px rgba(0, 191, 255, 0.5)' : 'none' // Simulate breathing for charge 1
                                    }}></div>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: baseCharge >= 2 ? '#00BFFF' : '#ddd',
                                        boxShadow: baseCharge == 1 ? '0 0 8px rgba(0, 191, 255, 0.5)' : 'none' // Simulate breathing for charge 2
                                    }}></div>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: baseCharge >= 3 ? '#00BFFF' : '#ddd',
                                        boxShadow: baseCharge == 2 ? '0 0 8px rgba(0, 191, 255, 0.5)' : 'none' // Simulate breathing for charge 3
                                    }}></div>
                                </div>
                                <Segment stacked style={{
                                    padding: '20px',
                                    borderRadius: '10px',
                                    backgroundColor: '#f4f4f4',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                }}>
                                    <h1 style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        marginBottom: '20px',
                                        fontFamily: 'Arial, sans-serif'
                                    }}>Upload Assignment Here</h1>
                                    <Form.Input type="file" fluid required onChange={handleFileChange} style={{
                                        marginBottom: '20px',
                                        borderRadius: '5px',
                                        borderColor: '#ddd',
                                        fontFamily: 'Arial, sans-serif'
                                    }} />
                                    <style>{pulseAnimation}</style>
                                    <Button
                                        disabled={!is_allowed_to_submit}
                                        type="submit"
                                        style={{
                                            background: RewardState ? 'purple' : '#00BFFF',
                                            color: 'white',
                                            borderRadius: '30px',
                                            padding: '10px 20px',
                                            border: 'none',
                                            cursor: !is_allowed_to_submit ? 'default' : 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                            transition: 'transform 0.2s ease-in-out',
                                            fontFamily: 'Arial, sans-serif',
                                            animation: RewardState ? 'pulse 2s infinite' : 'none',
                                        }}
                                        fluid size='large'
                                        onMouseOver={(e: { currentTarget: { style: { transform: string; }; }; }) => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={(e: { currentTarget: { style: { transform: string; }; }; }) => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        Upload
                                    </Button>

                                    <button onClick={consumeRewardCharge} disabled={RewardCharge <= 0} style={{
                                        marginTop: '20px',
                                        width: '200px',
                                        height: '40px',
                                        borderRadius: '20px',
                                        backgroundColor: '#9C27B0',
                                        color: '#fff',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontFamily: 'Arial, sans-serif',
                                        display: 'block',
                                        marginLeft: 'auto',
                                        marginRight: 'auto',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                        transition: 'background-color 0.2s ease-in-out',
                                        filter: RewardCharge <= 0 ? 'grayscale(100%)' : 'none'
                                    }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#AB47BC'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#9C27B0'}
                                    >Use FastPass Charge</button>

                                </Segment>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                </div>
                                <div style={{
                                    height: '220px',
                                    display: 'flex',
                                    flexDirection: 'column-reverse', // Stack items vertically in reverse order
                                    justifyContent: 'space-between',
                                    marginLeft: '20px'
                                }}>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: RewardCharge >= 1 ? '#800080' : '#ddd',
                                        marginBottom: '20px'
                                    }}></div>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: RewardCharge >= 2 ? '#800080' : '#ddd',
                                        marginBottom: '10px'
                                    }}></div>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: RewardCharge >= 3 ? '#800080' : '#ddd',
                                        marginBottom: '10px'
                                    }}></div>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: RewardCharge >= 4 ? '#800080' : '#ddd',
                                        marginBottom: '10px'
                                    }}></div>
                                    <div style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        backgroundColor: RewardCharge >= 5 ? '#800080' : '#ddd',
                                        marginBottom: '10px'
                                    }}></div>
                                </div>
                            </Segment>
                            <Dimmer active={project_id === -1}>
                                <Header as='h2' icon inverted>
                                    <Icon name='ban' />
                                    No active project
                                </Header>
                            </Dimmer>
                        </Dimmer.Dimmable>
                    </Form>
                    <div style={{ marginRight: '10px' }}>
                        {displayClock && (
                            <Countdown
                                date={new Date(new Date().getTime() + HoursUntilRecharge * 3600000 + MinutesUntilRecharge * 60000 + SecondsUntilRecharge * 1000)}
                                intervalDelay={1000}
                                precision={2}
                                renderer={({ hours, minutes, seconds, completed }) => {
                                    const countdownContent = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
                                    return (
                                        <div style={{
                                            padding: '10px',
                                            background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)',
                                            borderRadius: '5px',
                                            color: completed ? '#000' : '#0275d8',
                                            fontWeight: 'bold',
                                            boxShadow: completed ? 'none' : '0px 0px 8px rgba(0, 123, 255, 0.5)',
                                            animation: !completed ? 'rotate-border 2s linear infinite' : 'none',
                                        }}>
                                            {countdownContent}
                                            {" until "}
                                            <span style={{
                                                display: 'inline-block',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: '#00BFFF',
                                                marginLeft: '5px',
                                                marginRight: '5px',
                                                verticalAlign: 'middle'
                                            }}></span>
                                            next charge
                                        </div>
                                    );
                                }}
                                onComplete={() => { }}
                            />
                        )}
                        <Segment stacked style={{
                            padding: '20px',
                            borderRadius: '10px',
                            backgroundColor: '#f4f4f4',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }}>
                            <Button
                                disabled={!is_allowed_to_submit}
                                type="submit"
                                style={{
                                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                                    color: 'white',
                                    borderRadius: '30px',
                                    padding: '10px 20px',
                                    border: 'none',
                                    cursor: !is_allowed_to_submit ? 'default' : 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    transition: 'transform 0.2s ease-in-out',
                                    fontFamily: 'Arial, sans-serif'
                                }}
                                fluid
                                size='large'
                                onClick={officeHoursPage}
                                onMouseOver={(e: { currentTarget: { style: { transform: string; }; }; }) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e: { currentTarget: { style: { transform: string; }; }; }) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                Enter Office Hours
                            </Button>
                        </Segment>
                        <Table definition>
                            <Table.Header>
                                <Table.Row>

                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{ marginLeft: '10px' }}>Days Since Project Start</div>
                                        </div>
                                    </Table.Cell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 1 ? '#51f542' : 'white' }}>Day 1</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 2 ? '#66bb6a' : 'white' }}>Day 2</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 3 ? '#f5ce42' : 'white' }}>Day 3</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 4 ? '#f59e42' : 'white' }}>Day 4</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted === 5 ? '#f57842' : 'white' }}>Day 5</Table.HeaderCell>
                                    <Table.HeaderCell style={{ backgroundColor: DaysSinceProjectStarted >= 6 ? '#f55442' : 'white' }}>Day 6+</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                <Table.Row>
                                    <Table.Cell>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <div style={{
                                                marginLeft: '10px',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: '#00BFFF',
                                            }}></div>
                                            <div style={{ marginLeft: '10px' }}>Recharge Time</div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell style={{ fontWeight: 'bold' }}>15 mins</Table.Cell>
                                    <Table.Cell style={{ fontWeight: 'bold' }}>45 mins</Table.Cell>
                                    <Table.Cell style={{ fontWeight: 'bold' }}>2.25 hrs</Table.Cell>
                                    <Table.Cell style={{ fontWeight: 'bold' }}>3 hrs</Table.Cell>
                                    <Table.Cell style={{ fontWeight: 'bold' }}>4.5 hrs</Table.Cell>
                                    <Table.Cell style={{ fontWeight: 'bold' }}>6 hrs</Table.Cell>
                                </Table.Row>
                            </Table.Body>
                        </Table>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            fontSize: '16px',
                            fontWeight: 'normal',
                            lineHeight: '1.5'
                        }}>
                            <span>
                                Each submission uses an energy charge
                                <span style={{
                                    display: 'inline-block',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: '#00BFFF',
                                    marginLeft: '5px',
                                    marginRight: '5px',
                                    verticalAlign: 'middle'
                                }}></span>
                                , these will regenerate over time, as shown in the table above.
                            </span>
                            <span>
                                <span style={{ color: "red" }}>Attending office hours</span> will award you <span style={{ color: "red" }} >two</span> "FastPass" charges
                                <span style={{
                                    display: 'inline-block',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: '#800080', // Purple
                                    marginLeft: '5px',
                                    marginRight: '5px',
                                    verticalAlign: 'middle'
                                }}></span>
                                which can be redeemed at any time to unlock test-case results.
                            </span>
                        </div>


                    </div>


                    {hasTbsEnabled && project_id !== -1 && !is_allowed_to_submit && (
                        <>
                            <Icon name="clock outline" />
                            <Countdown date={new Date(time_until_next_submission)} onComplete={onTimerFinish} />
                        </>
                    )}

                    <ErrorMessage message={error_message} isHidden={isErrorMessageHidden} />
                    <div>&nbsp;</div>
                </Grid.Column>
                <Grid.Column width={2}>
                    <Form>
                        <p style={{
                            fontSize: '14px', // Adjusted for better readability
                            lineHeight: '1.5', // Improved line spacing for readability
                            marginBottom: '20px' // More space before the text area
                        }}>
                            TA-Bot is an assessment system developed by Marquette students. We welcome constructive feedback throughout the semester. The TA-Bot team will strive to implement your suggestions. For more information, please see our <a href="https://docs.google.com/document/d/1af1NU6K24drPaiJXFFo4gLD4dqNVivKQ9ZijDMAWyd4/edit?usp=sharing" style={{ color: '#007BFF' }}>FAQ's</a>.
                        </p>
                        <Form.TextArea
                            placeholder="example: TA-Bot struggles when dealing with small issues in Test cases"
                            value={suggestions}
                            onChange={(e, { value }) => setSuggestions(value as string)}
                            style={{
                                borderRadius: '8px', // Rounded corners for the text area
                                borderColor: '#ccc', // Subtle border color
                                padding: '10px', // Padding inside the text area for better text alignment
                                marginBottom: '10px' // Margin bottom for spacing between the text area and the button
                            }}
                        />
                        <Button
                            onClick={submitSuggestions}
                            type='submit'
                            style={{
                                backgroundColor: 'purple',
                                color: 'white',
                                borderRadius: '20px', // More pronounced rounded corners for the button
                                padding: '10px 20px', // Adequate padding for a better touch area
                                border: 'none', // Remove default border
                                cursor: 'pointer', // Cursor pointer to indicate clickable button
                                transition: 'background-color 0.3s', // Smooth transition for hover effect
                            }}
                            onMouseOver={(e: { currentTarget: { style: { backgroundColor: string; }; }; }) => e.currentTarget.style.backgroundColor = '#8e44ad'} // Darken the button on hover for better interaction feedback
                            onMouseOut={(e: { currentTarget: { style: { backgroundColor: string; }; }; }) => e.currentTarget.style.backgroundColor = 'purple'}
                        >
                            Submit Feedback
                        </Button>
                    </Form>
                </Grid.Column>

            </Grid>
        </div >
    );
}

export default UploadPage;

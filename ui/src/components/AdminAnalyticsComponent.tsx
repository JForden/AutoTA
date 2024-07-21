import { Component, useState } from 'react';
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { Button, Card, Grid, GridColumn, GridRow, Icon, List, Loader, Modal, Progress, Tab, Table } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import axios from 'axios';
import '../css/AdminAnalyticsComponent.scss';
import Chart from "react-apexcharts";
import ReactApexChart from 'react-apexcharts';
import moment from 'moment';




interface AdminAnalyticsProps {
  id: string,
}

interface AdminAnalyticsState {
  totalNumber: number | null;
  uniqueSubmissions: number | null;
  lintingResults: Record<string, number> | null;
  dates: any[];
  passed: any[];
  failed: any[];
  noSubmission: any[];
  submissionHeatmap: any[];
  TestCaseResults: Record<string, number> | null;
  PotentialAtRisk: any[];
  AtRiskStudents: Record<number, []> | null;
  selectedStudent: number | null;
  isLoading: boolean;

}



class AdminAnalyticsComponent extends Component<AdminAnalyticsProps, AdminAnalyticsState> {
  state = {
    totalNumber: null,
    uniqueSubmissions: null,
    lintingResults: null,
    TestCaseResults: null,
    dates: [],
    passed: [],
    failed: [],
    noSubmission: [],
    submissionHeatmap: [],
    PotentialAtRisk: [],
    AtRiskStudents: {},
    isLoading: true,
    selectedStudent: null,
  };


  componentDidMount() {
    let project_id = this.props.id;
    console.log("this is project id", project_id);

    axios.get(`${process.env.REACT_APP_BASE_API_URL}/projects/getSubmissionSummary?id=${project_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then((res) => {
        this.setState({ lintingResults: res.data.LintData });
        this.setState({ uniqueSubmissions: res.data.UniqueSubmissions[0], totalNumber: res.data.UniqueSubmissions[1] });
        this.setState({ TestCaseResults: res.data.TestCaseResults });
        this.setState({ dates: res.data.dates });
        this.setState({ passed: res.data.passed });
        this.setState({ failed: res.data.failed });
        this.setState({ noSubmission: res.data.noSubmission });
        this.setState({ submissionHeatmap: res.data.submissionHeatmap });
        this.setState({ isLoading: false });
        this.setState({ PotentialAtRisk: res.data.PotentialAtRisk });
        console.log("at risk students", this.state.AtRiskStudents)
      })
      .catch((err) => {
        console.log(err);
      });
    axios.get(`${process.env.REACT_APP_BASE_API_URL}/projects/AtRiskStudents?id=${project_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
      }
    })
      .then((res) => {
        this.setState({ AtRiskStudents: res.data.AtRiskStudents });
        console.log("this is at risk students", this.state.AtRiskStudents)
      })
      .catch((err) => {
        console.log(err);
      });
  }
  render() {
    const series = [
      {
        name: 'Failed',
        data: this.state.failed,
      },
      {
        name: 'Passed',
        data: this.state.passed,
      },
      {
        name: 'No Submission',
        data: this.state.noSubmission,
      }
    ];
    const totalSubmissionPercentage = this.state.totalNumber && this.state.uniqueSubmissions
      ? parseFloat(((this.state.totalNumber / this.state.uniqueSubmissions) * 100).toFixed(2))
      : 0;
    const lintingResultsArray = this.state.lintingResults
      ? Object.entries(this.state.lintingResults).map(([x, y]) => ({ x, y }))
      : [];
    const testNames = this.state.TestCaseResults ? Object.keys(this.state.TestCaseResults) : [];
    const testAverages = this.state.TestCaseResults ? Object.values(this.state.TestCaseResults) : [];

    const AtRiskPanes = [
      {
        menuItem: 'Current Assignments Struggling Students',
        render: () => (
          <Tab.Pane>
            <div style={{ maxHeight: '15em', overflowY: 'auto' }}>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Student Name</Table.HeaderCell>
                    <Table.HeaderCell>Number of Submissions</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {this.state.PotentialAtRisk.map((student, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{student[2]} {student[3]}</Table.Cell>
                      <Table.Cell>{student[1]}</Table.Cell>
                      <Table.Cell>{student[4]}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </Tab.Pane>
        ),
      },
      {
        menuItem: { content: 'At Risk Students', style: { color: '#8B0000' } },
        render: () => (
          <Tab.Pane>
            <div style={{ maxHeight: '15em', overflow: 'auto' }}>
              <Table celled>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Student Name</Table.HeaderCell>
                    <Table.HeaderCell>Office Hour Attendance for All Assignments</Table.HeaderCell>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell>Individual Analytics</Table.HeaderCell>
                    <Table.HeaderCell>Get Student Help</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {Object.entries(this.state.AtRiskStudents).map(([key, value]) => {
                    const student = value as [number, string, number, string];
                    let project_id = this.props.id;
                    const ViewButtonModal = () => {
                      const [data, setData] = useState(null);
                      const [open, setOpen] = useState(false);
                      const [totalOHQuestions, setTotalOHQuestions] = useState(0);
                      const [OHQuestionsDetails, setOHQuestionsDetails] = useState([]);
                      const [currentOHQCount, setAllOHQCount] = useState(0);

                      const handleOpen = () => {
                        setOpen(true);
                        axios.get(`${process.env.REACT_APP_BASE_API_URL}/projects/AtRiskStudentDetail?project_id=${project_id}&id=${key}`, {
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem("AUTOTA_AUTH_TOKEN")}`
                          }
                        })
                          .then((res) => {
                            setData(res.data.StudentData);
                            setTotalOHQuestions(res.data.AllOHQCount);
                            setOHQuestionsDetails(res.data.OHQuestionsDetails);
                            setAllOHQCount(res.data.currentOHQCount);
                          })
                          .catch((err) => {
                            console.log(err);
                          });
                      };
                      const chartOptions = {
                        chart: {
                          height: 350,
                          type: 'line' as const,
                          zoom: {
                            enabled: false
                          }
                        },
                        dataLabels: {
                          enabled: false
                        },
                        stroke: {
                          curve: 'straight' as const,
                        },
                        title: {
                          text: 'Student Submissions per assignment' as const,
                          align: 'left' as const,
                        },
                        grid: {
                          row: {
                            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
                            opacity: 0.5
                          },
                        },
                        xaxis: {
                          categories: data ? Object.keys(data) : [], // Set categories to the keys of your data
                        },
                      };

                      const chartSeries = [{
                        name: 'Submissions',
                        data: data ? Object.values(data) : [],
                      }];

                      let displayText;
                      switch (student[0]) {
                        case 5:
                          displayText = <span style={{ color: 'black' }}>Over <span style={{ color: 'red' }}>10</span> submissions on the last assignment <span style={{ color: 'red' }}>without</span> passing, and failed <span style={{ color: 'red' }}>two</span> out of the last <span style={{ color: 'red' }}>three</span> assignments.</span>;
                          break;
                        case 4:
                          displayText = <span style={{ color: 'black' }}>No submission for the last assignment and failed <span style={{ color: 'red' }}>two</span> out of the last <span style={{ color: 'red' }}>three</span> assignments.</span>;
                          break;
                        case 3:
                          displayText = <span style={{ color: 'black' }}>Failed <span style={{ color: 'red' }}>two</span> out of the last <span style={{ color: 'red' }}>three</span> assignments.</span>;
                          break;
                        case 2:
                          displayText = <span style={{ color: 'black' }}>More than <span style={{ color: 'red' }}>10</span> submissions on the last assignment <span style={{ color: 'red' }}>without</span> achieving a pass.</span>;
                          break;
                        case 1:
                          displayText = <span style={{ color: 'black' }}>No prior submissions recorded for previous assignment</span>;
                          break;
                        default:
                          displayText = 'Student is at risk.';
                      }
                      return (
                        <Modal
                          open={open}
                          onClose={() => setOpen(false)}
                          size='large'
                          trigger={<Button onClick={handleOpen}>View</Button>}
                        >
                          <Modal.Header>Student Details</Modal.Header>
                          <Icon name='close' onClick={() => setOpen(false)} style={{ float: 'right', cursor: 'pointer' }} />
                          <Modal.Content>
                            <Modal.Description>
                              <div style={{
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '1.2em',
                                color: '#333',
                                backgroundColor: '#f9f9f9',
                                padding: '20px',
                                borderRadius: '5px',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)',
                                marginBottom: '20px'
                              }}>
                                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Reasoning for flag:</h3>
                                <p>{displayText}</p>
                              </div>
                              <div style={{
                                fontFamily: 'Arial, sans-serif',
                                fontSize: '1.2em',
                                color: '#333',
                                backgroundColor: '#f9f9f9',
                                padding: '20px',
                                borderRadius: '5px',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.15)'
                              }}>
                                <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>Office Hours Attendance:</h3>
                                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'stretch' }}>
                                  <Card fluid style={{ width: '45%' }}>
                                    <Card.Content>
                                      <Card.Header>Student Attendance</Card.Header>
                                      <Table basic='very' celled collapsing>
                                        <Table.Header>
                                          <Table.Row>
                                            <Table.HeaderCell>Office hours attended for current assignment</Table.HeaderCell>
                                            <Table.HeaderCell>Total Office hour attendance count</Table.HeaderCell>
                                          </Table.Row>
                                        </Table.Header>
                                        <Table.Body>
                                          <Table.Row>
                                            <Table.Cell>{currentOHQCount}</Table.Cell>
                                            <Table.Cell>{totalOHQuestions}</Table.Cell>
                                          </Table.Row>
                                        </Table.Body>
                                      </Table>
                                    </Card.Content>
                                  </Card>
                                </div>
                              </div>
                              <Card fluid className="analytics-card">
                                {OHQuestionsDetails && OHQuestionsDetails.length === 0 ? null : (
                                  <div style={{
                                    maxHeight: '10em',
                                    overflowY: 'auto',
                                    margin: '20px auto 0 auto',
                                    width: '90%'
                                  }}>
                                    <Table basic='very' celled collapsing>
                                      <Table.Header>
                                        <Table.Row>
                                          <Table.HeaderCell>Project Name</Table.HeaderCell>
                                          <Table.HeaderCell>Question Asked</Table.HeaderCell>
                                        </Table.Row>
                                      </Table.Header>
                                      <Table.Body>
                                        {OHQuestionsDetails && OHQuestionsDetails.map((detail, index) => (
                                          <Table.Row key={index}>
                                            <Table.Cell>{detail[0]}</Table.Cell>
                                            <Table.Cell>{detail[1]}</Table.Cell>
                                          </Table.Row>
                                        ))}
                                      </Table.Body>
                                    </Table>
                                  </div>
                                )}
                              </Card>

                              {/* <ReactApexChart options={chartOptions} series={chartSeries} type="line" height={350} /> */}
                            </Modal.Description>
                          </Modal.Content>
                        </Modal>
                      );
                    };

                    return (
                      <Table.Row key={key}>
                        {student[0] <= 2 ? (
                          <>
                            <Table.Cell warning>{student[1]}</Table.Cell>
                            <Table.Cell warning>{student[2]}</Table.Cell>
                            <Table.Cell warning>{student[3]}</Table.Cell>
                            <Table.Cell><ViewButtonModal /></Table.Cell>
                            {/* <Table.Cell><ViewHelpModal /></Table.Cell> */}
                            <Table.Cell>
                              <Button disabled>View</Button>
                            </Table.Cell>
                          </>
                        ) : (
                          <>
                            <Table.Cell negative>{student[1]}</Table.Cell>
                            <Table.Cell negative>{student[2]}</Table.Cell>
                            <Table.Cell negative>{student[3]}</Table.Cell>
                            <Table.Cell><ViewButtonModal /></Table.Cell>
                            {/* <Table.Cell><ViewHelpModal /></Table.Cell> */}
                            <Table.Cell>
                              <Button disabled>View</Button>
                            </Table.Cell>
                          </>
                        )
                        }
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            </div>
          </Tab.Pane>

        ),
      },
    ];
    return (
      <div className="analytics-container">
        <Helmet>
          <title>Analytics | TA-Bot</title>
        </Helmet>
        <br />
        <Grid divided='vertically'>
          <Grid.Row columns={1}>
            {/* 'Percent Total Student Submissions' Column */}

            <GridColumn>
              <Tab panes={AtRiskPanes} />
            </GridColumn>


            <GridColumn>

              <Card fluid className="analytics-card">
                <div id="chart">
                  <ReactApexChart
                    options={{
                      chart: {
                        type: 'bar' as const,
                        height: 350,
                        stacked: true,
                        toolbar: {
                          show: true
                        },
                        zoom: {
                          enabled: true
                        }
                      },
                      colors: ['#dc4740', '#8ABD91', '#ADD8E6'],
                      responsive: [{
                        breakpoint: 480,
                        options: {
                          legend: {
                            position: 'bottom' as const,
                            offsetX: -10,
                            offsetY: 0
                          }
                        }
                      }],
                      plotOptions: {
                        bar: {
                          horizontal: false,
                          borderRadius: 10,
                          dataLabels: {
                            total: {
                              enabled: true,
                              style: {
                                fontSize: '13px',
                                fontWeight: 900
                              }
                            }
                          }
                        },
                      },
                      xaxis: {
                        type: 'datetime',
                        categories: this.state.dates,
                      },
                      dataLabels: {
                        enabled: false,
                      },
                      stroke: {
                        width: 1,
                        colors: ['#fff'],
                      },
                      title: {
                        text: 'Daily Submission Results'
                      },
                      tooltip: {
                        y: {
                          formatter: function (val: any) {
                            return val;
                          },
                        },
                      },
                      fill: {
                        opacity: 1,
                      },
                      legend: {
                        position: 'right' as const,
                        offsetY: 40
                      },
                    }}
                    series={series}
                    type="bar"
                    height={350}
                  />
                </div>
              </Card>
            </GridColumn>
            <GridColumn width={8}>
              <Card fluid className="analytics-card">
                <ReactApexChart
                  options={{
                    xaxis: {
                      categories: [
                        '12:00 AM - 2:00 AM',
                        '2:00 AM - 4:00 AM',
                        '4:00 AM - 6:00 AM',
                        '6:00 AM - 8:00 AM',
                        '8:00 AM - 10:00 AM',
                        '10:00 AM - 12:00 PM',
                        '12:00 PM - 2:00 PM',
                        '2:00 PM - 4:00 PM',
                        '4:00 PM - 6:00 PM',
                        '6:00 PM - 8:00 PM',
                        '8:00 PM - 10:00 PM',
                        '10:00 PM - 12:00 AM'
                      ]
                    },
                    title: {
                      text: 'Daily Class Submissions'
                    },
                    chart: {
                      height: 350,
                      type: 'heatmap',
                    },
                    dataLabels: {
                      enabled: false
                    },
                    colors: ["#008FFB"],
                    plotOptions: {
                      heatmap: {
                        radius: 30,
                        enableShades: false,
                        colorScale: {
                          ranges: [
                            { from: 0, to: 0, color: '#808080' }, // gray
                            { from: 1, to: 5, color: '#ADD8E6' }, // lightblue
                            { from: 6, to: 10, color: '#0000FF' }, // blue
                            { from: 11, to: 25, color: '#00008B' }, // darkblue
                            { from: 26, to: 50, color: '#FFA07A' }, // light salmon (similar to light orange)
                            { from: 51, to: 80, color: '#FF4500' }, // orange red (similar to light red)
                            { from: 81, to: 100, color: '#FF0000' }, // red
                          ],
                        },
                      }
                    }
                  }}
                  series={this.state.submissionHeatmap}
                  type="heatmap"
                  height={350}
                />
              </Card>
            </GridColumn>
            <GridColumn width={8}>
              <Card fluid className="analytics-card">
                <ReactApexChart
                  options={{
                    chart: {
                      height: 350,
                      type: 'radialBar',
                      toolbar: {
                        show: true
                      }
                    },
                    plotOptions: {
                      radialBar: {
                        startAngle: -135,
                        endAngle: 225,
                        hollow: {
                          margin: 0,
                          size: '70%',
                          background: '#fff',
                          image: undefined,
                          imageOffsetX: 0,
                          imageOffsetY: 0,
                          position: 'front',
                          dropShadow: {
                            enabled: true,
                            top: 3,
                            left: 0,
                            blur: 4,
                            opacity: 0.24
                          }
                        },
                        track: {
                          background: '#fff',
                          strokeWidth: '67%',
                          margin: 0, // margin is in pixels
                          dropShadow: {
                            enabled: true,
                            top: -3,
                            left: 0,
                            blur: 4,
                            opacity: 0.35
                          }
                        },
                        dataLabels: {
                          show: true,
                          name: {
                            offsetY: -10,
                            show: true,
                            color: '#888',
                            fontSize: '17px'
                          },
                          value: {
                            formatter: function (val) {
                              return val.toString();
                            },
                            color: '#111',
                            fontSize: '36px',
                            show: true,
                          }
                        }
                      }
                    },
                    title: {
                      text: 'Percentage of students who submitted at least once'
                    },
                    fill: {
                      type: 'gradient',
                      gradient: {
                        shade: 'dark',
                        type: 'horizontal',
                        shadeIntensity: 0.5,
                        gradientToColors: ['#ABE5A1'],
                        inverseColors: true,
                        opacityFrom: 1,
                        opacityTo: 1,
                        stops: [0, 100]
                      }
                    },
                    stroke: {
                      lineCap: 'round'
                    },
                    labels: ['Percent'],
                  }}
                  series={[totalSubmissionPercentage]}
                  type="radialBar"
                  height={350}
                />
              </Card>
            </GridColumn>
          </Grid.Row>
          {/* ... other Grid.Rows ... */}
          <Grid.Row columns={2} style={{ marginTop: '10px' }}>
            {/* Linting Results */}
            <Grid.Column>
              <Card fluid className="analytics-card">
                <div style={{ paddingLeft: '20px' }}>
                  <ReactApexChart
                    options={{
                      legend: {
                        show: false
                      },
                      chart: {
                        height: 350,
                        type: 'treemap'
                      },
                      title: {
                        text: 'Most Common Linting Errors'
                      }
                    }}
                    series={[{ data: lintingResultsArray }]}
                    type="treemap"
                    height={350}
                  />
                </div>
              </Card>
            </Grid.Column>
            {/* Test Case Results */}
            <Grid.Column>
              <Card fluid className="analytics-card">
                {/* <ReactApexChart
                  options={{
                    chart: {
                      type: 'bar',
                      height: 350,
                    },
                    plotOptions: {
                      bar: {
                        borderRadius: 4,
                        horizontal: true,
                      },
                    },
                    colors: [
                      '#F44F5E',
                      '#E55A89',
                      '#D863B1',
                      '#CA6CD8',
                      '#B57BED',
                      '#8D95EB',
                      '#62ACEA',
                      '#4BC3E6',
                    ],
                    dataLabels: {
                      enabled: true,
                      formatter: function (val, opt) {
                        if (typeof val === 'number') {
                          return opt.w.globals.labels[opt.dataPointIndex] + ": " + val.toFixed(2) + "%";
                        } else if (Array.isArray(val)) {
                          return val.join(', '); // or handle the array in a way that makes sense in your context
                        }
                        return val; // or some default value
                      },
                      dropShadow: {
                        enabled: true,
                      },
                    },
                    title: {
                      text: 'Test Case Averages',
                      align: 'center',
                    },
                    xaxis: {
                      categories: testNames, // Ensure this is an array of test case names
                    },
                    yaxis: {
                      title: {
                        text: 'Pass Rate (%)'
                      }
                    },
                    legend: {
                      show: false,
                    },
                  }}
                  series={[{ name: 'Pass Rate', data: testAverages }]} // Ensure this is an array of pass rates
                  type="bar"
                  height={350}
                /> */}
              </Card>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default AdminAnalyticsComponent
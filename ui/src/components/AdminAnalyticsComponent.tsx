import { Component } from 'react';
import { Helmet } from 'react-helmet';
import 'semantic-ui-css/semantic.min.css';
import { Card, Grid, Progress, Table } from 'semantic-ui-react';
import MenuComponent from './MenuComponent';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import axios from 'axios';
import '../css/AdminAnalyticsComponent.scss';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';



interface AdminAnalyticsProps {
    id: string,
}

interface AdminAnalyticsState {
  totalNumber: number | null;
  uniqueSubmissions: number | null;
  lintingResults: Record<string, number> | null;
  submissionDays: { name: string, submissions: number }[] | null;
  submissionTimes: { hour: string, index: number, value: number }[] | null;
  TestCaseResults: {
    Passed: Record<string, number>;
    Failed: Record<string, number>;
  } | null;

}



class AdminAnalyticsComponent extends Component<AdminAnalyticsProps, AdminAnalyticsState> {
    state = {
        totalNumber: null,
        uniqueSubmissions: null,
        lintingResults: null,
        TestCaseResults: null,
        submissionDays: null,
        submissionTimes: [] as { hour: string, index: number, value: number }[],
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
        this.setState({ submissionDays: res.data.SubmissionDays });
        this.setState({ submissionTimes: res.data.SubmissionTimes });
        console.log(this.state.submissionTimes);
      })
      .catch((err) => {
        console.log(err);
      });
    }
    render() {
      const uniqueDays = [...new Set(this.state.submissionTimes ? this.state.submissionTimes.map((item: { index: any; }) => item.index) : [])];
    
      return (
        <div className="analytics-container">
          <Helmet>
            <title>Analytics | TA-Bot</title>
          </Helmet>
          <Grid divided='vertically'>
          <Grid.Row columns={2} style={{ marginTop: '10px' }}>
              {/* Linting Results */}
              <Grid.Column>
                <Card fluid className="analytics-card">
                  <Card.Content>
                    <Card.Header>Linting Results</Card.Header>
                    <Table celled className="analytics-table">
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Linting Error</Table.HeaderCell>
                          <Table.HeaderCell>Count</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {this.state.lintingResults && Object.entries(this.state.lintingResults)
                          .sort((a, b) => (b[1] as number) - (a[1] as number))
                          .slice(0, 8)
                          .map(([error, count]: [string, unknown]) => (
                            <Table.Row key={error}>
                              <Table.Cell>{error}</Table.Cell>
                              <Table.Cell>{count as number}</Table.Cell>
                            </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Card.Content>
                </Card>
              </Grid.Column>
              {/* Test Case Results */}
              <Grid.Column>
                <Card fluid className="analytics-card">
                  <Card.Content>
                    <Card.Header>Test Case Results</Card.Header>
                    <Table celled striped compact className="analytics-table">
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell>Name</Table.HeaderCell>
                          <Table.HeaderCell>Pass Rate</Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {/* @ts-ignore */}
                        {this.state.TestCaseResults && Object.entries(this.state.TestCaseResults.Passed)
                          .map(([testCase, passedCount]: [string, any]) => {
                            {/* @ts-ignore */}
                            const failedCount = this.state.TestCaseResults && this.state.TestCaseResults.Failed[testCase] || 0;
                            const passRate = (passedCount as number) / ((passedCount as number) + failedCount);
                            return {
                              testCase,
                              passRate,
                            };
                          })
                          .sort((a, b) => a.passRate - b.passRate)
                          .slice(0, 8)
                          .map(({ testCase, passRate }) => (
                            <Table.Row key={testCase}>
                              <Table.Cell>{testCase}</Table.Cell>
                              <Table.Cell>{(passRate * 100).toFixed(2)}%</Table.Cell>
                            </Table.Row>
                          ))
                        }
                      </Table.Body>
                    </Table>
                  </Card.Content>
                </Card>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              {/* 'Percent Total Student Submissions' Column */}
              <Grid.Column>
                <Card fluid className="analytics-card">
                  <Card.Content>
                    <Card.Header>Percent Total Student Submissions</Card.Header>
                    <div className="progress-bar-container">
                      <Progress 
                        value={this.state.uniqueSubmissions || 0} 
                        total={this.state.totalNumber || 1} 
                        progress='ratio' 
                        indicating 
                        className="analytics-progress"
                      />
                      <div className="progress-bar-info">
                        {this.state.uniqueSubmissions}/{this.state.totalNumber} Submissions
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </Grid.Column>
              {/* 'Daily Submission Count' Column */}
              <h2>Submissions per day:</h2>
              <Grid.Column>
                <Card fluid className="analytics-card">
                    <Card.Content className="analytics-bar-chart"> {/* Added class name here */}
                        {this.state.submissionDays && (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={this.state.submissionDays} className="analytics-bar-chart"> {/* Added class name here */}
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="submissions" fill="#4c9ac0" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card.Content>
                </Card>
            </Grid.Column>

            </Grid.Row>
            {/* ... other Grid.Rows ... */}
        <h2>Average Submission times</h2>
        <Grid.Row columns={1} style={{ marginTop: '10px' }}>
          <Grid.Column width={16}>
            <Card fluid className="analytics-card">
              <Card.Content>
                {uniqueDays.sort((a, b) => a - b).map((day, i) => {
                  const data = this.state.submissionTimes?.filter(item => item.index === day) || [];

                  return (
                    <ResponsiveContainer width="100%" height={100} key={i}>
                      <ScatterChart
                        margin={{
                          top: 20,
                          right: 0,
                          bottom: 0,
                          left: 0,
                        }}
                      >
                        <XAxis type="category" dataKey="hour" interval={0} tickLine={{ transform: 'translate(0, -6)' }} />
                        <YAxis type="number" dataKey="index" height={10} width={80} tick={false} tickLine={false} axisLine={false} label={{ value: `Day ${day}`, position: 'insideRight' }} />
                        <ZAxis type="number" dataKey="value" range={[0, 400]} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter data={data} fill="#8884d8" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  );
                })}
              </Card.Content>
            </Card>
          </Grid.Column>
        </Grid.Row>
          </Grid>

        </div>     
      );
    }
}

export default AdminAnalyticsComponent
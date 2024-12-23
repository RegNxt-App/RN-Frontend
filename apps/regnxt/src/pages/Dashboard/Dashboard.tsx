import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Database,
  FileCheck2,
  Files,
} from 'lucide-react';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

import {Alert, AlertDescription, AlertTitle} from '@rn/ui/components/ui/alert';
import {Badge} from '@rn/ui/components/ui/badge';
import {Button} from '@rn/ui/components/ui/button';

const reportingDeadlines = [
  {name: 'FINREP', date: '2024-01-31', status: 'upcoming'},
  {name: 'COREP', date: '2024-02-15', status: 'upcoming'},
  {name: 'AML Report', date: '2024-01-20', status: 'overdue'},
];

const submissionStats = [
  {month: 'Jan', submissions: 12},
  {month: 'Feb', submissions: 15},
  {month: 'Mar', submissions: 10},
  {month: 'Apr', submissions: 18},
  {month: 'May', submissions: 14},
];

const Dashboard = () => {
  return (
    <div className="container mx-auto space-y-8 p-6">
      {/* Welcome Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Here's an overview of your regulatory reporting status</p>
        </div>
        <Button className="bg-primary">
          <FileCheck2 className="mr-2 h-4 w-4" />
          New Report
        </Button>
      </div>

      {/* Priority Alerts */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Alert
          variant="destructive"
          className="border-red-600"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Overdue Reports</AlertTitle>
          <AlertDescription>3 reports are past their submission deadline</AlertDescription>
        </Alert>

        <Alert
          variant="destructive"
          className="border-yellow-600"
        >
          <Clock className="h-4 w-4" />
          <AlertTitle>Upcoming Deadlines</AlertTitle>
          <AlertDescription>5 reports due in the next 7 days</AlertDescription>
        </Alert>

        <Alert
          variant="default"
          className="border-green-600"
        >
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Validation Status</AlertTitle>
          <AlertDescription>All active reports passing validation</AlertDescription>
        </Alert>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <Files className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">145.2K</div>
            <p className="text-xs text-muted-foreground">+12.3% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Validation Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">+0.5% improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submission Rate</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.6%</div>
            <p className="text-xs text-muted-foreground">On-time submission rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Reporting Calendar & Activity */}
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Submission Trends</CardTitle>
            <CardDescription>Monthly report submissions over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <LineChart data={submissionStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="submissions"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Next 30 days reporting schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportingDeadlines.map((deadline, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{deadline.name}</p>
                    <p className="text-sm text-muted-foreground">{deadline.date}</p>
                  </div>
                  <Badge variant={deadline.status === 'overdue' ? 'destructive' : 'secondary'}>
                    {deadline.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <FileCheck2 className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">COREP Report Updated</p>
                  <p className="text-sm text-muted-foreground">Modified by John Doe</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">2 hours ago</p>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-green-500/10 p-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">FINREP Validation Complete</p>
                  <p className="text-sm text-muted-foreground">All checks passed</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">5 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

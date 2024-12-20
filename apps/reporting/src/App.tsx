import {lazy, useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';

import {Toaster} from '@/components/ui/toaster';

import {store} from './app/store';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import PrivateRoute from './components/PrivateRoute';
import {useAuth} from './contexts/AuthContext';
import DefaultLayout from './layout/DefaultLayout';

const SignIn = lazy(() => import('./pages/Authentication/SignIn'));
const SignUp = lazy(() => import('./pages/Authentication/SignUp'));

const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Overview = lazy(() => import('./pages/Overview/Overview'));
const ViewBalance = lazy(() => import('./pages/AccountingLayer/ViewBalance'));
const PostUnpost = lazy(() => import('./pages/AccountingLayer/PostUnpost'));
const AccountingConfig = lazy(() => import('./pages/AccountingLayer/AccountingConfig'));
const Messages = lazy(() => import('./pages/Messages/Messages'));
const Inspect = lazy(() => import('./pages/Inspect/Inspect'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const OverviewRegulatoryReports = lazy(
  () => import('./pages/OverviewRegulatoryReports/OverviewRegulatoryReports')
);
const Reconciliations = lazy(() => import('./pages/Reconciliations/Reconciliations'));
const AccountingLayer = lazy(() => import('./pages/AccountingLayer/ViewBalance'));
const TransactionLayer = lazy(() => import('./pages/TransactionLayer/TransactionLayer'));
const Entity = lazy(() => import('./pages/Configuration/Entity'));
const Template = lazy(() => import('./pages/Configuration/Template'));
const RegulatoryCalender = lazy(() => import('./pages/Configuration/RegulatoryCalender'));
const Validation = lazy(() => import('./pages/Configuration/Validation'));

const Connections = lazy(() => import('./pages/Orchestra/Connections'));
const Variables = lazy(() => import('./pages/Orchestra/Variables'));
const Datasets = lazy(() => import('./pages/Orchestra/Datasets'));
const Dataviews = lazy(() => import('./pages/Orchestra/Dataviews'));
const DataLoaders = lazy(() => import('./pages/Orchestra/DataLoaders'));
const Tasks = lazy(() => import('./pages/Orchestra/Tasks'));
const Workflows = lazy(() => import('./pages/Orchestra/Workflows'));
const Monitoring = lazy(() => import('./pages/Orchestra/Monitoring'));
const Data = lazy(() => import('./pages/Orchestra/Data/Data'));
const BusinessRules = lazy(() => import('./pages/Orchestra/BusinessRules/BusinessRules'));
const Processing = lazy(() => import('./pages/Orchestra/Processing/Processing'));

const ConfigureDataSetView = lazy(() => import('./pages/ConfigureDataSetView'));
const DataSetView = lazy(() => import('./pages/DataSetView'));
const Relationship = lazy(() => import('./pages/Relationship'));
const ConfigureDatasets = lazy(() => import('./components/configurations/ConfigureDatasets'));
const ConfigureGrouping = lazy(() => import('./components/configurations/ConfigureGrouping'));

// Route configuration object
const routeConfig = {
  auth: [
    {path: '/auth/signin', component: SignIn, layout: null},
    {path: '/auth/signup', component: SignUp, layout: null},
  ],
  reporting: [
    {path: '/', component: Dashboard, title: 'Reporting'},
    {path: '/reporting/overview', component: Overview, title: 'Reporting'},
    {path: '/reporting/view-balance', component: ViewBalance, title: 'Reporting'},
    {path: '/reporting/post-unpost', component: PostUnpost, title: 'Reporting'},
    {path: '/reporting/accounting-configuration', component: AccountingConfig, title: 'Reporting'},
    {path: '/reporting/messages', component: Messages, title: 'Reporting'},
    {path: '/reporting/inspect', component: Inspect, title: 'Reporting'},
    {path: '/reporting/profile', component: Profile, title: 'Reporting'},
    {path: '/reporting/reports-overview', component: OverviewRegulatoryReports, title: 'Reporting'},
    {path: '/reporting/reconciliations', component: Reconciliations, title: 'Reporting'},
    {path: '/reporting/accounting-layer', component: AccountingLayer, title: 'Reporting'},
    {path: '/reporting/transaction-layer', component: TransactionLayer, title: 'Reporting'},
    {path: '/reporting/entity', component: Entity, title: 'Reporting'},
    {path: '/reporting/template', component: Template, title: 'Reporting'},
    {path: '/reporting/regulatory-calender', component: RegulatoryCalender, title: 'Reporting'},
    {path: '/reporting/validation', component: Validation, title: 'Reporting'},
  ],
  orchestra: [
    {path: '/orchestra/connections', component: Connections, title: 'Orchestra'},
    {path: '/orchestra/variables', component: Variables, title: 'Orchestra'},
    {path: '/orchestra/datasets', component: Datasets, title: 'Orchestra'},
    {path: '/orchestra/dataviews', component: Dataviews, title: 'Orchestra'},
    {path: '/orchestra/data-loaders', component: DataLoaders, title: 'Orchestra'},
    {path: '/orchestra/tasks', component: Tasks, title: 'Orchestra'},
    {path: '/orchestra/workflows', component: Workflows, title: 'Orchestra'},
    {path: '/orchestra/monitoring', component: Monitoring, title: 'Orchestra'},
    {path: '/orchestra/data', component: Data, title: 'Orchestra'},
    {path: '/orchestra/business-rules', component: BusinessRules, title: 'Orchestra'},
    {path: '/orchestra/processing', component: Processing, title: 'Orchestra'},
  ],
  bird: [
    {path: '/bird/configuration', component: () => <ConfigureDataSetView />, title: 'Bird'},
    {path: '/bird/data', component: () => <DataSetView />, title: 'Bird'},
    {path: '/bird/relationships', component: () => <Relationship />, title: 'Bird'},
    {path: '/bird/configuration/dataset', component: () => <ConfigureDatasets />, title: 'Bird'},
    {path: '/bird/configuration/groups', component: () => <ConfigureGrouping />, title: 'Bird'},
  ],
};

// Helper component to wrap routes with layout and private route
const ProtectedRoute = ({component: Component, title}: {component: React.ComponentType; title: string}) => {
  const {user, loading, refreshUserSession} = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!user && !loading) {
      refreshUserSession();
    }
  }, [user, loading, refreshUserSession]);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/auth/signin"
        state={{from: location}}
        replace
      />
    );
  }

  return (
    <DefaultLayout>
      <PrivateRoute>
        <PageTitle title={`RegNxt | ${title}`} />
        <Component />
      </PrivateRoute>
    </DefaultLayout>
  );
};

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const {pathname} = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Provider store={store}>
      <Toaster />
      <Routes>
        {routeConfig.auth.map(({path, component: Component}) => (
          <Route
            key={path}
            path={path}
            element={<Component />}
          />
        ))}

        {[...routeConfig.reporting, ...routeConfig.orchestra, ...routeConfig.bird].map(
          ({path, component: Component, title}) => (
            <Route
              key={path}
              path={path}
              element={
                <ProtectedRoute
                  component={Component}
                  title={title}
                />
              }
            />
          )
        )}
      </Routes>
    </Provider>
  );
}

export default App;

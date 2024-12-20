import {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';

import {Toaster} from '@/components/ui/toaster';

import {store} from './app/store';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import PrivateRoute from './components/PrivateRoute';
import {ConfigureDatasets} from './components/configurations/ConfigureDatasets';
import {ConfigureGrouping} from './components/configurations/ConfigureGrouping';
import {useAuth} from './contexts/AuthContext';
import DefaultLayout from './layout/DefaultLayout';
import AccountingConfig from './pages/AccountingLayer/AccountingConfig';
import PostUnpost from './pages/AccountingLayer/PostUnpost';
import {default as AccountingLayer, default as ViewBalance} from './pages/AccountingLayer/ViewBalance';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Entity from './pages/Configuration/Entity';
import RegulatoryCalender from './pages/Configuration/RegulatoryCalender';
import Template from './pages/Configuration/Template';
import Validation from './pages/Configuration/Validation';
import ConfigureDataSetView from './pages/ConfigureDataSetView';
import Dashboard from './pages/Dashboard/Dashboard';
import DataSetView from './pages/DataSetView';
import Inspect from './pages/Inspect/Inspect';
import Messages from './pages/Messages/Messages';
import BusinessRules from './pages/Orchestra/BusinessRules/BusinessRules';
import Connections from './pages/Orchestra/Connections';
import Data from './pages/Orchestra/Data/Data';
import DataLoaders from './pages/Orchestra/DataLoaders';
import Datasets from './pages/Orchestra/Datasets';
import Dataviews from './pages/Orchestra/Dataviews';
import Monitoring from './pages/Orchestra/Monitoring';
import Processing from './pages/Orchestra/Processing/Processing';
import Tasks from './pages/Orchestra/Tasks';
import Variables from './pages/Orchestra/Variables';
import Workflows from './pages/Orchestra/Workflows';
import Overview from './pages/Overview/Overview';
import OverviewRegulatoryReports from './pages/OverviewRegulatoryReports/OverviewRegulatoryReports';
import Profile from './pages/Profile/Profile';
import Reconciliations from './pages/Reconciliations/Reconciliations';
import Relationship from './pages/Relationship';
import TransactionLayer from './pages/TransactionLayer/TransactionLayer';

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

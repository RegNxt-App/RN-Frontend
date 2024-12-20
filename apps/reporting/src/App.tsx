import {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import {Route, Routes, useLocation} from 'react-router-dom';

import {Toaster} from '@/components/ui/toaster';

import {store} from './app/store';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import PrivateRoute from './components/PrivateRoute';
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
import Dashboard from './pages/Dashboard/Dashboard';
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
import TransactionLayer from './pages/TransactionLayer/TransactionLayer';

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
        <Route
          path="/auth/signin"
          element={<SignIn />}
        />
        <Route
          path="/auth/signup"
          element={<SignUp />}
        />

        {/* RegNxt Orchestra Routes */}

        <Route
          path="/orchestra/connections"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Orchestra " />
                <Connections />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/variables"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Orchestra " />
                <Variables />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/datasets"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Orchestra " />
                <Datasets />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/dataviews"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Orchestra " />
                <Dataviews />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/data-loaders"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Orchestra " />
                <DataLoaders />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/tasks"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Orchestra " />
                <Tasks />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/workflows"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Orchestra " />
                <Workflows />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/monitoring"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Orchestra " />
                <Monitoring />
              </PrivateRoute>
            </DefaultLayout>
          }
        />

        {/* RegNxt Reporting Routes */}
        <Route
          index
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Dashboard />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/overview"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Overview />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/view-balance"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <ViewBalance />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/post-unpost"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <PostUnpost />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/accounting-configuration"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <AccountingConfig />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/messages"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Messages />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/inspect"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Inspect />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/profile"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Profile />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/reports-overview"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <OverviewRegulatoryReports />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/data"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Data />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/business-rules"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <BusinessRules />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/reconciliations"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Reconciliations />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/orchestra/processing"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Processing />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/accounting-layer"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <AccountingLayer />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/transaction-layer"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <TransactionLayer />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/entity"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Entity />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/template"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Template />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/regulatory-calender"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <RegulatoryCalender />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
        <Route
          path="/reporting/validation"
          element={
            <DefaultLayout>
              <PrivateRoute>
                <PageTitle title="RegNxt | Reporting" />
                <Validation />
              </PrivateRoute>
            </DefaultLayout>
          }
        />
      </Routes>
    </Provider>
  );
}

export default App;

import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Dashboard from './pages/Dashboard/Dashboard';
import DefaultLayout from './layout/DefaultLayout';
import Overview from './pages/Overview/Overview';
import Inspect from './pages/Inspect/Inspect';
import OverviewRegulatoryReports from './pages/OverviewRegulatoryReports/OverviewRegulatoryReports';
import Reconciliations from './pages/Reconciliations/Reconciliations';
import Data from './pages/Data/Data';
import BusinessRules from './pages/BusinessRules/BusinessRules';
import Processing from './pages/Processing/Processing';
import AccountingLayer from './pages/AccountingLayer/ViewBalance';
import TransactionLayer from './pages/TransactionLayer/TransactionLayer';
import Messages from './pages/Messages/Messages';
import Profile from './pages/Profile/Profile';
import Entity from './pages/Configuration/Entity';
import Template from './pages/Configuration/Template';
import RegulatoryCalender from './pages/Configuration/RegulatoryCalender';
import Validation from './pages/Configuration/Validation';
import PrivateRoute from './components/PrivateRoute';
import AccountingConfig from './pages/AccountingLayer/AccountingConfig';
import PostUnpost from './pages/AccountingLayer/PostUnpost';
import ViewBalance from './pages/AccountingLayer/ViewBalance';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

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
    <Routes>
      <Route path="/auth/signin" element={<SignIn />} />
      <Route path="/auth/signup" element={<SignUp />} />

      <Route
        index
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Dashboard />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/overview"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Overview />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/view-balance"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt View- Balance" />
              <ViewBalance />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/post-unpost"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt - Post Unpost" />
              <PostUnpost />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/accounting-configuration"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt - Accounting Config" />
              <AccountingConfig />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/messages"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Messages />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/inspect"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Inspect />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Profile />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/reports-overview"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <OverviewRegulatoryReports />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/data"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Data | RegNxt" />
              <Data />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/business-rules"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Business Rules | RegNxt" />
              <BusinessRules />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/reconciliations"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Reconciliations | RegNxt" />
              <Reconciliations />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/processing"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Processing | RegNxt" />
              <Processing />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/accounting-layer"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Accounting Layer | RegNxt" />
              <AccountingLayer />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/transaction-layer"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Transaction Layer | RegNxt" />
              <TransactionLayer />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/entity"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Entity | RegNxt" />
              <Entity />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/template"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Template | RegNxt" />
              <Template />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/regulatory-calender"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Regulatory Calender | RegNxt" />
              <RegulatoryCalender />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
      <Route
        path="/validation"
        element={
          <DefaultLayout>
            <PrivateRoute>
              <PageTitle title="Validation | RegNxt" />
              <Validation />
            </PrivateRoute>
          </DefaultLayout>
        }
      />
    </Routes>
  );
}

export default App;

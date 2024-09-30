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

  return loading ? (
    <Loader />
  ) : (
    <DefaultLayout>
      <Routes>
        <Route path="/auth/signin" element={<SignIn />} />
        <Route path="/auth/signup" element={<SignUp />} />
        <Route
          index
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/overview"
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Overview />
            </PrivateRoute>
          }
        />
        <Route
          path="/view-balance"
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt View- Balance" />
              <ViewBalance />
            </PrivateRoute>
          }
        />
        <Route
          path="/post-unpost"
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt - Post Unpost" />
              <PostUnpost />
            </PrivateRoute>
          }
        />
        <Route
          path="/accounting-configuration"
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt - Accounting Config" />
              <AccountingConfig />
            </PrivateRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Messages />
            </PrivateRoute>
          }
        />
        <Route
          path="/inspect"
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Inspect />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports-overview"
          element={
            <PrivateRoute>
              <PageTitle title="RegNxt" />
              <OverviewRegulatoryReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/data"
          element={
            <PrivateRoute>
              <PageTitle title="Data | RegNxt" />
              <Data />
            </PrivateRoute>
          }
        />
        <Route
          path="/business-rules"
          element={
            <PrivateRoute>
              <PageTitle title="Business Rules | RegNxt" />
              <BusinessRules />
            </PrivateRoute>
          }
        />
        <Route
          path="/reconciliations"
          element={
            <PrivateRoute>
              <PageTitle title="Reconciliations | RegNxt" />
              <Reconciliations />
            </PrivateRoute>
          }
        />
        <Route
          path="/processing"
          element={
            <PrivateRoute>
              <PageTitle title="Processing | RegNxt" />
              <Processing />
            </PrivateRoute>
          }
        />
        <Route
          path="/accounting-layer"
          element={
            <PrivateRoute>
              <PageTitle title="Accounting Layer | RegNxt" />
              <AccountingLayer />
            </PrivateRoute>
          }
        />
        <Route
          path="/transaction-layer"
          element={
            <PrivateRoute>
              <PageTitle title="Transaction Layer | RegNxt" />
              <TransactionLayer />
            </PrivateRoute>
          }
        />
        <Route
          path="/entity"
          element={
            <PrivateRoute>
              <PageTitle title="Entity | RegNxt" />
              <Entity />
            </PrivateRoute>
          }
        />
        <Route
          path="/template"
          element={
            <PrivateRoute>
              <PageTitle title="Template | RegNxt" />
              <Template />
            </PrivateRoute>
          }
        />
        <Route
          path="/regulatory-calender"
          element={
            <PrivateRoute>
              <PageTitle title="Regulatory Calender | RegNxt" />
              <RegulatoryCalender />
            </PrivateRoute>
          }
        />
        <Route
          path="/validation"
          element={
            <PrivateRoute>
              <PageTitle title="Validation | RegNxt" />
              <Validation />
            </PrivateRoute>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;

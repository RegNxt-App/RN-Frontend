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
import AccountingLayer from './pages/AccountingLayer/AccountingLayer';
import TransactionLayer from './pages/TransactionLayer/TransactionLayer';
import Configuration from './pages/Configuration/Configuration';
import Messages from './pages/Messages/Messages';
import Profile from './pages/Profile/Profile';

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
        <Route
          index
          element={
            <>
              <PageTitle title="RegNxt" />
              <Dashboard />
            </>
          }
        />
        <Route
          path="/overview"
          element={
            <>
              <PageTitle title="RegNxt" />
              <Overview />
            </>
          }
        />
        <Route
          path="/messages"
          element={
            <>
              <PageTitle title="RegNxt" />
              <Messages />
            </>
          }
        />
        <Route
          path="/inspect"
          element={
            <>
              <PageTitle title="RegNxt" />
              <Inspect />
            </>
          }
        />
        <Route
          path="/profile"
          element={
            <>
              <PageTitle title="RegNxt" />
              <Profile />
            </>
          }
        />
        <Route
          path="/reports-overview"
          element={
            <>
              <PageTitle title="RegNxt" />
              <OverviewRegulatoryReports />
            </>
          }
        />
        <Route
          path="/data"
          element={
            <>
              <PageTitle title="Data | RegNxt" />
              <Data />
            </>
          }
        />
        <Route
          path="/business-rules"
          element={
            <>
              <PageTitle title="Business Rules | RegNxt" />
              <BusinessRules />
            </>
          }
        />
        <Route
          path="/reconciliations"
          element={
            <>
              <PageTitle title="Reconciliations | RegNxt" />
              <Reconciliations />
            </>
          }
        />
        <Route
          path="/processing"
          element={
            <>
              <PageTitle title="Processing | RegNxt" />
              <Processing />
            </>
          }
        />
        <Route
          path="/accounting-layer"
          element={
            <>
              <PageTitle title="Accounting Layer | RegNxt" />
              <AccountingLayer />
            </>
          }
        />
        <Route
          path="/transaction-layer"
          element={
            <>
              <PageTitle title="Transaction Layer | RegNxt" />
              <TransactionLayer />
            </>
          }
        />
        <Route
          path="/configuration"
          element={
            <>
              <PageTitle title="Configuration | RegNxt" />
              <Configuration />
            </>
          }
        />
        <Route
          path="/auth/signin"
          element={
            <>
              <PageTitle title="Signin | RegNxt" />
              <SignIn />
            </>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <>
              <PageTitle title="Signup | RegNxt" />
              <SignUp />
            </>
          }
        />
      </Routes>
    </DefaultLayout>
  );
}

export default App;

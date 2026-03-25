import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout/AppLayout";

import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import UploadAnalyze from "@/pages/UploadAnalyze";
import ScanResult from "@/pages/ScanResult";
import Patients from "@/pages/Patients";
import PatientDetail from "@/pages/PatientDetail";
import DoctorReview from "@/pages/DoctorReview";
import Analytics from "@/pages/Analytics";
import Report from "@/pages/Report";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType, path: string }) {
  const { user } = useAuth();
  if (!user) {
    return <Login />;
  }
  return <Component />;
}

function MainRouter() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Standalone print route */}
      <Route path="/reports/:scanId">
        {user ? <Report /> : <Login />}
      </Route>

      <Route path="*">
        {user ? (
          <AppLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/upload" component={UploadAnalyze} />
              <Route path="/scans/:id" component={ScanResult} />
              <Route path="/patients" component={Patients} />
              <Route path="/patients/:id" component={PatientDetail} />
              <Route path="/review" component={DoctorReview} />
              <Route path="/analytics" component={Analytics} />
              <Route>
                <div className="flex h-full items-center justify-center">
                  <h1 className="text-2xl font-bold text-muted-foreground">404 - Not Found</h1>
                </div>
              </Route>
            </Switch>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <MainRouter />
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;

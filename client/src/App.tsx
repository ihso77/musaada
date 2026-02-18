import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import BookService from "./pages/BookService";
import CustomerDashboard from "./pages/CustomerDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReviewBooking from "./pages/ReviewBooking";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyEmail from "./pages/VerifyEmail";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/services" component={Services} />
      <Route path="/services/:id" component={ServiceDetails} />
      <Route path="/book/:providerId" component={BookService} />
      <Route path="/dashboard" component={CustomerDashboard} />
      <Route path="/review/:bookingId" component={ReviewBooking} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

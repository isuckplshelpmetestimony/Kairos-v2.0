import * as React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import Home from "./pages/home";
import NotFound from "./pages/not-found";
import { hasFullAccess } from './lib/authUtils';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [user, setUser] = React.useState({
    email: '',
    phone: '',
    role: 'free'
  });
  const [premiumUsers, setPremiumUsers] = React.useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);

  function showEventDetails(eventId: string) {
    alert('Show event details for event ID: ' + eventId);
  }

  function handlePremiumClick(eventId: string) {
    if (hasFullAccess(user.email, user.phone, premiumUsers)) {
      showEventDetails(eventId);
    } else {
      setShowPaymentModal(true);
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/" component={() => <Home user={user} premiumUsers={premiumUsers} setShowPaymentModal={setShowPaymentModal} showPaymentModal={showPaymentModal} />} />
          <Route component={NotFound} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

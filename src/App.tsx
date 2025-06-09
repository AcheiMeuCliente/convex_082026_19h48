import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { useState } from "react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { BusinessDashboard } from "./components/BusinessDashboard";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { DashboardNavigation } from "./components/DashboardNavigation";
import { Toaster } from "sonner";
import { AdminPanel } from "./components/AdminPanel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Chef</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const [currentView, setCurrentView] = useState<"business" | "analytics" | "admin">("analytics");

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <DashboardNavigation 
          currentView={currentView} 
          onViewChange={setCurrentView} 
        />
        {currentView === "analytics" ? <AnalyticsDashboard /> : null}
        {currentView === "business" ? <BusinessDashboard /> : null}
        {currentView === "admin" && loggedInUser?.isAdmin ? <AdminPanel /> : null}
        {currentView === "admin" && !loggedInUser?.isAdmin ? (
          <div className="text-red-600 font-bold">Acesso negado: apenas administradores.</div>
        ) : null}
        {loggedInUser?.isAdmin && (
          <button
            className="fixed bottom-8 right-8 px-4 py-2 bg-blue-700 text-white rounded shadow-lg z-50"
            onClick={() => setCurrentView(currentView === "admin" ? "analytics" : "admin")}
          >
            {currentView === "admin" ? "Voltar ao Dashboard" : "Painel Admin"}
          </button>
        )}
      </Authenticated>
      
      <Unauthenticated>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-primary mb-4">Brazilian Business Dashboard</h1>
              <p className="text-xl text-secondary">Sign in to access the business database</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

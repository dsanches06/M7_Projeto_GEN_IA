// Componente raiz da aplicação
// Configura os providers (React Query, Tema, Preferências),
// o router com as rotas da aplicação e o carregamento lazy de páginas
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./context/ThemeContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import Loader from "./components/ui/TrophySpin";

// Componente principal da aplicação - layout com barra lateral
import MainLayout from "./pages/MainLayout";
import Settings from "./pages/Settings";
import AddTransaction from "./pages/AddTransaction";

// Carregamento lazy das páginas mais pesadas para otimização de performance
const Dashboard = lazy(() => import("./pages/DashBoard"));
const History = lazy(() => import("./pages/History"));
const Statistics = lazy(() => import("./pages/Statistics"));

// Criar instância do QueryClient para gestão de cache e estados de dados
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <PreferencesProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route
                  index
                  element={
                    <Suspense fallback={<Loader />}>
                      <Dashboard />
                    </Suspense>
                  }
                />

                <Route path="adicionar" element={<AddTransaction />} />

                <Route
                  path="historico"
                  element={
                    <Suspense fallback={<Loader />}>
                      <History />
                    </Suspense>
                  }
                />

                <Route
                  path="estatisticas"
                  element={
                    <Suspense fallback={<Loader />}>
                      <Statistics />
                    </Suspense>
                  }
                />

                <Route path="definicoes" element={<Settings />} />
                <Route path="*" element={<p>NOT FOUND</p>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </PreferencesProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

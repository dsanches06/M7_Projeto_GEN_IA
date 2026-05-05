import { ThemeProvider } from "@/context/ThemeContext";

function App() {
  return (
    <div className="min-h-screen bg-[#090909]">
      <ThemeProvider>
        <h1 className="text-3xl text-blue-500">ClickUp</h1>
      </ThemeProvider>
    </div>
  );
}

export default App;

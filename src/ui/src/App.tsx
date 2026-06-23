

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-14 border-b border-gray-800 bg-gray-950 flex items-center px-4 shrink-0">
        <h1 className="font-semibold tracking-wide">Reqly</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto">
          {/* Sidebar */}
        </aside>
        <main className="flex-1 bg-gray-950 overflow-y-auto p-4">
          {/* Request Editor & Response Viewer */}
        </main>
      </div>
    </div>
  );
}

export default App;

import MainLayout from "../layouts/MainLayout";

export default function AIAssistant() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6">
        <h1 className="text-3xl font-bold text-slate-950 dark:text-white">AI Assistant</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-400">
          Use the floating chat button to access the mock shopping assistant from any page.
        </p>
      </div>
    </MainLayout>
  );
}

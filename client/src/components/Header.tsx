import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-slate-900">Kairos v2.0</span>
          </div>
          <div>
            <Button variant="ghost" className="text-slate-600 hover:text-slate-900 text-sm">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
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

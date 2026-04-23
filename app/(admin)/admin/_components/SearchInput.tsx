'use client'

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function SearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSearch(term: string) {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }

    startTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="relative flex-1 group">
      <Search
        className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
          isPending ? "text-cyan-500 animate-pulse" : "text-slate-400 group-focus-within:text-[#00ADEF]"
        }`}
        size={18}
      />
      <input
        type="text"
        placeholder="Search by name, email, or department..."
        defaultValue={searchParams.get('query')?.toString()}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full bg-white border border-slate-200 rounded-xl p-3.5 pl-11 text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500/10 focus:border-[#00ADEF] transition-all shadow-sm"
      />
    </div>
  );
}
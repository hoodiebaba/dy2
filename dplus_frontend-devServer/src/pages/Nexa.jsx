import React from "react";
import { Sparkles, Bot, MessageSquareText } from "lucide-react";

export default function NexaPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 p-4 sm:p-8">
      <div className="rounded-2xl border border-[#F26522]/20 bg-[#0B101E]/80 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F26522]/30 bg-[#F26522]/10 px-3 py-1 text-xs font-semibold text-[#F26522]">
              <Sparkles className="h-3.5 w-3.5" />
              Nexa AI
            </div>
            <h1 className="text-3xl font-bold tracking-wide text-white">
              AI assistant workspace
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              This route is wired for the dropdown and can be expanded later with chat,
              summaries, or workflow automation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-[#F26522]">
              <Bot className="h-6 w-6" />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-white">
              <MessageSquareText className="h-6 w-6 text-purple-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Suggested actions
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-300">
            <li className="rounded-xl border border-white/5 bg-[#0B101E]/70 px-4 py-3">
              Summarize active alerts for the day.
            </li>
            <li className="rounded-xl border border-white/5 bg-[#0B101E]/70 px-4 py-3">
              Draft a network incident report.
            </li>
            <li className="rounded-xl border border-white/5 bg-[#0B101E]/70 px-4 py-3">
              Generate a quick status brief for leadership.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Ready for integration
          </h2>
          <p className="mt-4 text-sm leading-6 text-gray-300">
            The dropdown is live. When you want to connect the actual AI workflow,
            this page can host the chat panel or automation controls without changing
            the header again.
          </p>
        </div>
      </div>
    </div>
  );
}

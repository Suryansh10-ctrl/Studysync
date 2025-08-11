"use client";

import { useState } from "react";

import { api } from "~/trpc/react";

export function LatestPost() {
  return (
    <>
      <div className="flex gap-4">
        <a
          href="/projects"
          className="rounded bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Go to Projects
        </a>
      </div>
    </>
  );
}

import * as React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_public")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="flex flex-col items-center mt-24">
        <div className="max-w-[400px] flex flex-col gap-2 w-full px-4">
          <Outlet />
        </div>
      </div>
    </>
  );
}

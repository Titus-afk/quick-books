import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/_public/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  return (
    <>
      <h3 className="text-2xl mb-8 text-center">Welcome To Accounting App</h3>
      <Button className="mb-1" onClick={() => navigate({ to: "/add_expenses" })}>
        Add Expenses
      </Button>
      <Button variant={"outline"} onClick={() => navigate({ to: "/view_expenses" })}>
        View All Expenses
      </Button>
    </>
  );
}

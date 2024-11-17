import { supabase } from "@/api";
import { Input } from "@/components/ui/input";
import { IconChevronLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/_authenticated/_public/view_expenses")({
  component: ViewExpenses,
});

function ViewExpenses() {
  const inputRef = useRef();
  const [expenses, setExpenses] = useState([]);
  const [searchedExpenses, setSearchedExpenses] = useState([]);

  const handleSearch = (query) => {
    if (query === "") {
      setSearchedExpenses(expenses);
    } else {
      setSearchedExpenses(
        expenses.filter((item) => String(item.vendor_name).includes(query.toLowerCase()) || String(item.purchase_type).includes(query.toLowerCase()))
      );
    }
  };

  useEffect(() => {
    const loadAllExpenses = async () => {
      let { data: expenses, error } = await supabase.from("expenses").select("*");
      const sortedExpenses = expenses?.sort((a, b) => new Date(b.dop) - new Date(a.dop));
      setExpenses(sortedExpenses);
      setSearchedExpenses(sortedExpenses);
    };
    loadAllExpenses();
  }, []);
  return (
    <>
      <div className="sticky top-0 bg-white pb-2">
        <Link to="/home" className="flex underline py-2">
          <IconChevronLeft /> Return to Home
        </Link>
        <h3 className="text-2xl font-bold">All Expenses</h3>
        <div className="mt-1">
          <Input ref={inputRef} placeholder="Search for expenses" onChange={(e) => handleSearch(e.currentTarget.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-4 mt-1">
        {searchedExpenses.map(({ vendor_name, type_purchase, dop, currency, amount, img_url }) => (
          <div className="flex justify-between border p-3 rounded">
            <div>
              <Link className="text-lg font-semibold underline" to={img_url} target="_blank">
                {vendor_name}
              </Link>
              <h4 className="text-gray-500">{type_purchase}</h4>
            </div>
            <div className="text-right">
              <h4 className="text-lg font-semibold">
                {currency} {amount}
              </h4>
              <h5 className="text-gray-500 text-sm">{dop}</h5>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

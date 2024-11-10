import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { IconCamera } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/api";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import moment from "moment";

export const Route = createFileRoute("/_authenticated/_public/add_expenses")({
  component: RouteComponent,
});

interface FormState {
  vendorName: string;
  currency: "CAD" | "INR" | "USD";
  amount: string;
  dop: string;
}

function RouteComponent() {
  const [age, setAge] = useState<string>("");
  const receiptFileUploadRef = React.useRef(null);
  const dateInputRef = React.useRef(null);
  const [receiptImageURL, setReceiptImageURL] = useState<string | ArrayBuffer | null>(null);
  const [allVendorNames, setAllVendorNames] = useState<any[] | null>([]);

  const [formState, setFormState] = useState<FormState>({
    vendorName: "",
    currency: "CAD",
    amount: 0,
    dop: moment().format("YYYY-MM-DD"),
  });
  console.log(new Date());
  console.log(new Date().toISOString());
  const { vendorName, amount, currency, dop } = formState;

  const handleDateClick = () => {
    dateInputRef.current.click();
  };

  const handleReceiptUpload = () => {
    receiptFileUploadRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImageURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionClick = (e) => {
    setAllVendorNames([]);
    setFormState({ ...formState, vendorName: e.target.innerHTML });
  };

  const handleAutoComplete = async (keyword: string) => {
    setFormState({ ...formState, vendorName: keyword });
    if (keyword === "") {
      setAllVendorNames([]);
    } else {
      const { data: vendors } = await supabase.from("Vendors").select("*").ilike("label", `%${keyword}%`);
      setAllVendorNames(vendors);
    }
  };

  return (
    <>
      <h3 className="mb-4 text-3xl font-semibold text-center">Add Expense</h3>
      <form className="w-full border p-3 rounded flex flex-col gap-4">
        {!receiptImageURL && (
          <div className="p-12 bg-gray-200 flex justify-center border border-dashed border-gray-700 rounded cursor-pointer" onClick={handleReceiptUpload}>
            <span className="flex flex-col items-center gap-1 text-gray-500 select-none text-center">
              <IconCamera />
              Upload Receipt
            </span>
            <input ref={receiptFileUploadRef} id="file-receipt" className="hidden" type="file" accept="image/*" capture onChange={(e) => handleFileUpload(e)} />
          </div>
        )}
        {receiptImageURL && (
          <div className="relative">
            <div className="absolute top-2 right-2">
              <Button size={"sm"} variant={"destructive"} className="p-2 h-[30px] shadow" onClick={() => setReceiptImageURL("")}>
                Remove
              </Button>
            </div>
            <div className="max-h-[200px] overflow-auto border rounded">
              <img className="rounded" src={receiptImageURL} alt="" />
            </div>
          </div>
        )}

        <div className="flex flex-col w-full max-w-sm  gap-2 relative">
          <Label htmlFor="email">Vendor Name</Label>
          <Input type="email" id="email" value={formState.vendorName} placeholder="" onChange={(e) => handleAutoComplete(e.currentTarget.value)} />
          {allVendorNames?.length > 0 && (
            <div className="absolute w-full left-0 top-full shadow-lg border bg-gray-100 rounded z-10 rounded-t-none -mt-1">
              {allVendorNames?.map((vendor) => (
                <div key={vendor.label} className="text-sm hover:bg-slate-50 p-2 cursor-pointer" onClick={(e) => handleOptionClick(e)}>
                  {vendor.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col w-full max-w-sm gap-2">
          <Label htmlFor="email">Cost of Purchase</Label>
          <div className="flex gap-3">
            <Select onValueChange={(value: FormState["currency"]) => setFormState({ ...formState, currency: value })}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="CAD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAD">CAD</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="INR">INR</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" id="cost" placeholder="" onChange={(e) => setFormState({ ...formState, amount: Number(e.currentTarget.value).toFixed(2) })} />
          </div>
        </div>
        <div className="flex flex-col w-full max-w-sm  gap-2" onClick={handleDateClick}>
          <Label htmlFor="date">Date of purchase</Label>
          <Input ref={dateInputRef} type="date" id="date" placeholder="" value={formState.dop} onChange={(e) => setFormState({ ...formState, dop: e.currentTarget.value })} />
        </div>
        <Button size={"lg"} className="mt-2">
          Submit Expense
        </Button>
        <span>
          {formState.vendorName}, {formState.currency} , {formState.amount}, {formState.dop}
        </span>
      </form>
    </>
  );
}

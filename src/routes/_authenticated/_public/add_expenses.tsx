import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { IconArrowRight, IconCamera, IconChevronLeft, IconFidgetSpinner } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/api";
import moment from "moment";
import { File } from "buffer";
import { v4 as uuidv4 } from "uuid";
import Resizer from "react-image-file-resizer";

export const Route = createFileRoute("/_authenticated/_public/add_expenses")({
  component: RouteComponent,
});

interface FormState {
  vendorName: string;
  currency: "CAD" | "INR" | "USD";
  amount: string | number;
  type: string;
  dop: string;
  receiptImage: File | null;
}

const convertSizeToMB = (size) => {
  return Math.round(size / 1024) > 1000 ? `${Math.round(size / (1024 * 1024))} MB` : `${Math.round(size / 1024)} KB`;
};

function RouteComponent() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const receiptFileUploadRef = React.useRef(null);
  const dateInputRef = React.useRef(null);
  const [receiptImageURL, setReceiptImageURL] = useState<string | ArrayBuffer | null>(null);
  const [allVendorNames, setAllVendorNames] = useState<any[] | null>([]);
  const [allTypeNames, setAllTypeNames] = useState<any[] | null>([]);
  const [pageError, setPageError] = useState<string>("");
  const [fileSize, setFileSize] = useState({ uploadSize: 0, compressedSize: 0 });
  const defaultFormState: FormState = {
    vendorName: "",
    currency: "CAD",
    amount: 0,
    type: "",
    dop: moment().format("YYYY-MM-DD"),
    receiptImage: null,
  };

  const navigate = useNavigate();

  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const { vendorName, amount, currency, dop, type, receiptImage } = formState;

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
      setLoading(true);
      // Image compression
      Resizer.imageFileResizer(
        file,
        1200,
        1200,
        "JPEG",
        85,
        0,
        (uri) => {
          setLoading(false);
          setFileSize({ uploadSize: convertSizeToMB(file.size), compressedSize: convertSizeToMB(uri.size) });
          setFormState({ ...formState, receiptImage: uri });
          reader.readAsDataURL(uri);
        },
        "file"
      );
    }
  };

  const handleVendorOptionClick = (e) => {
    setAllVendorNames([]);
    setFormState({ ...formState, vendorName: e.target.innerHTML });
  };

  const handleTypeOptionClick = (e) => {
    setAllTypeNames([]);
    setFormState({ ...formState, type: e.target.innerHTML });
  };

  const handleVendorAutoComplete = async (keyword: string) => {
    setFormState({ ...formState, vendorName: keyword.toLowerCase() });
    if (keyword === "") {
      setAllVendorNames([]);
    } else {
      const { data: vendors } = await supabase.from("Vendors").select("*").ilike("label", `%${keyword}%`);
      setAllVendorNames(vendors);
    }
  };

  const handleTypeAutoComplete = async (keyword: string) => {
    setFormState({ ...formState, type: keyword.toLowerCase() });
    if (keyword === "") {
      setAllTypeNames([]);
    } else {
      const { data: types } = await supabase.from("purchase_type").select("*").ilike("label", `%${keyword}%`);
      setAllTypeNames(types);
    }
  };

  const handleSubmitExpenses = async (e) => {
    let imageURL: any = "";
    try {
      e.preventDefault();
      if (formState.vendorName === "" || formState.amount === 0 || formState.type === "") {
        setPageError("Please enter the missing fields");
        return;
      }
      setLoading(true);
      if (receiptImage) {
        const fileName = uuidv4();
        const { data: image } = await supabase.storage.from("receipts").upload("/images/" + fileName, receiptImage);
        const { data: imageURLServer } = supabase.storage.from("receipts").getPublicUrl(image.path);
        imageURL = imageURLServer;
      }
      // Upserting Vendor and types
      await supabase.from("Vendors").upsert({ label: vendorName.trim() }).select();
      await supabase.from("purchase_type").upsert({ label: type.trim() }).select();

      const { data, error } = await supabase
        .from("expenses")
        .insert([{ vendor_name: vendorName, type_purchase: type, dop: dop, currency: currency, amount: amount, img_url: imageURL.publicUrl }])
        .select();
      alert("Expense created Successfully");
      setLoading(false);
      navigate({ to: "/home" });
    } catch (error) {
      setPageError(error.message);
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed top-0 left-0 bg-white w-svw flex justify-center text-center h-dvh z-20 items-center flex-col gap-4">
          <IconFidgetSpinner className="animate-spin" />
          <span>
            Uploading <br />
            Please Wait....
          </span>
        </div>
      )}
      {pageError && <p className="text-red-600 p-2 bg-red-100 rounded">Submission Failed : {pageError}</p>}
      <Link to="/home" className="flex underline mb-1 py-2">
        <IconChevronLeft /> Return to Home
      </Link>

      <form className="w-full border p-3 rounded flex flex-col gap-4">
        {!receiptImageURL && (
          <div
            className="p-12 bg-gray-200 flex justify-center border border-dashed border-gray-700 rounded cursor-pointer"
            onClick={handleReceiptUpload}
          >
            <span className="flex flex-col items-center gap-1 text-gray-500 select-none text-center">
              <IconCamera />
              Upload Receipt
            </span>
            <input
              ref={receiptFileUploadRef}
              id="file-receipt"
              className="hidden"
              type="file"
              accept="image/*"
              capture
              onChange={(e) => handleFileUpload(e)}
            />
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
            <span className="text-sm mt-2 flex items-center">
              <span className="text-sm rounded">{fileSize.uploadSize}</span>
              <IconArrowRight size={18} /> <span className="bg-gray-200 text-sm rounded px-1">{fileSize.compressedSize}</span>
            </span>
          </div>
        )}

        <div className="flex flex-col w-full max-w-sm  gap-2 relative">
          <Label htmlFor="vendor">Vendor Name</Label>
          <Input
            type="text"
            id="vendor"
            autoComplete="off"
            value={formState.vendorName}
            placeholder=""
            onChange={(e) => handleVendorAutoComplete(e.currentTarget.value.toLowerCase())}
          />
          {allVendorNames && allVendorNames?.length > 0 && (
            <div className="absolute w-full left-0 top-full shadow-lg border bg-gray-100 rounded z-10 rounded-t-none -mt-1">
              {allVendorNames?.map((vendor) => (
                <div key={vendor.label} className="text-sm hover:bg-slate-50 p-2 cursor-pointer" onClick={(e) => handleVendorOptionClick(e)}>
                  {vendor.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col w-full max-w-sm  gap-2 relative">
          <Label htmlFor="type">What is the Purchase</Label>
          <Input
            type="text"
            id="type"
            autoComplete="off"
            value={formState.type}
            placeholder=""
            onChange={(e) => handleTypeAutoComplete(e.currentTarget.value)}
          />
          {allTypeNames && allTypeNames?.length > 0 && (
            <div className="absolute w-full left-0 top-full shadow-lg border bg-gray-100 rounded z-10 rounded-t-none -mt-1">
              {allTypeNames?.map((type) => (
                <div key={type.label} className="text-sm hover:bg-slate-50 p-2 cursor-pointer" onClick={(e) => handleTypeOptionClick(e)}>
                  {type.label}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col w-full max-w-sm gap-2">
          <Label htmlFor="cost">Cost of Purchase</Label>
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
            <Input
              type="number"
              id="cost"
              placeholder=""
              onChange={(e) => setFormState({ ...formState, amount: Number(e.currentTarget.value).toFixed(2) })}
            />
          </div>
        </div>
        <div className="flex flex-col w-full max-w-sm  gap-2" onClick={handleDateClick}>
          <Label htmlFor="date">Date of purchase</Label>
          <Input
            ref={dateInputRef}
            type="date"
            id="date"
            placeholder=""
            value={formState.dop}
            className="w-full"
            onChange={(e) => setFormState({ ...formState, dop: e.currentTarget.value })}
          />
        </div>
        {!isLoading && (
          <Button size={"lg"} className="mt-2" onClick={(e) => handleSubmitExpenses(e)}>
            Submit Expense
          </Button>
        )}
      </form>
    </>
  );
}

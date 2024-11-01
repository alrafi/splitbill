"use client";
import { useState } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa6";
import ChipSelect from "@/components/ChipSelect";
import { Avatar, Chip } from "@mui/material";
import { MdOutlineCancel } from "react-icons/md";

export interface Participant {
  label: string;
  value: string;
  paid: number;
  avatar?: string;
}

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  selectedItems: Participant[];
  isTax: boolean;
}

interface Result {
  bill: number;
  avatar: string;
  paid: number;
}

type Overpayer = {
  name: string;
  amount: number;
  avatar: string;
};

type Underpayer = {
  name: string;
  amount: number;
  avatar: string;
};

type Whom = {
  name: string;
  avatar: string;
};

type Payment = {
  from: Whom;
  to: Whom;
  amount: number;
};

const Home = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [name, setName] = useState("");
  const [billName, setBillName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [tax, setTax] = useState<number>(0);
  const [resultPayment, setResultPayment] = useState<Record<string, Result>>(
    {}
  );
  const [payWhom, setPayWhom] = useState<Payment[]>([
    {
      from: {
        name: "iqbal",
        avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=iqbal",
      },
      amount: 7000,
      to: {
        name: "irsal",
        avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=irsal",
      },
    },
    {
      from: {
        name: "iqbal",
        avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=iqbal",
      },
      amount: 7000,
      to: {
        name: "irsal",
        avatar: "https://api.dicebear.com/9.x/bottts/svg?seed=irsal",
      },
    },
  ]);

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (name === "") return;
    const newParticipant = {
      label: name,
      value: name,
      paid: 0,
      avatar: `https://api.dicebear.com/9.x/bottts/svg?seed=${name}`,
    };
    setParticipants([...participants, newParticipant]);
    console.log(newParticipant);
    setName("");
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === "name") {
      newItems[index].name = value;
    } else if (field === "quantity") {
      newItems[index].quantity = value;
    } else if (field === "price") {
      newItems[index].price = Number(value);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: items.length,
        name: "",
        price: 0,
        quantity: 1,
        selectedItems: [],
        isTax: true,
      },
    ]);
  };

  const addAdditional = () => {
    setItems([
      ...items,
      {
        id: items.length,
        name: "",
        price: 0,
        quantity: 1,
        selectedItems: [],
        isTax: false,
      },
    ]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const subtotalNoAdditional = items
    .filter((item) => item.isTax)
    .reduce((acc, item) => acc + item.price, 0);

  const totalNoAdditional = subtotalNoAdditional + tax;

  const subtotalAdditional = items
    .filter((item) => !item.isTax)
    .reduce((acc, item) => acc + item.price, 0);
  const total = totalNoAdditional + subtotalAdditional;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ date, time, items });
  };

  const handleSelectedOptionsChange = (
    index: number,
    selectedOptions: Participant[]
  ) => {
    const newItems = [...items];
    newItems[index].selectedItems = selectedOptions; // Update selected items
    setItems(newItems);
  };

  const handlePaidChange = (index: number, value: string) => {
    // reset selected items
    const updatedItems = items.map((item) => ({
      ...item,
      selectedItems: [], // Reset selectedItems to an empty array
    }));

    // Update state with the new items array
    setItems(updatedItems);

    // Convert value to a number
    const newPaidValue = Number(value);

    // Update the state
    setParticipants((prevParticipants) => {
      const updatedParticipants = [...prevParticipants];
      updatedParticipants[index].paid = isNaN(newPaidValue) ? 0 : newPaidValue; // Set to 0 if NaN
      return updatedParticipants;
    });
  };

  // Calculate how much each participant owes based on the items they consumed
  const calculateOwes = (
    participants: Participant[]
  ): Record<string, Result> => {
    const participantOwes: Record<string, Result> = {};

    // Initialize owes values for all participants
    participants.forEach((p) => {
      participantOwes[p.label] = {
        bill: 0,
        avatar: p.avatar || "",
        paid: p.paid,
      };
    });

    // Distribute the cost of each item among the consumers
    items.forEach((item) => {
      let _tax = 1.0;
      if (item.isTax) {
        // console.log("TAX", tax), console.log("totalnoadd", totalNoAdditional);
        _tax = tax / subtotalNoAdditional + 1; // changeable
        console.log("taxx", _tax);
      }

      const costPerPerson = (item.price * _tax) / item.selectedItems.length;
      item.selectedItems.forEach(({ label }) => {
        participantOwes[label].bill += costPerPerson;
      });
    });

    return participantOwes;
  };

  // Determine who is an overpayer or underpayer
  const calculatePayments = (
    participants: Participant[],
    participantOwes: Record<string, Result>
  ): Payment[] => {
    const overpayers: Overpayer[] = [];
    const underpayers: Underpayer[] = [];

    // Separate overpayers and underpayers
    participants.forEach((p) => {
      const owes = participantOwes[p.label].bill;
      const balance = p.paid - owes;
      console.log("balance", balance);

      if (balance > 0) {
        overpayers.push({
          name: p.label,
          amount: balance,
          avatar: p.avatar || "",
        });
      } else if (balance < 0) {
        underpayers.push({
          name: p.label,
          amount: Math.abs(balance),
          avatar: p.avatar || "",
        });
      }
    });
    console.log("over", overpayers);
    console.log("under", underpayers);

    const payments: Payment[] = [];

    // Match and settle payments between overpayers and underpayers
    while (overpayers.length > 0 && underpayers.length > 0) {
      let overpayer = overpayers[0];
      let underpayer = underpayers[0];

      const amountToTransfer = Math.min(overpayer.amount, underpayer.amount);

      // Log the payment
      payments.push({
        from: {
          name: underpayer.name,
          avatar: underpayer.avatar,
        },
        to: {
          name: overpayer.name,
          avatar: overpayer.avatar,
        },
        amount: amountToTransfer,
      });

      // Update the balances
      overpayer.amount -= amountToTransfer;
      underpayer.amount -= amountToTransfer;

      // Remove anyone who is settled
      if (overpayer.amount === 0) overpayers.shift();
      if (underpayer.amount === 0) underpayers.shift();
    }

    return payments;
  };

  const submit = () => {
    console.log("participant", participants);
    console.log("items", items);
    const result = calculateOwes(participants);
    setResultPayment(result);
    const payments = calculatePayments(participants, result);
    setPayWhom(payments);
    console.log("res", result);
    console.log("payment", payments);
    setActiveStep(activeStep + 1);
  };

  const handleBackCalculate = () => {
    setActiveStep(activeStep - 1);
  };

  const removeParticipant = (index: number) => {
    setParticipants((prevParticipants) =>
      prevParticipants.filter((_, idx) => idx !== index)
    );
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    const _date = new Date(dateString);
    return _date.toLocaleDateString("id-ID", options).replace(",", ""); // Format the date
  };

  const formatRupiah = (amount: number): string => {
    // Convert the amount to a string
    const amountString = amount.toString();

    // Split into whole and decimal parts
    const [wholePart, decimalPart] = amountString.split(".");

    // Format whole part with thousands separator
    const formattedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Adds "." as thousand separator

    // Combine whole and decimal parts
    let formattedAmount = `Rp${formattedWholePart}`;

    // If there's a decimal part, format it and append
    if (decimalPart) {
      // Ensure to use comma as a decimal separator
      formattedAmount += `,${decimalPart}`;
    }

    return formattedAmount;
  };

  return (
    <section className="bg-[#f7f6f9] relative max-container padding-container flex-center flex-col">
      {/* Step 0 */}
      {activeStep === 0 && (
        <div className="w-full">
          <p className="text-xl mb-8">Who's join the split?</p>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {participants.map((item, idx) => (
              <div className="flex-center flex-col" key={item.label}>
                <MdOutlineCancel
                  className="self-end cursor-pointer"
                  onClick={() => removeParticipant(idx)}
                />
                <div className="bg-slate-200 rounded-full w-20 h-20 flex-center">
                  <img
                    src={item.avatar}
                    alt={item.label}
                    className="w-14 h-14"
                  />
                </div>
                <p className="">{item.label}</p>
              </div>
            ))}
          </div>
          <form>
            <div className="sm:col-span-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Add new participant
              </label>
              <div className="mt-2 flex space-x-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className="block w-1/2 rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <button
                  onClick={handleAdd}
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Add
                </button>
              </div>
            </div>
          </form>
          <div className="flex w-full justify-end mt-12">
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className={`flex-center ${
                participants.length <= 0
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              disabled={participants.length <= 0}
            >
              Next
              <FaArrowRight className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 1 */}
      {activeStep === 1 && (
        <div className="w-full">
          <p className="text-xl mb-8">Input your Bill</p>

          <form onSubmit={handleSubmit}>
            <div className="flex-center">
              <input
                type="text"
                value={billName}
                onChange={(e) => setBillName(e.target.value)}
                className="border border-[#e0e0e0] px-6 py-1 rounded-md text-center w-50"
                placeholder="Your bill's name"
              />
            </div>
            <div className="text-center my-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-gray-300 rounded-md px-2 py-1 text-center w-40"
              />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border-gray-300 rounded-md px-2 py-1 text-center w-32 ml-2"
              />
            </div>

            <p className="text-lg">Main item</p>
            <p className="text-sm text-lightgray italic mb-2">
              Item that included in tax eg. food, drinks, etc
            </p>
            {items
              .filter((item) => item.isTax)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start justify-between mb-4 border-b border-[#e1e1e1] pb-2"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex w-1/2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", +e.target.value)
                        }
                        className="border-gray-300 rounded-md px-2 py-1 w-14 mr-2"
                      />
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(item.id, "name", e.target.value)
                        }
                        className="border-gray-300 rounded-md px-2 py-1 w-32 mr-2"
                        placeholder="Item name"
                      />
                    </div>
                    <div className="flex items-center justify-end w-1/2">
                      <span>Rp</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(item.id, "price", e.target.value)
                        }
                        className="border-gray-300 rounded-md px-2 py-1 w-[100px]"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-red-500"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={`@Rp${
                      Number.isInteger(item.price / item.quantity)
                        ? (item.price / item.quantity).toString()
                        : (item.price / item.quantity).toFixed(2)
                    }`}
                    disabled
                    className="border-gray-300 rounded-md px-2 py-1 w-1/3 mt-1 bg-[#f1f1f1]"
                  />
                </div>
              ))}

            <button
              type="button"
              onClick={addItem}
              className="text-blue-500 flex items-center mb-4"
            >
              <span className="mr-2">+</span> Add Item
            </button>

            {/* Additional */}
            <p className="text-lg">Additional</p>
            <p className="text-sm text-lightgray italic">
              Item that not included in tax eg. Ride, Tip, etc
            </p>
            {items
              .filter((item) => !item.isTax)
              .map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start justify-between mb-4 border-b border-[#e1e1e1] pb-2"
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(item.id, "quantity", +e.target.value)
                        }
                        className="border-gray-300 rounded-md px-2 py-1 w-12 mr-2"
                      />
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          handleItemChange(item.id, "name", e.target.value)
                        }
                        className="border-gray-300 rounded-md px-2 py-1 w-40 mr-2"
                        placeholder="Item name"
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <span>Rp</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(item.id, "price", e.target.value)
                        }
                        className="border-gray-300 rounded-md px-2 py-1 w-2/3"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-2 text-red-500"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={`@Rp${
                      Number.isInteger(item.price / item.quantity)
                        ? (item.price / item.quantity).toString()
                        : (item.price / item.quantity).toFixed(2)
                    }`}
                    disabled
                    className="border-gray-300 rounded-md px-2 py-1 w-1/3 text-lightgray mt-1 bg-[#f1f1f1]"
                  />
                </div>
              ))}

            <button
              type="button"
              onClick={addAdditional}
              className="text-blue-500 flex items-center mb-4"
            >
              <span className="mr-2">+</span> Add Additional
            </button>

            <div className="border-y py-4 border-[#e1e1e1] w-full">
              <p className="mb-1">Deposit</p>
              <p className="text-sm text-lightgray italic">
                Who pay first the bill
              </p>
              <div className="mt-3">
                {participants.map((item, idx) => (
                  <div className="mb-2 flex items-center" key={item.label}>
                    <Chip
                      label={item.label}
                      avatar={<Avatar alt="Natacha" src={item?.avatar} />}
                    />
                    <span className="text-lightgray ml-2">Rp</span>
                    <input
                      type="number"
                      value={item.paid}
                      className=" border-gray-300 rounded-md px-2 py-1 w-[120px] bg-[#f1f1f1]"
                      onChange={(e) => handlePaidChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span>Subtotal</span>
                <div className="flex justify-end items-center">
                  <span>Rp</span>
                  <input
                    type="number"
                    value={subtotalNoAdditional.toFixed(2)}
                    className="border-gray-300 rounded-md px-2 py-1 w-[120px] cursor-not-allowed bg-[#f1f1f1]"
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Tax</span>
                <div className="flex justify-end items-center">
                  <span>Rp</span>
                  <input
                    type="number"
                    value={tax}
                    onChange={(e) => setTax(Number(e.target.value))}
                    className="border-gray-300 rounded-md px-2 py-1 w-[120px]"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Total Bill</span>
                <div className="flex justify-end items-center">
                  <span>Rp</span>
                  <input
                    type="number"
                    value={totalNoAdditional.toFixed(2)}
                    className="border-gray-300 rounded-md px-2 py-1 w-[120px] cursor-not-allowed bg-[#f1f1f1]"
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span>Additional</span>
                <div className="flex justify-end items-center">
                  <span>Rp</span>
                  <input
                    type="number"
                    value={subtotalAdditional.toFixed(2)}
                    className="border-gray-300 rounded-md px-2 py-1 w-[120px] cursor-not-allowed bg-[#f1f1f1]"
                    disabled
                  />
                </div>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>
                  GRAND TOTAL{" "}
                  <span className="text-lightgray font-light">
                    (Bill + Additional)
                  </span>
                </span>
                <div className="flex justify-end items-center">
                  <span>Rp</span>
                  <input
                    type="number"
                    value={total.toFixed(2)}
                    className="border-gray-300 rounded-md px-2 py-1 w-[120px] cursor-not-allowed bg-[#f1f1f1]"
                    disabled
                  />
                </div>
              </div>
            </div>
          </form>

          <div className="flex w-full justify-between mt-12">
            <div
              onClick={() => setActiveStep(activeStep - 1)}
              className="flex-center cursor-pointer"
            >
              <FaArrowLeft className="mr-1" />
              Back
            </div>
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className={`flex-center ${
                !date || !time || !billName
                  ? "cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              disabled={!date || !time || !billName}
            >
              Next
              <FaArrowRight className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {activeStep === 2 && (
        <div className="w-full flex-center flex-col">
          <p className="">{billName}</p>
          <div className="flex-center mt-2 space-x-4 mb-8">
            <p className="text-lightgray text-sm">{formatDate(date)}</p>
            <p className="text-lightgray text-sm">|</p>
            <p className="text-lightgray text-sm">{time}</p>
          </div>
          <div className="w-full">
            {items.map((item) => (
              <div
                className="w-full border-b border-[#e1e1e1] pb-4 mb-6"
                key={item.id}
              >
                <div className="flex-between">
                  <div className="flex space-x-4">
                    <p className="">{item.quantity}x</p>
                    <p className="">{item.name}</p>
                  </div>
                  <p className="">{formatRupiah(item.price)}</p>
                </div>
                <p className="text-lightgray text-sm">
                  (@{formatRupiah(item.price / item.quantity)})
                </p>
                <div className="py-4">
                  <ChipSelect
                    availableOptions={participants}
                    selectedOptions={item.selectedItems} // Pass current selected options
                    onSelectionChange={(selectedOptions) =>
                      handleSelectedOptionsChange(item.id, selectedOptions)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 w-full">
            <div className="flex justify-between items-center mb-2">
              <span>Subtotal</span>
              <div className="flex justify-end items-center">
                <span>{formatRupiah(subtotalNoAdditional)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Tax</span>
              <div className="flex justify-end items-center">
                <span>{formatRupiah(tax)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Total Bill</span>
              <div className="flex justify-end items-center">
                <span>{formatRupiah(totalNoAdditional)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span>Additional</span>
              <div className="flex justify-end items-center">
                <span>{formatRupiah(subtotalAdditional)}</span>
              </div>
            </div>
            <div className="flex justify-between items-center font-bold">
              <span>
                GRAND TOTAL{" "}
                <span className="text-lightgray font-light">
                  (Bill + Additional)
                </span>
              </span>
              <div className="flex justify-end items-center">
                <span>{formatRupiah(total)}</span>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="w-full mt-4 bg-blue-500 text-white py-2 rounded-md"
            onClick={submit}
          >
            Calculate
          </button>
          <div className="flex w-full justify-between mt-12">
            <div
              onClick={handleBackCalculate}
              className="flex-center cursor-pointer"
            >
              <FaArrowLeft className="mr-1" />
              Back
            </div>
            {/* <div
              onClick={() => setActiveStep(activeStep + 1)}
              className="flex-center cursor-pointer"
            >
              Next
              <FaArrowRight className="ml-1" />
            </div> */}
          </div>
        </div>
      )}

      {/* Step 3 */}
      {activeStep === 3 && (
        <div className="w-full flex-center flex-col">
          <p className="">{billName}</p>
          <div className="flex-center mt-2 space-x-4 mb-8">
            <p className="text-lightgray text-sm">{formatDate(date)}</p>
            <p className="text-lightgray text-sm">|</p>
            <p className="text-lightgray text-sm">{time}</p>
          </div>
          <div className="w-full">
            {Object.entries(resultPayment).map((item) => (
              <div className="flex justify-between items-center border-b border-[#e1e1e1] mb-4 pb-2">
                <div className="flex items-center">
                  <div className="bg-slate-200 rounded-full w-10 h-10 flex-center">
                    <img
                      src={item[1].avatar}
                      alt={item[0]}
                      className="w-8 h-8"
                    />
                  </div>
                  <p className="ml-2">{item[0]}</p>
                </div>
                <p>{formatRupiah(item[1].bill)}</p>
              </div>
            ))}
          </div>
          <div className="w-full mt-4">
            <p className="">Who pays whom</p>
            <div className="mt-2">
              {payWhom.map((item) => (
                <div className="flex items-center border-b border-[#e1e1ee1] pb-2 mb-4">
                  <Chip
                    label={item.from.name}
                    avatar={
                      <Avatar alt={item.from.name} src={item.from.avatar} />
                    }
                  />
                  <span className="mx-2 text-sm text-lightgray">
                    pay{" "}
                    <span className="text-lg text-black">
                      {formatRupiah(item.amount)}
                    </span>{" "}
                    to
                  </span>
                  <Chip
                    label={item.to.name}
                    avatar={<Avatar alt={item.to.name} src={item.to.avatar} />}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex w-full justify-between mt-12">
            <div
              onClick={handleBackCalculate}
              className="flex-center cursor-pointer"
            >
              <FaArrowLeft className="mr-1" />
              Back
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Home;

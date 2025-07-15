"use client";
import React, { useEffect, useState } from "react";
import { getClosedPnL } from "@/services/portfolio";
import { toFixedDown } from "../helper/roundOf";
import { useRouter } from "next/navigation";
import { isEmpty } from "@/lib/isEmpty";
import { capitalize } from "@/lib/stringCase";
import { HistoryIcon, Loader } from "lucide-react";
import { getUserTradeHistory } from "@/services/user";
import { Dialog } from "radix-ui";
import {
  Cross2Icon,
  CopyIcon,
} from "@radix-ui/react-icons";
import { momentFormat } from "../helper/date";

const History = () => {
  const [ClosedPnL, setClosedPnL] = useState({});
  const [tradeHistory, setTradeHistory] = useState([])
  const [tradeOpen, setTradeOpen] = useState(false)
  const [selectedMarketOutcome, setSelectedMarketOutcome] = useState([])
  const [loading, setLoading] = useState(false)


  const formatClosedPnL = (data) => {
    const groupedByEvent = {};

    for (const item of data) {
      const event = item.marketId.eventId;
      const eventId = event._id;
      const marketId = item.marketId._id;
      const groupItemTitle = item.marketId.groupItemTitle;
      const outcome = item.marketId.outcome

      if (!groupedByEvent[eventId]) {
        groupedByEvent[eventId] = {
          eventInfo: event,
          markets: {},
        };
      }

      const marketGroup = groupedByEvent[eventId].markets;

      if (!marketGroup[marketId]) {
        marketGroup[marketId] = {
          entry: 0,
          exit: 0,
          pnl: 0,
          groupItemTitle: groupItemTitle,
          outcome: outcome
        };
        if (event.status === "resolved") {
          const isBinaryMarket = event?.marketId?.length >= 2;
          if (isBinaryMarket) {
            marketGroup[marketId].resolution =
              event?.outcomeId == marketId ? "yes" : "no";
          } else {
            const matchingOutcome = item?.marketId?.outcome?.findIndex(
              (o) => o._id == event?.outcomeId
            );
            marketGroup[marketId].resolution = matchingOutcome == 0 ? "yes" : "no";
          }
        }        
      }
      marketGroup[marketId].entry += (item.entryPrice * item.qty) / 100;
      marketGroup[marketId].exit += (item.exitPrice * item.qty) / 100;
      marketGroup[marketId].pnl += item.pnl / 100;
      
      if(item.exitType == "resolution"){
        marketGroup[marketId].shares = item.qty
        marketGroup[marketId].closedSide = item.direction == "closed_yes" ? "yes" : "no"
        marketGroup[marketId].isResolved = marketGroup[marketId].resolution == marketGroup[marketId].closedSide;
        // if(marketGroup[marketId].isResolved){
        //   marketGroup[marketId].exit += (item.exitPrice * item.qty) / 100;
        // }
        // marketGroup[marketId].entry += (item.entryPrice * item.qty) / 100;
        // marketGroup[marketId].pnl += item.pnl / 100;
      } else {
        // marketGroup[marketId].entry += (item.entryPrice * item.qty) / 100;
        // marketGroup[marketId].exit += (item.exitPrice * item.qty) / 100;
        // marketGroup[marketId].pnl += item.pnl / 100;
      }
    }

    return groupedByEvent;
  };

  const getUserClosedPnL = async () => {
    try {
      setLoading(true)
      const res = await getClosedPnL({});
      if (res.success) {
        if (res && res.result && res.result.length > 0) {
          const fClosedPnl = formatClosedPnL(res.result);
          setClosedPnL(fClosedPnl);
        }
      }
    } catch (error) {
      console.error("Error fetching Position History:", error);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    getUserClosedPnL();
  }, []);

  const getTradeHistory = async (id) => {
    try {
      const res = await getUserTradeHistory({ id })
      if (res.success) {
        setTradeHistory(res.result)
      } else {
        setTradeHistory([])
      }
    } catch (error) {
      console.error("Error fetching Trade History:", error);
    }
  }

  const handleTradeOpen = async (id, outcomes) => {
    setSelectedMarketOutcome(outcomes)
    await getTradeHistory(id)
    setTradeOpen(true)
  }
  return (
    <>
      {/* <div className="flex space-x-4 mb-3">
        <SearchBar placeholder="Search" />
        <DatePicker
          placeholderText="Select date"
          selectsRange={true}
          startDate={startDate}
          endDate={endDate}
          onChange={(update) => {
            setDateRange(update);
          }}
          className="custom_datepicker"
        />
        <select className="border border-[#262626] bg-black rounded p-1 text-sm">
          <option>All</option>
          <option>All Trades</option>
          <option>Buy</option>
          <option>Sell</option>
          <option>Reward</option>
        </select>
        <select className="border bg-[#131212] border-[#262626] bg-black rounded p-1 text-sm">
          <option>Newest</option>
          <option>Oldest</option>
          <option>Value</option>
          <option>Shares</option>
        </select>
      </div> */}
      <div className="overflow-x-auto">
        <table className="w-full text-left custom_table table table-responsive">
          <thead>
            <tr>
              <th>Market</th>
              <th>Final Position</th>
              <th>Settlement Payout</th>
              <th>Total Cost</th>
              <th>Total Payout</th>
              <th>Total Return</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!isEmpty(ClosedPnL) && !loading && Object.entries(ClosedPnL).map(
              ([eventId, event]) => {
                const markets = event?.markets;
                const marketIds = Object.keys(markets);
                const isMultiMarket = marketIds.length > 1;

                let total = { entry: 0, exit: 0, pnl: 0 };

                return (
                  <React.Fragment key={eventId}>
                    <tr>
                      <td colSpan={8}>
                        <div className="flex items-center space-x-2 cursor-pointer">
                          <span className="text-2xl">
                            <img
                              src={event?.eventInfo?.image}
                              alt="Icon"
                              width={42}
                              height={42}
                            />
                          </span>
                          <span className="text-sm font-normal">
                            {event?.eventInfo?.title}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {marketIds.map((marketId, idx) => {
                      const m = markets[marketId];

                      total.entry += m.entry;
                      total.exit += m.exit;
                      total.pnl += m.pnl;

                      return (
                        <tr key={marketId}>
                          <td>{ m.groupItemTitle || ""}</td>
                          <td className={`${m.shares > 0 ? "" : "text-gray-500"}`}>{m.shares > 0 ? `${m.shares} ${capitalize(m.closedSide == "yes" ? (m.outcome?.[0]?.title || "yes") : (m.outcome?.[1]?.title || "no"))}` : "None"}</td>
                          <td className={`${(m.resolution && m.isResolved) ? "text-green-500" : (!m.isResolved && m.resolution) ? "text-red-500" :"text-gray-500"}`}>${m.isResolved ? m.shares : "0"   }</td>
                          <td>${toFixedDown(m.entry, 2)}</td>
                          <td>${toFixedDown(m.exit, 2)}</td>
                          <td
                            className={
                              m.pnl >= 0 ? "text-green-500" : "text-red-500"
                            }
                          >
                            ${toFixedDown(m.pnl, 2)}{" "}({toFixedDown((m.pnl/m.entry)*100, 0)}%)
                          </td>
                          <td>
                            <button className="text-blue-500" onClick={()=>handleTradeOpen(marketId, m.outcome)}>
                              <HistoryIcon />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {isMultiMarket && (
                      <tr className="font-bold">
                        <td>Total</td>
                        <td></td>
                        <td></td>
                        <td>${toFixedDown(total.entry, 2)}</td>
                        <td>${toFixedDown(total.exit, 2)}</td>
                        <td
                          className={
                            total.pnl >= 0 ? "text-green-700" : "text-red-700"
                          }
                        >
                          ${toFixedDown(total.pnl, 2)}
                        </td>
                        <td></td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }
            )}
          </tbody>
        </table>
        {Object.entries(ClosedPnL)?.length === 0 && !loading && (
            <div  className="flex justify-center my-5 text-gray-500">
                No history found
            </div>
        )}
        {loading && (
            <div className="flex justify-center items-center my-5 min-h-[100px]">
                <Loader className="w-26 h-26 animate-spin" />
            </div>
        )}
      </div>
      <Dialog.Root open={tradeOpen} onOpenChange={setTradeOpen}>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent w-100" style={{ maxWidth: '900px' }}>
          <Dialog.Title className="DialogTitle">Trade History</Dialog.Title>
          <div >
            <table className="w-full text-left custom_table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Price</th>
                  <th>Filled Contracts</th>
                  <th>Cost</th>
                  <th>Fees</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {tradeHistory?.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textTransform: "capitalize" }} className={`${item.side === 'yes' ? 'text-green-500' : 'text-red-500'} text-capitalize`}>{capitalize(item.action)} {item.side == "yes" ? (selectedMarketOutcome?.[0]?.title || "yes") : (selectedMarketOutcome?.[1]?.title || "no") } ({item.type} at {item.price}¢)</td>
                    <td>{item.price}¢</td>
                    <td>{toFixedDown(item.quantity, 2)}</td>
                    <td>${toFixedDown((item.price * item.quantity) / 100, 2)}</td>
                    <td>${item?.fee ?? 0}</td>
                    <td>{momentFormat(item.createdAt, "DD/MM/YYYY HH:mm")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Dialog.Close asChild>
            <button className="modal_close_brn" aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default History;

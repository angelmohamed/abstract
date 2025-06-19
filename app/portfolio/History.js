"use client";
import React, { useEffect, useState } from "react";
import { getClosedPnL } from "@/services/portfolio";
import { toFixedDown } from "../helper/roundOf";
import { useRouter } from "next/navigation";
import { isEmpty } from "@/lib/isEmpty";

const History = () => {
  const [ClosedPnL, setClosedPnL] = useState({});

  const formatClosedPnL = (data) => {
    const groupedByEvent = {};

    for (const item of data) {
      const event = item.marketId.eventId;
      const eventId = event._id;
      const marketId = item.marketId._id;
      const groupItemTitle = item.marketId.groupItemTitle;

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
        };
      }

      marketGroup[marketId].entry += (item.entryPrice * item.qty) / 100;
      marketGroup[marketId].exit += (item.exitPrice * item.qty) / 100;
      marketGroup[marketId].pnl += item.pnl / 100;
    }

    return groupedByEvent;
  };

  const getUserClosedPnL = async () => {
    try {
      const res = await getClosedPnL({});
      if (res.success) {
        if (res && res.result && res.result.length > 0) {
          const fClosedPnl = formatClosedPnL(res.result);
          setClosedPnL(fClosedPnl);
        }
      }
    } catch (error) {
      console.error("Error fetching Position History:", error);
    }
  };

  useEffect(() => {
    getUserClosedPnL();
  }, []);
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
            </tr>
          </thead>
          <tbody>
            {!isEmpty(ClosedPnL) && Object.entries(ClosedPnL).map(
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
                          <td className="text-gray-500">None</td>
                          <td className="text-gray-500">$0</td>
                          <td>${toFixedDown(m.entry, 2)}</td>
                          <td>${toFixedDown(m.exit, 2)}</td>
                          <td
                            className={
                              m.pnl >= 0 ? "text-green-500" : "text-red-500"
                            }
                          >
                            ${toFixedDown(m.pnl, 2)}{" "}({toFixedDown((m.pnl/m.entry)*100, 0)}%)
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
                      </tr>
                    )}
                  </React.Fragment>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default History;

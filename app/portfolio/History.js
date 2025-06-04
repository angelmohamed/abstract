'use client';
import React, { useEffect, useState } from 'react'
import SearchBar from '../components/ui/SearchBar';
import DatePicker from 'react-datepicker';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '../components/ui/badge';
import { IconWindowMaximize } from '@tabler/icons-react';
import { getClosedPnL } from '@/services/portfolio';
import {momentFormat} from '@/app/helper/date'
import { toFixedDown } from '../helper/roundOf';
import { truncateString } from '../helper/string';
import { useRouter } from 'next/navigation';

const History = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const router = useRouter()
  const [ClosedPnL, setClosedPnL] = useState([])
  
  const getUserClosedPnL = async () => {
      try {
          const res = await getClosedPnL({})
          if(res.success){
              setClosedPnL(res.result)
          }
      } catch (error) {
          console.error("Error fetching Position History:", error);
      }
  }
  
  useEffect(() => {
      getUserClosedPnL()
  }, [])
  return (
    <>
      <div className="flex space-x-4 mb-3">
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
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left custom_table table table-responsive">
                      <thead>
                        <tr>
                          {/* <th>Type</th> */}
                          <th>Market</th>
                          {/* <th>Outcome</th> */}
                          <th>Price</th>
                          <th>Closed Price</th>
                          <th>Shares</th>
                          <th>Values</th>
                          <th>Cost</th>
                          <th>Date</th>
                          <th>Closed Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ClosedPnL?.map((item,index)=>{
                          return(
                          <tr key={index}>
                            {/* <td>Sell</td> */}
                            <td>
                              <div className="flex items-center space-x-2 cursor-pointer" onClick={()=>router.push(`/event-page/${item?.marketId?.eventId?.slug}`)}>
                                <span className="text-2xl">
                                  <Image
                                    src={item?.marketId?.eventId?.image}
                                    alt="Icon"
                                    width={42}
                                    height={42}
                                  />
                                </span>
                                <div className="text-sm font-normal">
                                  {truncateString(item?.marketId?.eventId?.title,25)}
                                </div>
                              </div>
                            </td>
                            {/* <td>Yes</td> */}
                            <td>{item.entryPrice}</td>
                            <td>{item.exitPrice}</td>
                            <td>{item.qty}</td>
                            <td className={item.pnl>0 ? 'text-green-500' : item.pnl<0 ? 'text-red-500' : ''}>{item.pnl}</td>
                            <td>${toFixedDown((item.entryPrice * item.qty)/100,2)}</td>
                            <td>{momentFormat(item.openAt, "DD-MM-YYYY HH:mm")}</td>
                            <td>{momentFormat(item.closedAt, "DD-MM-YYYY HH:mm")}</td>
                            {/* <td>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-normal">1 day ago</span>
                                <a href="#" target="_blank">
                                  <IconWindowMaximize className="h-[32px] w-[32px]" />
                                </a>
                              </div>
                            </td> */}
                          </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
    </>
  )
}

export default History

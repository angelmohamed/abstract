import React, { useEffect, useState } from 'react'
import SearchBar from '../components/ui/SearchBar'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Dialog, Separator } from 'radix-ui'
import {
  Cross2Icon,
  CopyIcon,
} from "@radix-ui/react-icons";
import { getPositionHistory } from '@/services/portfolio'
import { toFixedDown } from '../helper/roundOf'
import {capitalize} from '../helper/string'

const Positions = () => {
  const [positionHistory, setPositionHistory] = useState([])

const getUserPositionHistory = async () => {
    try {
        const res = await getPositionHistory({})
        if(res.success){
            setPositionHistory(res.result)
        }
    } catch (error) {
        console.error("Error fetching Position History:", error);
    }
}

useEffect(() => {
    getUserPositionHistory()
}, [])

  return (
    <>
        <div className="flex space-x-4 mb-3">
            <SearchBar placeholder="Search" />
            <select className="border bg-[#131212] border-[#262626] bg-black rounded p-1 text-sm">
                <option>Current value</option>
                <option>Initial value</option>
                <option>Return ($)</option>
                <option>Return %</option>
            </select>
            <select className="border border-[#262626] bg-black rounded p-1 text-sm">
                <option>All</option>
                <option>Live</option>
                <option>Ended</option>
            </select>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left custom_table">
                <thead>
                <tr>
                    <th>Market</th>
                    <th>Latest</th>
                    <th>Bet</th>
                    <th>Current</th>
                    <th>To Win</th>
                    {/* <th>Action</th> */}
                </tr>
                </thead>
                <tbody>
                {
                    positionHistory?.map((item, index) => (
                        <>
                            <tr>
                                
                               <td colSpan={8}>{item.eventTitle}</td> 
                            </tr>
                            {item.positions?.map((data,index) => (
                                <tr key={index}>
                                    <td>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-2xl">
                                        {/* <Image
                                            src={item.eventImage}
                                            alt="Icon"
                                            width={42}
                                            height={42}
                                        /> */}
                                        {/* {item.eventImage} */}
                                         <Image
                                              //  priority={true}
                                                src={item.eventImage}
                                                alt="Icon"
                                                width={42}
                                                height={42}
                                                className="mb-2"
                                              />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                        <Link className="text-sm font-normal" href="/">
                                            <Badge className="z-10 text-xs text-[#27ae60] bg-[#1f3e2c] font-normal">
                                            {capitalize(data.side)}
                                            </Badge> {data.marketGroupTitle}
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            {/* <Badge className="z-10 text-xs text-[#27ae60] bg-[#1f3e2c] font-normal">
                                            {data.side}
                                            </Badge> */}
                                            <span className="text-xs font-normal">
                                            {data?.quantity} Shares
                                            </span>
                                        </div>
                                        </div>
                                    </div>
                                    </td>
                                    <td>${toFixedDown(data?.filled?.[0]?.price,1)}</td>
                                    <td>${toFixedDown((data?.filled?.[0]?.price * data?.quantity)/100,2)}</td>
                                    <td>
                                    $1.93 <span className="text-red-500">(-3.22%)</span>
                                    </td>
                                    <td>${data?.quantity?.toFixed(2)}</td>
                                    {/* <td>
                                    <div className="flex items-center space-x-2">
                                        <Dialog.Root>
                                      <Dialog.Trigger asChild>
                                        <Button className="bg-[#e64800] text-[#fff] hover:text-[#000] w-[80px]">
                                          Sell
                                        </Button>
                                      </Dialog.Trigger>
                                    
                                    </Dialog.Root>
            
                                    <Dialog.Root>
                                      <Dialog.Trigger asChild>
                                        <Button className="w-[80px]">Share</Button>
                                      </Dialog.Trigger>
                                      <Dialog.Portal>
                                        <Dialog.Overlay className="DialogOverlay" />
                                        <Dialog.Content className="DialogContent">
                                          <Dialog.Title className="DialogTitle">
                                            Shill Your Bag
                                          </Dialog.Title>
                                          <div className="bg-[#0e1c14] p-4 rounded-lg mt-4 w-full">
                                            <div className="flex gap-3 mb-4 items-center">
                                              <Image
                                                src={item.eventImage}
                                                alt="Icon"
                                                width={60}
                                                height={21}
                                                className="mb-2"
                                              />
                                              <h4 className="font-semibold">
                                                {item.eventTitle}
                                              </h4>
                                            </div>
                                            <div className="flex items-center justify-between mb-4">
                                              
                                              <Badge className="z-10 text-[16px] text-[#27ae60] bg-[#1f3e2c] font-normal rounded">
                                                56x Chennai Super Kings
                                              </Badge>
                                              <span>Avg {toFixedDown(data.filled?.[0]?.price,1)}¢</span>
                                            </div>
            
                                            <Separator.Root
                                              className="SeparatorRoot"
                                              style={{ margin: "20px 0 15px" }}
                                            />
            
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <h5 className="text-gray-400">Trade</h5>
                                                <p className="text-[#fff] mb-0 font-medium">
                                                  ${toFixedDown((data?.filled?.[0]?.price * data?.quantity)/100,2)}
                                                </p>
                                              </div>
                                              <div>
                                                <h5 className="text-gray-400">To win</h5>
                                                <p className="text-[#27ae60] mb-0 font-semibold">
                                                  ${data.quantity?.toFixed(2)}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex justify-between items-center mt-4 gap-3">
                                            <Button className="w-full bg-[transparent] border border-[#2d2d2d] text-[#fff] hover:text-[#000]">
                                              <CopyIcon className="h-4 w-4" />
                                              <span>Copy Image</span>
                                            </Button>
                                            <Button className="w-full">Share</Button>
                                          </div>
                                          <Dialog.Close asChild>
                                            <button
                                              className="modal_close_brn"
                                              aria-label="Close"
                                            >
                                              <Cross2Icon />
                                            </button>
                                          </Dialog.Close>
                                        </Dialog.Content>
                                      </Dialog.Portal>
                                    </Dialog.Root>
                                    </div>
                                    </td> */}
                                </tr>
                        ))}
                    </>
                    ))
                }
                </tbody>
            </table>
            
        </div>
    </>
  )
}

export default Positions

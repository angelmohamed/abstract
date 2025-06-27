import React, { useContext, useEffect, useState } from 'react'
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
import { useRouter } from 'next/navigation'
import { getUserTradeHistory } from '@/services/user'
import { HistoryIcon, ShareIcon, X } from 'lucide-react'
import { momentFormat } from '../helper/date'
import { TabsList, TabsTrigger } from '@radix-ui/react-tabs'
import { SocketContext } from '@/config/socketConnectivity'
import { isEmpty } from '@/lib/isEmpty'
import { positionClaim } from '@/services/market'
import { toastAlert } from '@/lib/toast'

const Positions = () => {
  const [positionHistory, setPositionHistory] = useState([])
  const [tradeHistory, setTradeHistory] = useState([])
  const [tradeOpen, setTradeOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareData, setShareData] = useState({})
  const [selectedMarketData, setSelectedMarketData] = useState({})
  const router = useRouter()
  const socketContext = useContext(SocketContext)

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

  const getTradeHistory = async (id) => {
    try {
      const res = await getUserTradeHistory({id})
      if(res.success){
        setTradeHistory(res.result)
      }else{
        setTradeHistory([])
      }
    } catch (error) {
      console.error("Error fetching Trade History:", error);
    }
  }

  const handleTradeOpen = async(id) => {
    await getTradeHistory(id)
    setTradeOpen(true)
  }

  const handleShareOpen = async(data) => {
    setShareData(data)
    setSelectedMarketData(data.positions[0])
    setShareOpen(true)
  }

  useEffect(() => {
    let socket = socketContext?.socket
    if (!socket) return
    const handlePositions = (result) => {
      const resData = JSON.parse(result)
      // console.log("resData of pos-update", resData);
      // getUserPositionHistory()
      // event data - id image title slug
      // market id - grouptitle last bid
      // position data - side quantity filled price



      setPositionHistory(prev => {
        const eventIndex = prev.findIndex(event => event._id === resData.eventId)
        if(eventIndex == -1){
          const newEvent = {
            _id: resData.eventId,
            eventTitle: resData.eventTitle,
            eventImage: resData.eventImage,
            eventSlug: resData.eventSlug,
            positions: [{
              _id: resData._id,
              // userId: resData.userId,
              marketId: resData.marketId,
              marketGroupTitle: resData.marketGroupTitle,
              outcomes: resData.marketOutcomes,
              // createdAt: "$createdAt",
              side: resData.side,
              filled: resData.filled,
              quantity: resData.quantity,
              last: resData.marketLast,
            }]
          }
          return [newEvent, ...prev]
        }else{
          const positionData = prev[eventIndex].positions.find(position => position._id === resData._id);
          if(isEmpty(positionData)){
            const newPosition = {
              _id: resData._id,
              marketId: resData.marketId,
              marketGroupTitle: resData.marketGroupTitle,
              outcomes: resData.marketOutcomes,
              side: resData.side,
              filled: resData.filled,
              quantity: resData.quantity,
              last: resData.marketLast,
            }
            const updatedEvent = {
              ...prev[eventIndex],
              positions: [...prev[eventIndex].positions, newPosition]
            }
            return [...prev.slice(0, eventIndex), updatedEvent, ...prev.slice(eventIndex + 1)]
          } else{
            // let positionIndex = prev[eventIndex].positions.findIndex(position => position._id === resData._id)
            if (resData.quantity === 0) {
              const filteredPositions = prev[eventIndex].positions.filter(p => p._id !== resData._id);
              if (filteredPositions.length === 0) {
                return [...prev.slice(0, eventIndex), ...prev.slice(eventIndex + 1)];
              } else {
                const updatedEvent = {
                  ...prev[eventIndex],
                  positions: filteredPositions
                };
                return [...prev.slice(0, eventIndex), updatedEvent, ...prev.slice(eventIndex + 1)];
              }
            }

            const updatedPosition = {
              ...positionData,
              quantity: resData.quantity,
              last: resData.marketLast,
              filled: resData.filled,
              price: resData.price,
              last: resData.marketLast,
              side: resData.side,
            }
            const updatedEvent = {
              ...prev[eventIndex],
              positions: [...prev[eventIndex].positions.filter(position => position._id !== resData._id), updatedPosition]
            }
            return [...prev.slice(0, eventIndex), updatedEvent, ...prev.slice(eventIndex + 1)]
            // positionData.quantity = resData.quantity
            // positionData.last = resData.marketLast
            // positionData.side = resData.side
            // positionData.filled = resData.filled
            // return prev
          }
        }
      })
    }
    socket.on("pos-update", handlePositions)
    return () => {
      socket.off("pos-update", handlePositions)
    }
  }, [socketContext])

  const marketPositionClaim = async(id) =>{
    try {
      const {success,message} = await positionClaim(id)
      if(success){
        toastAlert("success", message,"position")
      } else {
        toastAlert("error", message,"positionErr");
      }
    } catch (error) {
      console.log('error',error)
    }
  }

  return (
    <>
        {/* <div className="flex space-x-4 mb-3">
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
        </div> */}
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
                    <th>History</th>
                </tr>
                </thead>
                <tbody>
                {
                    positionHistory?.map((item, index) => (
                      <React.Fragment key={item._id}>
                            <tr>
                              <td colSpan={6}>
                                <div className="flex items-center justify-between">
                                  <Link href={`/event-page/${item?.eventSlug}`} className="cursor-pointer">{item.eventTitle}</Link>
                                  <div>
                                  <button className="text-blue-500" onClick={() => handleShareOpen(item)}>
                                    <ShareIcon />
                                  </button>
                                  
                                  </div>
                                </div>
                              </td>
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
                                         <img
                                              //  priority={true}
                                                src={item.eventImage}
                                                alt="Icon"
                                                width={42}
                                                height={42}
                                                className="mb-2 cursor-pointer"
                                                onClick={()=>router.push(`/event-page/${item?.eventSlug}`)}
                                              />
                                        </span>
                                        <div className="flex flex-col gap-1">
                                        <Link className="text-sm font-normal" href={`/event-page/${item?.eventSlug}`}>
                                            <Badge className="z-10 text-xs text-[#27ae60] bg-[#1f3e2c] font-normal">
                                            {capitalize(data.side)}
                                            </Badge> {data.marketGroupTitle}
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            {/* <Badge className="z-10 text-xs text-[#27ae60] bg-[#1f3e2c] font-normal">
                                            {data.side}
                                            </Badge> */}
                                            <span className="text-xs font-normal">
                                            {data?.quantity?.toFixed(2)} Shares
                                            </span>
                                        </div>
                                        </div>
                                    </div>
                                    </td>
                                    <td>{toFixedDown(data?.filled?.[0]?.price,1)}¢</td>
                                    <td>{toFixedDown((data?.filled?.[0]?.price * data?.quantity)/100,2)}¢</td>
                                    <td>
                                    {data.side == "no" ? (100 - data?.last) : data?.last }¢ <span className={(data.side == "no" ? (100 - data?.last) : data?.last) > data?.filled?.[0]?.price ? "text-green-500" : "text-red-500"}>({((((data.side == "no" ? (100 - data?.last) : data?.last) || data.filled?.[0]?.price) - data.filled?.[0]?.price)/data?.filled?.[0]?.price * 100).toFixed(2)}%)</span>
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
                                    <td className='flex justify-start items-center gap-2'>                                     
                                      <button className="text-blue-500" onClick={()=>handleTradeOpen(data.marketId)}>
                                        <HistoryIcon />
                                      </button>
                                      {data.claim && (
                                        <Button size="sm" className="bg-[#37ce37] text-[#fff] hover:text-[#000]" onClick={()=>marketPositionClaim(data.marketId)}>
                                          Claim
                                        </Button>
                                      )}
                                    </td>
                                </tr>
                        ))}
                      </React.Fragment>
                    ))
                }
                </tbody>
            </table>
            {positionHistory.length === 0 && (
                <div  className="flex justify-center my-5 text-gray-500">
                    No positions found
                </div>
            )}
            
        </div>
        <Dialog.Root open={tradeOpen} onOpenChange={setTradeOpen}>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent w-100" style={{maxWidth: '900px'}}>
          <Dialog.Title className="DialogTitle">Trade History</Dialog.Title>
            <div >
              <table className="w-full text-left custom_table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Price</th>
                    <th>Filled Contracts</th>
                    <th>Cost</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tradeHistory?.map((item, index) => (
                    <tr key={index}>
                      <td style={{textTransform:"capitalize"}} className={`${item.side === 'yes' ? 'text-green-500' : 'text-red-500'} text-capitalize`}>{capitalize(item.action)} {item.side} ({item.type} at {item.price}¢)</td>
                      <td>{item.price}¢</td>
                      <td>{toFixedDown(item.quantity,2)}</td>
                      <td>${toFixedDown((item.price * item.quantity)/100,2)}</td>
                      <td>{momentFormat(item.createdAt,"DD/MM/YYYY HH:mm")}</td>
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
        <Dialog.Root open={shareOpen} onOpenChange={setShareOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="DialogOverlay" />
            <Dialog.Content className="DialogContent">
              <Dialog.Title className="DialogTitle">
                Shill Your Bag
              </Dialog.Title>
              {shareData?.positions?.length > 1 ? (
                <div className='flex gap-2 overflow-x-scroll mt-4'>
                  {shareData?.positions?.map((item, index) => (
                    <Button variant={selectedMarketData?._id === item?._id ? "default" : "outline"} key={index} onClick={()=>setSelectedMarketData(item)}>{item.marketGroupTitle}</Button>
                  ))}
                </div>
                ) : null
              }
              <div className="bg-[#0e1c14] p-4 rounded-lg mt-4 w-full">
                
                
                <div className="flex gap-3 mb-4 items-center">
                  <img
                    src={shareData?.eventImage}
                    alt="Icon"
                    width={60}
                    height={21}
                    className="mb-2"
                  />
                  <h4 className="font-semibold">
                    {shareData?.eventTitle}
                  </h4>
                </div>
                <div className="flex items-center justify-between mb-4">
                  
                  <Badge className="z-10 text-[16px] text-[#27ae60] bg-[#1f3e2c] font-normal rounded">
                    {/* 56x Chennai Super Kings */}
                    {capitalize(selectedMarketData?.side)}  {selectedMarketData?.marketGroupTitle}
                  </Badge>
                  <span>Avg {toFixedDown(selectedMarketData?.filled?.[0]?.price,1)}¢</span>
                </div>
                <Separator.Root
                  className="SeparatorRoot"
                  style={{ margin: "20px 0 15px" }}
                />
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-gray-400">Trade</h5>
                    <p className="text-[#fff] mb-0 font-medium">
                      ${toFixedDown((selectedMarketData?.filled?.[0]?.price * selectedMarketData?.quantity)/100,2)}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-gray-400">To win</h5>
                    <p className="text-[#27ae60] mb-0 font-semibold">
                      ${selectedMarketData?.quantity?.toFixed(2)}
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
    </>
  )
}

export default Positions

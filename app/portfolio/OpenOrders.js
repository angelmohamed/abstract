import React, { useContext, useEffect, useState } from 'react'
import SearchBar from '../components/ui/SearchBar'
import { getOpenOrders } from '@/services/portfolio'
import { cancelOrder } from '@/services/market'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toastAlert } from '@/lib/toast'
import { momentFormat } from '../helper/date'
import { SocketContext } from '@/config/socketConnectivity'
import store from "@/store/index";
import { toFixedDown } from '@/lib/roundOf'

const OpenOrders = () => {
     const [openOrders, setOpenOrders] = useState([])
     const route = useRouter()
     const socketContext = useContext(SocketContext)
     const { user } = store.getState().auth;
    
    const getUserOpenOrders = async () => {
        try {
            const res = await getOpenOrders({})
            if(res.success){
                setOpenOrders(res.result)
            }
        } catch (error) {
            console.error("Error fetching Position History:", error);
        }
    }
    
    useEffect(() => {
        getUserOpenOrders()
    }, [])

    const handleCancelOrder = async(orderId) => {
        console.log("orderId", orderId);
        try {
            const { success, message } = await cancelOrder(orderId)
            if(success) {
                toastAlert("success", message, "order")
            } else {
                toastAlert("error", message, "orderCancel")
            }
        } catch {
        }
    }

    useEffect(() => {
        let socket = socketContext?.socket
        if (!socket) return
        const handleOrders = (result) => {
            const resData = JSON.parse(result)
            console.log("resData of order-update", resData);
            setOpenOrders(prev => {
                const findMarket = prev.find(market => market.eventId === resData.marketId.eventId._id)
                if(findMarket){
                    const findOrder = findMarket.orders.find(order => order._id === resData._id)
                    if(findOrder){
                        if (["open", "pending"].includes(resData.status)) {
                            findOrder.filledQuantity = resData.execQty
                            findOrder.price = resData.price
                            findOrder.quantity = resData.quantity
                            findOrder.createdAt = resData.createdAt
                            findOrder.userSide = resData.userSide
                            findOrder.status = resData.status
                            findOrder.currentPrice = resData.marketId.last
                            findOrder.timeInForce = resData.timeInForce
                            findOrder.expiration = resData.expiration
                            return [...prev, findOrder];
                        } else if (["completed", "cancelled", "expired"].includes(resData.status)) {
                            const updatedMarket = {
                              ...findMarket,
                              orders: findMarket.orders?.filter(order => order._id !== resData._id) || [],
                            };
                            if(updatedMarket.orders.length === 0){
                                return prev.filter(market => market.eventId !== resData.marketId.eventId._id)
                            }
                            const updatedData = prev.map(market => market.eventId === resData.marketId.eventId._id ? updatedMarket : market)
                            return updatedData
                        }
                    } else {
                        findMarket.orders.push(resData)
                        return [...prev, findMarket]
                    }
                } else {
                    let orderData = {
                        ...resData,
                        currentPrice: resData.marketId.last,
                        timeInForce: resData.timeInForce,
                        expiration: resData.expiration
                    }
                    const newMarket = {
                        eventId: resData.marketId.eventId._id,
                        eventSlug: resData.marketId.eventId.slug,
                        eventImage: resData.marketId.eventId.image,
                        eventTitle: resData.marketId.eventId.title, 
                        orders: [orderData]
                    }
                    return [newMarket,...prev]
                }
            })
        }
        socket.on("order-update", handleOrders)
        return () => {
            socket.off("order-update", handleOrders)
        }
    }, [socketContext])
  return (
    <>
        {/* <div className="flex space-x-4 mb-3">
            <SearchBar placeholder="Search" />
            <select className="border bg-[#131212] border-[#262626] bg-black rounded p-1 text-sm">
                <option>Market</option>
                <option>Filled Quantity</option>
                <option>Total Quantity</option>
                <option>Order Date</option>
            </select>
        </div> */}
        <div className="overflow-x-auto">
            <table className="w-full text-left custom_table">
                <thead>
                <tr>
                    <th>Market</th>
                    {/* <th>Side</th> */}
                    {/* <th>Outcome</th> */}
                    <th>Filled</th>
                    <th>Contracts</th>
                    <th>Limit Price</th>
                    <th>Current Price</th>
                    <th>Cash</th>
                    <th>Placed</th>
                    <th>Expiration</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
               {openOrders?.length>0 && openOrders.map((item)=>(
                    <React.Fragment key={item._id}>
                        <tr>
                            <td colSpan={8}>
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={()=>route.push(`/event-page/${item?.eventSlug}`)}>
                                <span className="text-2xl">
                                  <img
                                    src={item?.eventImage}
                                    alt="Icon"
                                    width={42}
                                    height={42}
                                  />
                                </span>
                                <span className="text-sm font-normal">
                                  {item?.eventTitle}
                                </span>
                              </div>
                            </td>
                        </tr>
                        {item?.orders
                            ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map((data,index)=> (
                            <tr key={index}>
                                <td>{data.marketGroupTitle} <span style={{color: data.userSide == 'yes' ? "rgba(38, 92, 255, 1)" : "violet",textTransform:"capitalize"}}>{data.action} {data.userSide}</span></td>
                                {/* <td>{data.side}</td> */}
                                {/* <td>{data.side}</td> */}
                                <td>{data.filledQuantity ?? 0}</td>
                                <td>{data.quantity}</td>
                                <td>{data.price}</td>
                                <td>{data.currentPrice}</td>
                                <td>${toFixedDown((data.price * data.quantity)/100, 2)}</td>
                                <td>{momentFormat(data.createdAt,"DD/MM/YYYY HH:mm")}</td>
                                <td>{data.timeInForce == "GTC" ? "Good 'til canceled" : momentFormat(data.expiration,"DD/MM/YYYY HH:mm")}</td>
                                <td>
                                    <button className="text-red-500" onClick={()=>handleCancelOrder(data._id)}>
                                        <X size={20} />
                                    </button> 
                                </td>
                            </tr>
                        ))}
                    </React.Fragment>
                )
               )}
                </tbody>
            </table>
        </div>
    </>
  )
}

export default OpenOrders

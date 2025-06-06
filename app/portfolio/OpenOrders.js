import React, { useEffect, useState } from 'react'
import SearchBar from '../components/ui/SearchBar'
import { getOpenOrders } from '@/services/portfolio'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { toastAlert } from '@/lib/toast'
import { momentFormat } from '../helper/date'

const OpenOrders = () => {
     const [openOrders, setOpenOrders] = useState([])
     const route = useRouter()
    
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
            // const res = await cancelOrder(orderId)
            // if(res.success){
            //     getUserOpenOrders()
            // }
            toastAlert("success","Order canceled successfully","order")
        } catch (error) {
            console.error("Error canceling order:", error);
        }
    }
  return (
    <>
        <div className="flex space-x-4 mb-3">
            <SearchBar placeholder="Search" />
            <select className="border bg-[#131212] border-[#262626] bg-black rounded p-1 text-sm">
                <option>Market</option>
                <option>Filled Quantity</option>
                <option>Total Quantity</option>
                <option>Order Date</option>
            </select>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left custom_table">
                <thead>
                <tr>
                    <th>Market</th>
                    {/* <th>Side</th> */}
                    {/* <th>Outcome</th> */}
                    <th>Price</th>
                    <th>Filled</th>
                    <th>Total</th>
                    <th>Expiration</th>
                    <th>Placed</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
               {openOrders?.length>0 && openOrders.map((item)=>(
                    <React.Fragment key={item._id}>
                        <tr>
                            <td colSpan={8}>
                                <div className="flex items-center space-x-2 cursor-pointer" onClick={()=>route.push(`/event-page/${item?.eventSlug}`)}>
                                <span className="text-2xl">
                                  <Image
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
                                <td>{data.marketGroupTitle} <span style={{color: data.side == 'yes' ? "rgba(38, 92, 255, 1)" : "violet",textTransform:"capitalize"}}>{data.action} {data.side}</span></td>
                                {/* <td>{data.side}</td> */}
                                {/* <td>{data.side}</td> */}
                                <td>{data.price}</td>
                                <td>{data.filledQuantity ?? 0}</td>
                                <td>{data.quantity}</td>
                                <td>Good &apos;til canceled</td>
                                <td>{momentFormat(data.createdAt,"DD/MM/YYYY HH:mm")}</td>
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

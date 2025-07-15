// in here fetch trarde histry and render the table
//that table have coloums like excecute time, execUserId,price, quantity, side
"use client";
import { Fragment, useEffect, useState } from 'react';
import { formatNumber, shortText } from "@/app/helper/custommath";
import { useSelector } from 'react-redux';
import { getTradeHistory } from '@/services/user';
import PaginationComp from '../components/customComponents/PaginationComp';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

interface Trade {
  time: string;
  execUserId: any;
  price: number;
  quantity: number;
  side: string;
  action: string;
  marketId: any;
  fee: any;
}

interface PaginationState {
  page: number;
  limit: number;
  offset: number;
}

const ActivityTable = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pagination, setPagination] = useState<PaginationState>({
     page: 1,
     limit: 10,
     offset: 0,
   });


  const { uniqueId } = useSelector((state:any) => state.auth.user);
  const route = useRouter();

  useEffect(() => {
    const fetchTradeHistory = async () => {
      try {
        setLoading(true)
        const { success, result } = await getTradeHistory({id:uniqueId,...pagination});
        if (success) {
            setTrades(result.data);
            setHasMore(result.count > pagination.page * pagination.limit);
        } 
      } catch (error) {
        console.error('Error fetching trade history:');
      } finally {
          setLoading(false);
      }
    };

    fetchTradeHistory();
  }, [uniqueId,pagination]);

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center my-5 min-h-[100px]">
  //       <Loader className="w-26 h-26 animate-spin" />
  //     </div>
  //   )
  // }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-gray-100 mb-3">
        <thead className=" capitalize bg-[#1A1A1A]">
          <tr>
            <th className="px-6 py-3">Time</th>
            {/* <th className="px-6 py-3">User</th> */}
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3">Quantity</th>
            <th className="px-6 py-3">Fees</th>
            <th className="px-6 py-3">Action</th>
            <th className="px-6 py-3">Direction</th>
          </tr>
        </thead>
        <tbody>
          {!loading && trades.length>0 && trades.map((trade, index) => (
            <Fragment key={index}>
              <tr>
                <td colSpan={5} className='py-3 px-6'>
                  <div className="flex items-center gap-4">
                    <img
                      src={trade.marketId?.eventId?.image}
                      alt="Icon"
                      width={42}
                      height={42}
                      className="cursor-pointer"
                      onClick={()=>route.push(`/event-page/${trade.marketId?.eventId?.slug}`)}
                    />
                    <Link href={`/event-page/${trade.marketId?.eventId?.slug}`} className="cursor-pointer">
                      {trade.marketId?.question}
                    </Link>
                  </div>
                </td>
              </tr>
            <tr  className="border-b border-[#333333]">
              <td className="px-6 py-4">
                <span className='font-bold'>Trade Completed</span>
                <br />
                <span className='text-xs'>{new Date(trade.time).toLocaleString()}</span>
              </td>
              {/* <td className="px-6 py-4">
                {trade.execUserId?.uniqueId}
              </td> */}
              <td className="px-6 py-4">
                {formatNumber(trade.price)}¢
              </td>
              <td className="px-6 py-4">
                {formatNumber(trade.quantity)}
              </td>
              <td className="px-6 py-4">
                ${formatNumber(trade.fee)}
              </td>
              <td className={`px-6 py-4 ${trade.action === 'buy' ? 'text-green-500' : 'text-red-500'} capitalize`}>
                {trade.action}
              </td>
              <td className={`px-6 py-4 ${trade.side === 'yes' ? 'text-green-500' : 'text-red-500'} capitalize`}>
                {trade.side == "yes" ? (trade?.marketId?.outcome?.[0]?.title || "yes") : (trade?.marketId?.outcome?.[1]?.title || "no") }
              </td>
            </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      {!loading && trades.length === 0 && (
          <div  className="flex justify-center my-5 text-gray-500">
              No Activity found
          </div>
      )}
      {!loading && trades.length > 0 && (
          <PaginationComp
            pagination={pagination}
            setPagination={setPagination}
            hasMore={hasMore}
          />
      )}   
    {loading &&  (
      <div className="flex justify-center items-center my-5 min-h-[100px]">
        <Loader className="w-26 h-26 animate-spin" />
      </div>
    )}
    </div>
  );
}

export default ActivityTable;
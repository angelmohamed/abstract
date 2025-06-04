// in here fetch trarde histry and render the table
//that table have coloums like excecute time, execUserId,price, quantity, side
"use client";
import { useEffect, useState } from 'react';
import { formatNumber, shortText } from "@/app/helper/custommath";
import { useSelector } from 'react-redux';
import { getTradeHistory } from '@/services/user';

interface Trade {
  time: string;
  execUserId: string;
  price: number;
  quantity: number;
  side: string;
}

const ActivityTable = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const { uniqueId } = useSelector((state:any) => state.auth.user);

  useEffect(() => {
    const fetchTradeHistory = async () => {
      try {
        const { success, result } = await getTradeHistory({id:uniqueId});
        if (success) {
            setTrades(result.data);
        } 
      } catch (error) {
        console.error('Error fetching trade history:');
      } finally {
        setLoading(false);
      }
    };

    fetchTradeHistory();
  }, [uniqueId]);

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-100">
        <thead className="text-xs uppercase bg-[#1A1A1A]">
          <tr>
            <th className="px-6 py-3">Time</th>
            <th className="px-6 py-3">User</th>
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3">Quantity</th>
            <th className="px-6 py-3">Side</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={index} className="border-b border-[#333333] hover:bg-[#1A1A1A]">
              <td className="px-6 py-4">
                {new Date(trade.time).toLocaleString()}
              </td>
              <td className="px-6 py-4">
                {trade.execUserId?.uniqueId}
              </td>
              <td className="px-6 py-4">
                ${formatNumber(trade.price)}
              </td>
              <td className="px-6 py-4">
                {formatNumber(trade.quantity)}
              </td>
              <td className={`px-6 py-4 ${trade.side === 'yes' ? 'text-green-500' : 'text-red-500'}`}>
                {trade.side}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityTable;
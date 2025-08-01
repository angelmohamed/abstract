// in here fetch trarde histry and render the table
//that table have coloums like excecute time, execUserId,price, quantity, side
"use client";
import { Fragment, useEffect, useState } from 'react';
import { formatNumber, shortText ,isFirstLetterCaps} from "@/app/helper/custommath";
import { useSelector } from 'react-redux';
import { transactionHistory } from '@/services/user';
import PaginationComp from '../components/customComponents/PaginationComp';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import config from "../../config/config"
import { Loader } from 'lucide-react';

interface Deposit {
  amount: number;
  usdAmt: number;
  hash: string;
  from: string;
  to: string;
  coin: string;
  status: string;
  type: string;
  createdAt: Date
}

interface PaginationState {
  page: number;
  limit: number;
  offset: number;
}

const DepositTable = () => {
  const [Deposit, setDeposit] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [copiedRowId, setCopiedRowId] = useState<number | null>(null);
  const [copiedRowId1, setCopiedRowId1] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    offset: 0,
  });


  const { uniqueId } = useSelector((state: any) => state.auth.user);
  const route = useRouter();

  useEffect(() => {
    const fetchDepositHistory = async () => {
      try {
        setLoading(true)
        let data = {
          type: "deposit",
          id: uniqueId, ...pagination
        }
        const { success, result } = await transactionHistory(data);
        if (success) {
          setDeposit(result.data);
          setHasMore(result.count > pagination.page * pagination.limit);
        }
      } catch (error) {
        console.error('Error fetching trade history:');
      } finally {
        setLoading(false);
      }
    };

    fetchDepositHistory();
  }, [uniqueId, pagination]);


  const handleCopy = async (text: string, rowId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRowId(rowId);
      setTimeout(() => setCopiedRowId(null), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleCopy1 = async (text: string, rowId: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRowId1(rowId);
      setTimeout(() => setCopiedRowId1(null), 1000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left custom_table">
        <thead>
          <tr>
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Amount</th>
            <th className="px-6 py-3">USD($)</th>
            <th className="px-6 py-3">From</th>
            <th className="px-6 py-3">To</th>
            <th className="px-6 py-3">Coin</th>
            <th className="px-6 py-3">Hash</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {!loading && Deposit && Deposit?.length > 0 && Deposit.map((deposit, index) => (
            <Fragment key={index}>
              <tr className="border-b border-[#333333]">
                <td className="px-6 py-4">
                  {new Date(deposit?.createdAt).toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  {formatNumber(deposit?.amount, 4)}
                </td>
                <td className="px-6 py-4">
                  {formatNumber(deposit?.usdAmt, 4)}
                </td>
                <td
                  className="px-6 py-4 cursor-pointer relative"
                  onClick={() => handleCopy(deposit?.from, index)}
                >
                  {shortText(deposit?.from)}
                  {copiedRowId === index && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-black px-2 py-0.5 rounded shadow">
                      Copied!
                    </span>
                  )}
                </td>
                <td
                  className="px-6 py-4 cursor-pointer relative"
                  onClick={() => handleCopy1(deposit?.to, index)}
                >
                  {shortText(deposit?.to)}
                  {copiedRowId1 === index && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-black px-2 py-0.5 rounded shadow">
                      Copied!
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  {deposit?.coin}
                </td>
                <td className="px-6 py-4">
                  <a
                    href={`${config?.txUrl}${deposit?.hash}?cluster=${config?.networkType}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View Transaction"
                  >
                  {shortText(deposit?.hash)} </a>
                </td>
                <td className="px-6 py-4">
                  <span className={"text-green-500"}>
                    {isFirstLetterCaps(deposit?.status)}
                  </span>
                </td>
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      {!loading && Deposit?.length === 0 && (
        <div className="flex justify-center my-5 text-gray-500">
          No Activity found
        </div>
      )}
      {!loading && Deposit?.length > 0 && (
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

export default DepositTable;
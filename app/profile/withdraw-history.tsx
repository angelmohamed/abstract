// in here fetch trarde histry and render the table
//that table have coloums like excecute time, execUserId,price, quantity, side
"use client";
import { Fragment, useEffect, useState } from 'react';
import { formatNumber, shortText, isFirstLetterCaps } from "@/app/helper/custommath";
import { useSelector } from 'react-redux';
import { transactionHistory } from '@/services/user';
import PaginationComp from '../components/customComponents/PaginationComp';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import config from "../../config/config"

interface Deposit {
    amount: number;
    usdAmt: number;
    hash: string;
    from: string;
    to: string;
    coin: string;
    status: string;
    type: string;
    reason: string;
    createdAt: Date
}

interface PaginationState {
    page: number;
    limit: number;
    offset: number;
}

const WithdrawTable = () => {
    const [Withdraw, setWithdraw] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState(true);
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
                let data = {
                    type: "withdraw",
                    id: uniqueId, ...pagination
                }
                const { success, result } = await transactionHistory(data);
                if (success) {
                    setWithdraw(result.data);
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

    if (loading) {
        return <div className="text-center py-4">Loading...</div>;
    }


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
            <table className="w-full text-left text-gray-100 mb-3">
                <thead className=" capitalize bg-[#1A1A1A]">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">From</th>
                        <th className="px-6 py-3">To</th>
                        <th className="px-6 py-3">Coin</th>
                        <th className="px-6 py-3">Hash</th>
                        <th className="px-6 py-3">Reason</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {Withdraw && Withdraw.length > 0 && Withdraw.map((withdraw, index) => (
                        <Fragment key={index}>
                            <tr className="border-b border-[#333333]">
                                <td className="px-6 py-4">
                                    {new Date(withdraw?.createdAt).toLocaleString()}
                                </td>

                                <td className="px-6 py-4">
                                    {formatNumber(withdraw?.amount, 4)}
                                </td>
                                <td
                                    className="px-6 py-4 cursor-pointer relative"
                                    onClick={() => handleCopy(withdraw?.from, index)}
                                >
                                    {shortText(withdraw?.from)}
                                    {copiedRowId === index && (
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-black px-2 py-0.5 rounded shadow">
                                            Copied!
                                        </span>
                                    )}
                                </td>
                                <td
                                    className="px-6 py-4 cursor-pointer relative"
                                    onClick={() => handleCopy1(withdraw?.to, index)}
                                >
                                    {shortText(withdraw?.to)}
                                    {copiedRowId1 === index && (
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs text-white bg-black px-2 py-0.5 rounded shadow">
                                            Copied!
                                        </span>
                                    )}
                                </td>

                                <td className="px-6 py-4">
                                    {withdraw?.coin}
                                </td>
                                <td className="px-6 py-4">
                                    {withdraw?.status?.toLowerCase() === "completed" ?
                                        < a
                                            href={`${config?.txUrl}${withdraw?.hash}?cluster=${config?.networkType}`}
                                            target="_blank"
                                        >

                                            {shortText(withdraw?.hash)} </a>
                                        : "-"
                                    }
                                </td>
                                <td className="px-6 py-4 relative group cursor-help">
                                    {withdraw?.status === "rejected" ?
                                        <>
                                            {withdraw?.reason?.length > 6 ? `${withdraw?.reason.slice(0, 6)}...` : withdraw?.reason}
                                            <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 text-sm text-white bg-black rounded shadow-lg">
                                                {withdraw?.reason}
                                            </div>
                                        </> : "-"}
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={
                                            withdraw?.status === "completed"
                                                ? "text-green-500"
                                                : withdraw?.status === "rejected"
                                                    ? "text-red-500"
                                                    : withdraw?.status === "requested"
                                                        ? "text-yellow-500"
                                                        : "text-gray-500"
                                        }
                                    >
                                        {isFirstLetterCaps(withdraw?.status)}
                                    </span>
                                </td>
                            </tr>
                        </Fragment>
                    ))}
                </tbody>
            </table>
            {
                Withdraw.length === 0 && (
                    <div className="flex justify-center my-5 text-gray-500">
                        No Activity found
                    </div>
                )
            }
            {
                Withdraw.length > 0 && (
                    <PaginationComp
                        pagination={pagination}
                        setPagination={setPagination}
                        hasMore={hasMore}
                    />
                )
            }
        </div >
    );
}

export default WithdrawTable;
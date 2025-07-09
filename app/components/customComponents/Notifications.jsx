import { memo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getNotifications } from "../../../services/user";
import { useSelector } from "@/store";
import { formatDistanceToNow } from 'date-fns';

const Notification = () => {
    const { signedIn } = useSelector((state) => state.auth?.session);

    // state
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    useEffect(() => {
        if (!signedIn) {
            return;
        }
        setLoading(true);
        const fetchData = async () => {
            try {
                const { success, result } = await getNotifications();
                setLoading(false);
                console.log(success, result, "success, result");
                if (success) {
                    setData(result);
                }
            } catch (err) {
                setLoading(false);
            }
        }
        setLoading(false);
        fetchData();
    }, [signedIn]);
    

    if (loading)
        return (
            <div className="text-center text-gray-100 text-sm min-h-[200px] flex items-center justify-center">
                Loading...
            </div>
        )

    if (data?.length == 0)
        return (
            <div className="text-center text-gray-100 text-sm min-h-[200px] flex items-center justify-center">
                No notifications yet
            </div>
        )

    return (
        <div className="flex flex-col gap-2 min-h-[200px]">
            {
                data?.length > 0 && data.map((item, index) =>
                    <Link
                        href="/notifications"
                        className="flex items-start gap-3 p-4 hover:bg-[#333333] rounded"
                        key={index}
                    >
                        <Image
                            src="/images/album.png"
                            alt="Profile Icon"
                            width={48}
                            height={48}
                            className="rounded"
                        />
                        <div>
                            <h5 className="text-[16px] font-semibold text-gray-100">
                                {item.type == "trade" ? "Trade confirmed": "--"}
                            </h5>
                            <p className="text-sm text-gray-300">
                                {item?.content?.marketTitle}
                            </p>
                            <p className="text-[12px] text-gray-400 mb-0">
                                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </Link>
                )
            }
        </div>
    )
}

export default memo(Notification);
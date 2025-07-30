import { momentFormat } from "@/app/helper/date";
import { toastAlert } from "@/lib/toast";
import { cancelOrder } from "@/services/market";
import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import { Fragment } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";

export const OpenOrderDialog = ({
  openOrderDialog,
  setOpenOrderDialog,
  openOrderData,
  onOrderCancel,
}: any) => {
  const handleCancelOrder = async (orderId: any) => {
    try {
      const { success, message } = await cancelOrder(orderId);
      if (success) {
        onOrderCancel(orderId, success);
        toastAlert("success", message, "order");
      } else {
        toastAlert("error", message, "orderCancel");
      }
    } catch {}
  };
  return (
    <Dialog.Root open={openOrderDialog} onOpenChange={setOpenOrderDialog}>
      <Dialog.Overlay className="DialogOverlay" />
      <Dialog.Content
        className="DialogContent w-100"
        style={{ maxWidth: "900px" }}
      >
        <Dialog.Title className="DialogTitle mb-4">Open Orders</Dialog.Title>
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
              {openOrderData?.length > 0 &&
                openOrderData.map((item) => (
                  <Fragment key={item._id}>
                    <tr>
                      <td>
                        {item?.marketId?.groupItemTitle}{" "}
                        <span
                          style={{
                            color:
                              item.userSide == "yes"
                                ? "rgba(125, 253, 254, 1)"
                                : "rgba(236, 72, 153, 1)",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.action}{" "}
                          {item.userSide == "yes"
                            ? item?.marketId?.outcome?.[0]?.title || "yes"
                            : item?.marketId?.outcome?.[1]?.title || "no"}
                        </span>
                      </td>
                      {/* <td>{item.side}</td> */}
                      {/* <td>{item.side}</td> */}
                      <td>
                        {item.action == "sell" ? 100 - item.price : item.price}
                      </td>
                      <td>{item.execQty ?? 0}</td>
                      <td>{item.quantity}</td>
                      <td>
                        {" "}
                        {item.timeInForce == "GTC"
                          ? "Good 'til canceled"
                          : "Good 'til Date"}
                      </td>
                      <td>
                        {momentFormat(item.createdAt, "DD/MM/YYYY HH:mm")}
                      </td>
                      <td>
                        <button
                          className="text-red-500"
                          onClick={() => handleCancelOrder(item._id)}
                        >
                          <X size={20} />
                        </button>
                      </td>
                    </tr>
                  </Fragment>
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
  );
};

"use client";
import { useContext, useEffect } from "react";
import store from "../store";
import { SocketContext, subscribe } from "@/config/socketConnectivity";
import { setWallet } from "@/store/slices/wallet/dataSlice";
import { useDispatch } from "react-redux";
import { getCurrentValue } from "@/services/user";

export default function ClientLayoutEffect() {
  const socketContext = useContext(SocketContext);
  const dispatch = useDispatch();
  const getWalletData = async () => {
    try {
      const { success, result } = await getCurrentValue();
      if (success) {
        dispatch(setWallet({
          balance: result.balance,
          inOrder: result.inOrder,
          locked: result.locked,
          position: result.position,
        }));
      }
    } catch (error) {
      console.log("error on getWalletData", error);
    }
  };
  useEffect(() => {
    getWalletData();
    const socket = socketContext?.socket;
    if (!socket) return;


    const handleAsset = (result) => {
      const assetdata = JSON.parse(result);
      let prevPosition = store.getState().wallet.data.position;
      dispatch(setWallet({
        balance: assetdata.balance,
        inOrder: assetdata.inOrder,
        locked: assetdata.locked,
        position: prevPosition,
      }));
    };
    
    socket.on("asset", handleAsset);

    return () => {
      socket.off("asset");
    };
  
  }, [socketContext?.socket]);
  useEffect(() => {
    const { user } = store.getState().auth;
    if (user && user._id) subscribe(user._id);
  }, []);
  return null; // No UI, just side effect
}
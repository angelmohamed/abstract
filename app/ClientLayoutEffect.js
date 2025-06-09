"use client";
import { useContext, useEffect } from "react";
import store from "../store";
import { SocketContext, subscribe } from "@/config/socketConnectivity";
import { setWallet } from "@/store/slices/wallet/dataSlice";
import { useDispatch } from "react-redux";

export default function ClientLayoutEffect() {
  const socketContext = useContext(SocketContext);
  const dispatch = useDispatch();
  useEffect(() => {
    const socket = socketContext?.socket;
    if (!socket) return;


    const handleAsset = (result) => {
      const assetdata = JSON.parse(result);
      dispatch(setWallet({
        balance: assetdata.balance,
        inOrder: assetdata.inOrder,
        locked: assetdata.locked,
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
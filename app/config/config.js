var key = {};
 if (process.env.NODE_ENV == "production") {
  key = {
    frontUrl: "http://localhost:3000",
    baseUrl: "http://localhost:3001/api/v1/user",
    backendURL: "http://localhost:3001",
    txLink: "https://amoy.polygonscan.com/",
    rpcUrl: "https://polygon-amoy-bor-rpc.publicnode.com",
    getLoginInfo: "https://ipapi.co/json/",
    chainId: 80002,
    chaincode: "amoy",
    txurl: "https://testnet.bscscan.com",
    usdcAdd : "0xeC35E5e8c4B26510F5FA90b00F202E1B44B8F537",
    contractAdd : "0x07b67af96d444ea2842Faca9Ff2B68a358f83B82",
    clientId: "736868654424-o0358dlqp1853eafackm2edren909e1m.apps.googleusercontent.com"
  }
} else {
  key = {
    frontUrl: "http://localhost:3000",
    baseUrl: "http://localhost:3001/api/v1/user",
    backendURL: "http://localhost:3001",
    txLink: "https://amoy.polygonscan.com/",
    rpcUrl: "https://polygon-amoy-bor-rpc.publicnode.com",
    getLoginInfo: "https://ipapi.co/json/",
    chainId: 80002,
    chaincode: "amoy",
    txurl: "https://testnet.bscscan.com",
    usdcAdd : "0xeC35E5e8c4B26510F5FA90b00F202E1B44B8F537",
    contractAdd : "0x07b67af96d444ea2842Faca9Ff2B68a358f83B82",
    clientId: "736868654424-o0358dlqp1853eafackm2edren909e1m.apps.googleusercontent.com"
  };
}
export default key;
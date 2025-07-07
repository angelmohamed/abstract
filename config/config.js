var key = {};
 if (process.env.NODE_ENV == "production") {
  key = {
    frontUrl: "https://sonotrade-frontend-2025.pages.dev",
    backendURL: "https://sonotradesdemo.wearedev.team",
    txLink: "https://amoy.polygonscan.com/",
    getLoginInfo: "https://freeipapi.com/api/json",
    // rpcUrl: "https://polygon-amoy-bor-rpc.publicnode.com",
    // chainId: 80002,
    // chaincode: "amoy",
    // txurl: "https://testnet.bscscan.com",
    txUrl: "https://solscan.io/tx/",
    networkType: "devnet",
    network: "solana",
    rpcUrl: "https://api.devnet.solana.com",
    tokenMint : "5j9dZDM4EZCarNGmP1AmUveexPwp46XhYZeg9yAYKQv7",
    programID : "2KrhzQ72G68pUcLob5M4k2GKkgWSCiu9JeVvGREGzV5f",
    adminAdd : "rQBosrkDL5DBSxbvA2pCGTW8VmgU9y9zou7a9BedFo6",
    PYTH_PRICE_ACCOUNT : "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix",
    clientId: "787150198264-2mkh4meu0m9phtb4m65f7bdre82kuibl.apps.googleusercontent.com",

    usdcAdd : "0xeC35E5e8c4B26510F5FA90b00F202E1B44B8F537",
    contractAdd : "0x07b67af96d444ea2842Faca9Ff2B68a358f83B82",
  }
} else {
  key = {
    frontUrl: "http://localhost:3000",
    backendURL: "http://localhost:3001",
    txLink: "https://amoy.polygonscan.com/",
    getLoginInfo: "https://freeipapi.com/api/json",
    // rpcUrl: "https://polygon-amoy-bor-rpc.publicnode.com",
    // chainId: 80002,
    // chaincode: "amoy",
    // txurl: "https://testnet.bscscan.com",
    txUrl: "https://solscan.io/tx/",
    networkType: "devnet",
    network: "solana",
    rpcUrl: "https://api.devnet.solana.com",
    tokenMint : "5j9dZDM4EZCarNGmP1AmUveexPwp46XhYZeg9yAYKQv7",
    programID : "2KrhzQ72G68pUcLob5M4k2GKkgWSCiu9JeVvGREGzV5f",
    adminAdd : "rQBosrkDL5DBSxbvA2pCGTW8VmgU9y9zou7a9BedFo6",
    PYTH_PRICE_ACCOUNT : "J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix",
    clientId: "787150198264-2qt0ai7tjcu85ehjfh81kum2nsh8momt.apps.googleusercontent.com",

    usdcAdd : "0xeC35E5e8c4B26510F5FA90b00F202E1B44B8F537",
    contractAdd : "0x07b67af96d444ea2842Faca9Ff2B68a358f83B82",
  };
}
export default key;





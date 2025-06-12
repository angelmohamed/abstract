import config from "../../config/config";
import DEPOSITABI from "../../components/ABI/DEPOSITABI.json";
import tokenABI from "../../components/ABI/TOKENABI.json"
import PRICEABI from "../../components/ABI/PRICEABI.json"
import Web3 from "web3";
import { Multicall } from "ethereum-multicall";
import { convert } from "../helper/convert";
import { getFormatMulticall,getFormatMulticall1 } from "../helper/custommath";
import { userDeposit } from "@/services/wallet";

export async function getCoinAmt(address,amount,transport) {
  try {
    // console.log(address,"addressaddressaddressaddress")
    const POLAddress = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; 
    let amt = convert(amount.toString())
    const web3 = new Web3(transport);
    const multicall = new Multicall({ web3Instance: web3 });
    //   console.log(amt,"amtamtamtamt")
      
    const Contract = [
        {
            reference: "balanceOf",
            contractAddress: config.usdcAdd,
            abi: tokenABI,
            calls: [
                {
                    reference: "allowance",
                    methodName: "allowance",
                    methodParameters: [address, config.contractAdd],
                },
            ]
        },
      {
        reference: "MIN_DEPOSIT_USD",
        contractAddress: config.contractAdd,
        abi: DEPOSITABI,
        calls: [
          {
            reference: "MIN_DEPOSIT_USD",
            methodName: "MIN_DEPOSIT_USD",
            methodParameters: [],
          },
          {
            reference: "getTokenValue",
            methodName: "getTokenValue",
            methodParameters: [POLAddress, amt],
          },
        ],
      },
      { 
        reference: "gasprices",
        contractAddress: "0x001382149eBa3441043c1c66972b4772963f5D43",
        abi: PRICEABI,
        calls: [
            {
                reference: "latestRoundData",
                methodName: "latestRoundData",
                methodParameters: [],
            },
            {
                reference: "decimals",
                methodName: "decimals",
                methodParameters: [],
            },
        ]
    },
    ];

    const results = await multicall.call(Contract);
    console.log(results,"resultsresultsresults")
    let minDepositRaw = await getFormatMulticall(results, "MIN_DEPOSIT_USD", 0);
    let tokenAmtRaw = await getFormatMulticall(results, "MIN_DEPOSIT_USD", 1);

    var allowance = await getFormatMulticall(results, "balanceOf", 0);
    allowance = parseInt(allowance.hex) / 10 ** 18;
    
    const minDeposit = parseInt(minDepositRaw.hex) / 1e18;
    const tokenAmt = parseInt(tokenAmtRaw.hex) / 1e18;
    console.log(tokenAmt,minDeposit,"tokenAmtRaw")

    let gasAmt = await getFormatMulticall1(results, "gasprices", 0);
    
    let gasDecimals = await getFormatMulticall(results, "gasprices", 1);
    let usdConvt = parseInt(gasAmt[1].hex) / 10 ** gasDecimals
    return { minDeposit, tokenAmt, allowance ,usdConvt};
  } catch (err) {
    console.error("Error in getCoinAmt:", err);
    return { minDeposit: 0, tokenAmt: 0 };
  }
}



export async function depsoitToken(address,amount,transport,dispatch) {
    try {
        console.log(address,amount,"depsoitToken")
        const web3 = new Web3(transport);
        var currnetwork = await web3.eth.net.getId();
        if (currnetwork != config.chainId) {
            return {
                isAllowed: false,
                approvalAmt: 0,
                error: `Please login into polygon chain.`
            }
        }
        const usdcContract = new web3.eth.Contract(tokenABI, config.usdcAdd);
        const decimals = await usdcContract.methods.decimals().call();
        var tkn = amount * (10 ** decimals);
        tkn = tkn.toString();
        tkn = convert(tkn);

        var gasPrice = await web3.eth.getGasPrice();
        var balance = await web3.eth.getBalance(address);
        let Contractsss = new web3.eth.Contract(DEPOSITABI, config.contractAdd);

        var estimateGas = await Contractsss.methods.depositERC20(
            config?.usdcAdd,tkn,
        ).estimateGas({ from: address });
        estimateGas = parseInt(estimateGas) + 30000;
        
        if (parseFloat(estimateGas) / 10 ** 6 > balance) {
            return {
                isAllowed: false,
                approvalAmt: 0,
                error: `Please make sure you have gas fee(${parseFloat(estimateGas) / 10 ** 6} POL) in your wallet.`
            }
        }

        var result = await Contractsss.methods.depositERC20(
            config?.usdcAdd,tkn,
        ).send({ from: address, gasPrice: gasPrice, gasLimit: estimateGas });

        let transactionHash = result?.transactionHash;
        let DepAmt = result?.events?.Deposited?.returnValues?.usdValue
           balance = DepAmt / (10 ** decimals)
         let depositdata = {
            hash : transactionHash,
            address: address,
            amount : balance,
            symbol : "USDT"
         }
        var { message ,status} = await userDeposit(depositdata,dispatch)
        console.log( message ,status," message ,status")
        return {
            status: status,
            txId: transactionHash,
            message: message
        }


    } catch (err) {
        var error = err.toString();
        console.log(error, 'error')
        var pos = error.search("User denied")
        var pos1 = error.search("funds")
        var message = "Please try again later";
        if (pos >= 0) {
            message = "Cancelled the transaction";
        } else if (pos1 >= 0) {
            message = "Insufficient funds";
        }
        return {
            status: false,
            message: message,
            txId: "",
            reward: 0
        }

    }

}


export async function approveToken(address,transport) {
console.log(address,"addressaddress")
    var tkn = 1000 * 10 ** 18;
    tkn = convert(tkn.toString());

    try {
        const web3 = new Web3(transport)
        var gasPrice = await web3.eth.getGasPrice();
        var balance = await web3.eth.getBalance(address);
        let Contractsss = new web3.eth.Contract(tokenABI, config.usdcAdd);

        var estimateGas = await Contractsss.methods.approve(
            config.contractAdd,
            tkn
        ).estimateGas({ from: address });
        estimateGas = parseInt(estimateGas) + 30000;

        if (parseFloat(estimateGas) / 10 ** 6 > balance) {
            return {
                isAllowed: false,
                approvalAmt: 0,
                error: `Please make sure you have gas fee(${parseFloat(estimateGas) / 10 ** 8} BNB) in your wallet.`
            }
        }

        var result = await Contractsss.methods.approve(
            config.contractAdd,
            tkn
        ).send({ from: address, gasPrice: gasPrice, gasLimit: estimateGas });

        var approvalAmt = (result && result.events && result.events.Approval && result.events.Approval.returnValues
            && result.events.Approval.returnValues && result.events.Approval.returnValues
            && result.events.Approval.returnValues.value) ?
            parseFloat(result.events.Approval.returnValues.value) : 0
        approvalAmt = approvalAmt / 10 ** 18;

        return {
            approvalAmt: approvalAmt,
            isAllowed: (result && result.status) ? result.status : false,
            error: ""
        }

    } catch (err) {
        console.log(err, 'errerrerrerrerrerr121212')
        var error = err.toString();
        var pos = error.search("User denied")
        var pos1 = error.search("funds")
        var message = "Please try again later";
        if (pos >= 0) {
            message = "Cancelled the transaction";
        } else if (pos1 >= 0) {
            message = "Insufficient funds";
        }

        return {
            approvalAmt: 0,
            isAllowed: false,
            error: message
        }

    }

}

export async function depsoitCoin(address,amount,transport,dispatch) {
    try {
        console.log("depsoitCoin")
        const web3 = new Web3(transport);
        var currnetwork = await web3.eth.net.getId();
        if (currnetwork != config.chainId) {
            return {
                isAllowed: false,
                approvalAmt: 0,
                error: `Please login into bsc chain.`
            }
        }
        const usdcContract = new web3.eth.Contract(tokenABI, config.usdcAdd);
        const decimals = await usdcContract.methods.decimals().call();
        var tkn = amount * (10 ** decimals);
        tkn = tkn.toString();
        tkn = convert(tkn);
console.log(tkn,"tkntkntkntkn")
        var gasPrice = await web3.eth.getGasPrice();
        var balance = await web3.eth.getBalance(address);
        let Contractsss = new web3.eth.Contract(DEPOSITABI, config.contractAdd);
        var estimateGas = await Contractsss.methods.depositPOL().estimateGas({ from: address ,value :tkn});
        estimateGas = parseInt(estimateGas) + 30000;

        if (parseFloat(estimateGas) / 10 ** 6 > balance) {
            return {
                isAllowed: false,
                approvalAmt: 0,
                error: `Please make sure you have gas fee(${parseFloat(estimateGas) / 10 ** 6} POL) in your wallet.`
            }
        }

        var result = await Contractsss.methods.depositPOL().send({ from: address, gasPrice: gasPrice, gasLimit: estimateGas,value :tkn });
        console.log(result,"depositpoll")

        let transactionHash = result?.transactionHash;
        let DepAmt = result?.events?.Deposited?.returnValues?.usdValue
           balance = DepAmt / (10 ** decimals)
         let depositdata = {
            hash : transactionHash,
            address: address,
            amount : balance,
            symbol : "POL"
         }
        var { message ,status} = await userDeposit(depositdata,dispatch)
        console.log( message ,status," message ,status")
        return {
            status: status,
            txId: transactionHash,
            message: message
        }

    } catch (err) {
        var error = err.toString();
        console.log(error, 'error')
        var pos = error.search("User denied")
        var pos1 = error.search("funds")
        var message = "Please try again later";
        if (pos >= 0) {
            message = "Cancelled the transaction";
        } else if (pos1 >= 0) {
            message = "Insufficient funds";
        }
        return {
            status: false,
            message: message,
            txId: "",
            reward: 0
        }

    }

}

export async function getGasCostAmt(usdConvt,transport,address,amount,currency) {
    try {
        console.log(usdConvt,transport,address,amount,"usdConvt,transport,address,amount")
        const web3 = new Web3(transport);
        var gasPrice = await web3.eth.getGasPrice();
        let Contractsss = new web3.eth.Contract(DEPOSITABI, config.contractAdd);
        const usdcContract = new web3.eth.Contract(tokenABI, config.usdcAdd);
        var estimateGas = 0
        if(currency == "USDT"){
            const decimals = await usdcContract.methods.decimals().call();
            var tkn = amount * (10 ** decimals);
            tkn = tkn.toString();
            tkn = convert(tkn);
           estimateGas = await Contractsss.methods.depositERC20(
              config?.usdcAdd,tkn,
          ).estimateGas({ from: address });
          estimateGas = parseInt(estimateGas) + 30000;
        }else{
            console.log("coinnn")
            const decimals = await usdcContract.methods.decimals().call();
            var tkn = amount * (10 ** decimals);
            tkn = tkn.toString();
            tkn = convert(tkn);
             estimateGas = await Contractsss.methods.depositPOL().estimateGas({ from: address ,value :tkn});
            estimateGas = parseInt(estimateGas) + 30000;
            console.log(estimateGas,"estimateGasestimateGas")
        }
        console.log(estimateGas,"estimateGas")
        var marketGasCost = (gasPrice / 1e9 * usdConvt)
        var gasCost = (((gasPrice * estimateGas) / 1e18) * usdConvt)
        console.log(marketGasCost , gasCost ,estimateGas,usdConvt,"marketGasCost , gasCost")
        return {
            marketGasCost : marketGasCost,
            gasCost : gasCost
        }
    } catch (err) {
       console.log(err,"err")
       return {
        marketGasCost : 0,
        gasCost : 0
    }
    }

}
import axios from "axios";
import { COUNT_CONTRACT_ADDRESS, NFT_CONTRACT_ADDRESS } from "../constants";

const A2P_API_PREPARE_URL = "https://a2a-api.klipwallet.com/v2/a2a/prepare";
const APP_NAME = 'KLAY_MARKET';

// QRCODE를 통해 klip API 모바일-PC 연결
export const getAddress = (setQrvalue, callback) => {

    // 1. Prepare
    axios.post(
        A2P_API_PREPARE_URL, {
        bapp: {
            name: APP_NAME
        },
        type: "auth"
    }
    ).then((response) => {
        // 2. Request
        const { request_key } = response.data;
        const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
        setQrvalue(qrcode);

        let timerId = setInterval(() => {
            axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
                if (res.data.result) {
                    // 3. Result
                    console.log(`[Result] ${JSON.stringify(res.data.result)}`);
                    // callback: 다음 함수 실행, address 넘겨주기
                    callback(res.data.result.klaytn_address);
                    clearInterval(timerId);
                }
            })
        }, 1000)
    })
}

// 컨트랙트 실행
export const executeContract = (txTo, functionJSON, value, params, setQrvalue, callback) => {
    axios.post(
        A2P_API_PREPARE_URL, {
        bapp: {
            name: APP_NAME
        },
        type: "execute_contract",
        transaction: {
            to: txTo,
            abi: functionJSON,
            value: value,
            params: params
        }
    }
    ).then((response) => {
        const { request_key } = response.data;
        const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
        setQrvalue(qrcode);

        let timerId = setInterval(() => {
            axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
                if (res.data.result) {
                    console.log(`[Result] ${JSON.stringify(res.data.result)}`);
                    callback(res.data.result);
                    clearInterval(timerId);
                }
            })
        }, 1000)
    })
}

// TOKEN 발행 (mint)
export const mintCardWithURI = async (toAddress, tokenId, uri, setQrvalue, callback) => {
    const functionJSON = '{ "constant": false, "inputs": [ { "name": "to", "type": "address" }, { "name": "tokenId", "type": "uint256" }, { "name": "tokenURI", "type": "string" } ], "name": "mintWithTokenURI", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "stateMutability": "nonpayable", "type": "function" }';
    executeContract(NFT_CONTRACT_ADDRESS, functionJSON, "0", `["${toAddress}","${tokenId}","${uri}"]`, setQrvalue, callback);
}

// export const setCount = (count, setQrvalue) => {
//     axios.post(
//         A2P_API_PREPARE_URL, {
//             bapp: {
//                 name: APP_NAME
//             },
//             type: "execute_contract",
//             transaction: {
//                 to: COUNT_CONTRACT_ADDRESS,
//                 abi: '{ "constant": false, "inputs": [ { "name": "_count", "type": "uint256" } ], "name": "setCount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }',
//                 value: "0",
//                 params: `["${count}"]`
//             }
//         }
//     ).then((response) => {
//         const { request_key } = response.data;
//         const qrcode = `https://klipwallet.com/?target=/a2a?request_key=${request_key}`;
//         setQrvalue(qrcode);

//         let timerId = setInterval(() => {
//             axios.get(`https://a2a-api.klipwallet.com/v2/a2a/result?request_key=${request_key}`).then((res) => {
//                 if (res.data.result) {
//                     console.log(`[Result] ${JSON.stringify(res.data.result)}`);
//                     if (res.data.result.status === 'success') {
//                         clearInterval(timerId);
//                     }
//                 }
//             })
//         }, 1000)
//     })
// }
import {
  Networks,
  TransactionBuilder,
  Horizon,
  rpc,
  Contract,
  nativeToScVal,
  scValToNative,
  Address,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { requestAccess, signTransaction, getAddress, isAllowed, setAllowed } from "@stellar/freighter-api";

const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
const HORIZON_URL = "https://horizon-testnet.stellar.org";
const CONTRACT_ID = process.env.NEXT_PUBLIC_SKILLPAY_CONTRACT_ID || "CAY7S7AFTXJ6R7UAK3N3O4L5N6M7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1"; // Placeholder
const NETWORK_PASSPHRASE = Networks.TESTNET;

const sorobanServer = new rpc.Server(SOROBAN_RPC_URL);
const horizon = new Horizon.Server(HORIZON_URL);

export async function getBalance(publicKey) {
  try {
    const account = await horizon.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? native.balance : "0";
  } catch {
    return "0";
  }
}

export async function connectWallet() {
  if (typeof window === "undefined") return null;
  
  if (!(await isAllowed())) {
    await setAllowed();
  }
  
  const pubKeyObj = await requestAccess();
  if (typeof pubKeyObj !== "string" && 'error' in pubKeyObj) {
    throw new Error(pubKeyObj.error);
  }
  
  const res = await getAddress();
  return typeof res === "string" ? res : res.address;
}

export async function invokeContractFromFrontend(method, args) {
  const publicKey = await connectWallet();
  if (!publicKey) throw new Error("Wallet not connected");

  const sourceAccount = await sorobanServer.getAccount(publicKey);
  const contract = new Contract(CONTRACT_ID);

  let tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const prepared = await sorobanServer.prepareTransaction(tx);
  const signedXDR = await signTransaction(prepared.toXDR(), { network: "TESTNET" });
  
  // Reconstruct transaction from signed XDR
  const txToSubmit = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
  const sendResponse = await sorobanServer.sendTransaction(txToSubmit);
  
  if (sendResponse.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${JSON.stringify(sendResponse.errorResult)}`);
  }

  let getResponse = await sorobanServer.getTransaction(sendResponse.hash);
  let attempts = 0;
  while (getResponse.status === "NOT_FOUND" && attempts < 15) {
    await new Promise((r) => setTimeout(r, 1500));
    getResponse = await sorobanServer.getTransaction(sendResponse.hash);
    attempts += 1;
  }

  if (getResponse.status !== "SUCCESS") {
    throw new Error(`Transaction did not succeed: ${getResponse.status}`);
  }

  return {
    hash: sendResponse.hash,
    returnValue: getResponse.returnValue ? scValToNative(getResponse.returnValue) : null,
  };
}

export async function createAndFundChallenge(title, rewardAmount) {
  const publicKey = await connectWallet();
  if (!publicKey) throw new Error("Wallet not connected");

  // 1. create_challenge
  const createRes = await invokeContractFromFrontend("create_challenge", [
    addressScVal(publicKey),
    stringScVal(title),
    i128ScVal(Math.round(rewardAmount * 10000000)), // XLM -> stroops
    addressScVal("CDLZFC3SYJZAIFVFNDQB23YOSMEGGE3ZGB6FWE7Y2BTYM66Y4QOINXGA"), // Testnet native XLM SAC
  ]);

  const onChainId = createRes.returnValue;

  // 2. fund_reward_pool
  const fundRes = await invokeContractFromFrontend("fund_reward_pool", [
    addressScVal(publicKey),
    u64ScVal(onChainId),
  ]);

  return { onChainId: Number(onChainId), txHash: fundRes.hash };
}

export function addressScVal(publicKey) {
  return new Address(publicKey).toScVal();
}

export function stringScVal(value) {
  return nativeToScVal(value, { type: "string" });
}

export function i128ScVal(value) {
  return nativeToScVal(value, { type: "i128" });
}

export function u64ScVal(value) {
  return nativeToScVal(value, { type: "u64" });
}

import {
  Networks,
  TransactionBuilder,
  Horizon,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
} from "@stellar/stellar-sdk";
import { requestAccess, signTransaction, getAddress, isAllowed, setAllowed } from "@stellar/freighter-api";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK_PASSPHRASE = Networks.TESTNET;

// Platform escrow address — when user funds, XLM goes here as escrow
// In production this would be the Soroban contract address
const PLATFORM_ESCROW = "GBCPCCSQGQ33Q65GIDG43KOKWG2HKP7QGDLMDGRVLWMGJYVTBKKV3RDE";

const horizon = new Horizon.Server(HORIZON_URL);

/** Fetch XLM balance for any public key */
export async function getBalance(publicKey) {
  try {
    const account = await horizon.loadAccount(publicKey);
    const native = account.balances.find((b) => b.asset_type === "native");
    return native ? native.balance : "0";
  } catch {
    return "0";
  }
}

/** Connect Freighter wallet and return the user's public key */
export async function connectFreighter() {
  if (typeof window === "undefined") throw new Error("Cannot connect wallet server-side");

  // Check if Freighter is installed
  if (!window.freighter && !window.freighterApi) {
    throw new Error(
      "Freighter wallet not found. Please install the Freighter browser extension from freighter.app and try again."
    );
  }

  if (!(await isAllowed())) {
    await setAllowed();
  }

  const res = await getAddress();
  const address = typeof res === "string" ? res : res?.address;
  if (!address) {
    const access = await requestAccess();
    const addr = typeof access === "string" ? access : access?.address;
    if (!addr) throw new Error("Wallet access denied. Please approve the connection in Freighter.");
    return addr;
  }
  return address;
}

/**
 * Fund a challenge from the user's Freighter wallet.
 * Sends rewardAmount XLM to the platform escrow address,
 * signed by the user's Freighter wallet. Returns txHash.
 */
export async function fundChallengeFromWallet(rewardAmount, challengeTitle) {
  const publicKey = await connectFreighter();

  // Load the user's account from Horizon
  let account;
  try {
    account = await horizon.loadAccount(publicKey);
  } catch {
    throw new Error(
      "Your Freighter wallet address is not activated on Stellar Testnet. " +
      "Please fund it at https://laboratory.stellar.org/#account-creator?network=test"
    );
  }

  // Check balance
  const native = account.balances.find((b) => b.asset_type === "native");
  const balance = native ? parseFloat(native.balance) : 0;
  if (balance < rewardAmount + 1) {
    throw new Error(
      `Insufficient balance. You have ${balance.toFixed(2)} XLM but need at least ${rewardAmount + 1} XLM ` +
      `(${rewardAmount} for reward + fees).`
    );
  }

  // Build the transaction
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: PLATFORM_ESCROW,
        asset: Asset.native(),
        amount: String(rewardAmount),
      })
    )
    .addMemo(Memo.text(challengeTitle.slice(0, 28))) // max 28 bytes
    .setTimeout(30)
    .build();

  // Sign with Freighter
  let signedXDR;
  try {
    const result = await signTransaction(tx.toXDR(), {
      network: "TESTNET",
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    signedXDR = typeof result === "string" ? result : result?.signedTxXdr || result?.xdr;
  } catch (e) {
    throw new Error("Transaction signing was cancelled or failed: " + e.message);
  }

  if (!signedXDR) throw new Error("No signed transaction received from Freighter.");

  // Submit to Stellar Testnet
  const signedTx = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
  let response;
  try {
    response = await horizon.submitTransaction(signedTx);
  } catch (e) {
    const extras = e?.response?.data?.extras;
    const detail = extras?.result_codes?.transaction || extras?.result_codes?.operations?.[0] || e.message;
    throw new Error("Transaction failed: " + detail);
  }

  return { txHash: response.hash, walletAddress: publicKey };
}

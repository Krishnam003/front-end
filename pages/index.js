import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [captchaValue, setCaptchaValue] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState("");
  const [theme, setTheme] = useState("white"); 
  const [amountInput, setAmountInput] = useState(""); 
  const [userName, setUserName] = useState("Krishna");
  const [mobileNumber, setMobileNumber] = useState("344566363");
  const [email, setEmail] = useState("Krishna4@gmail.com");
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  function generateCaptcha() {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return captcha;
  }

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      try {
        const rawBalance = await atm.getBalance();
        const formattedBalance = ethers.utils.formatUnits(rawBalance, "ether");
        const wholeNumberBalance = parseInt(formattedBalance);
        setBalance(wholeNumberBalance);
      } catch (error) {
        console.error("Error fetching balance:", error.message);
      }
    }
  };

  const deposit = async () => {
    if (validateCaptcha() && atm) {
      try {
        const amount = parseFloat(amountInput);
        if (!isNaN(amount) && amount > 0) {
          let tx = await atm.deposit(ethers.utils.parseEther(amount.toString()));
          await tx.wait();
          getBalance();
          alert("Transaction successful!\nTransaction Hash: " + tx.hash);
          setCaptchaValue(generateCaptcha());
          setAmountInput("");
        } else {
          alert("Invalid amount. Please enter a valid positive number.");
        }
      } catch (error) {
        console.error("Deposit failed:", error);
        alert("Deposit failed. Please check the console for more details.");
      }
    }
  };

  const withdraw = async () => {
    if (validateCaptcha() && atm) {
      try {
        const amount = parseFloat(amountInput);
        if (!isNaN(amount) && amount > 0) {
          let tx = await atm.withdraw(ethers.utils.parseEther(amount.toString()));
          await tx.wait();
          getBalance();
          alert("Transaction successful!\nTransaction Hash: " + tx.hash);
          setCaptchaValue(generateCaptcha());
          setAmountInput("");
        } else {
          alert("Invalid amount. Please enter a valid positive number.");
        }
      } catch (error) {
        console.error("Withdrawal failed:", error);
        alert("Withdrawal failed. Please check the console for more details.");
      }
    }
  };

  const validateCaptcha = () => {
    if (captchaInput.toUpperCase() === captchaValue) {
      return true;
    } else {
      alert("Incorrect captcha. Please try again.");
      return false;
    }
  };

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "white" ? "orange" : "white"));
  };

  const updateDateTime = () => {
    setCurrentDateTime(new Date());
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance == undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <p>User Name: {userName}</p>
        <p>Mobile Number: {mobileNumber}</p>
        <p>Email: {email}</p>
        <label>
          Captcha: {obfuscateCaptcha(captchaValue)}
          <input
            type="text"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
          />
        </label>
        <label>
          Amount:
          <input
            type="text"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
          />
        </label>
        <button onClick={deposit}>Deposit</button>
        <button onClick={withdraw}>Withdraw</button>
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(updateDateTime, 1000); // Update every second
    return () => clearInterval(intervalId);
  }, []);

  return (
    <main className="container" style={{ backgroundColor: theme }}>
      <header>
        <h1>Metacrafters</h1>
        <button onClick={toggleTheme}>Toggle Theme</button>
        <p style={{ textAlign: "left", paddingLeft: "10px" }}>{currentDateTime.toString()}</p>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}

function obfuscateCaptcha(captcha) {
  return captcha
    .split("")
    .map((char) =>
      Math.random() < 0.5 ? char : Math.random() < 0.5 ? char.toUpperCase() : char.toLowerCase()
    )
    .join("");
}

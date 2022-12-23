import {ethers} from "ethers"
import {useEffect, useState, useRef} from "react"
import Request from "./Request";
import './App.css';
import rouletteJson from "./artifacts/contracts/Roulette.sol/Roulette.json"
import Header from "./Header";

const rouletteAddress = "0xc8Ee51B5C546c03af73c3D7AcaFCAb24B784910F"

function App() {
  const [account, setAccount] = useState(undefined)
  const [networkName, setNetworkName] = useState(undefined)
  const [requestStruct, setRequestStruct] = useState(undefined)
  const [provider, setProvider] = useState(undefined)
  const [currentRequestId, setCurrentRequestId] = useState("")
  const [betAmount, setBetAmount] = useState(0)
  const [colorContainer, setColorContainer] = useState("container")
  const [colorButton, setColorButton] = useState("button-29")

  const [txHash, setTxHash] = useState("")
  let [contract, setContract] = useState(undefined)
  
  //CHANGE NETWORK IF NOT CONNECTED TO GOERLI  
    const mainNetworks = {
    goerli: {
      "id": 1,
      "jsonrpc": "2.0",
      "method": "wallet_switchEthereumChain",
      "params": [
        {
          "chainId": "0x5",
        }
      ]
    }
    }
    const connectMetamaskMain = async (name) => { 
      await changeMainNetwork(name);
      document.location.reload(true)
    };
    const changeMainNetwork = async (name) => {
      try {
        //if (!window.ethereum) throw new Error("No crypto wallet found")
        await window.ethereum.request({
          ...mainNetworks["goerli"]
        })
      }catch (err) {
        console.log(err);
      }
    };

  async function wait(){
    return new Promise((resolve)=>{
      setTimeout(()=>resolve(),80000)
  })}

  const loadBlockchainData = async()=>{
    //fetch and set connected account
    const [account] = await window.ethereum.request({method: "eth_requestAccounts"})
    //console.log("Accounts: ",account))~~~~~~~~~~~~
    setAccount(account)
    console.log(account)
    //Connect to provider and getNetwork
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider._networkPromise
    //console.log(network)~~~~~~~~~~~~
    setNetworkName(network.name)

    //fetch contract
    contract = new ethers.Contract(rouletteAddress, rouletteJson.abi, provider)
    setContract(contract)
    //console.log(contract))~~~~~~~~~~~~
  }

  useEffect(() => {
    loadBlockchainData()
  },[])



  //CONTRACT FUNCTIONS:
  //1. Roll the roulette
  const RollRoulette = async(color,value)=>{
    const signer = provider.getSigner()
    const contract = new ethers.Contract(rouletteAddress, rouletteJson.abi, signer); //call contract from the signer
    const roll = await contract.connect(signer).roll(color,
    {
      value: ethers.utils.parseEther(value.toString()),
      gasPrice: ethers.utils.hexlify(parseInt(await provider.getGasPrice()))
    }
    )
    let tx = await roll.wait()
    //console.log(tx)
    console.log("TX:",tx)
    console.log("HASH",tx.transactionHash)
    setTxHash(tx.transactionHash)

    //get value from tx
    let requestId = tx.logs[3].data
    console.log("ID:",requestId)
    setCurrentRequestId(requestId)
    getStatus(requestId)
    await wait()
    getStatus(requestId)
  }

  //2. Get status of a RouletteRoll, returns struct
  const getStatus = async(value)=>{
    const struct = await contract.getStatus(value)
    struct.player==="0x0000000000000000000000000000000000000000"?
    setRequestStruct(undefined):setRequestStruct(struct)
    //~~~~~~~~~~~
    //console.log("Objeto:",requestStruct)~~~~~~~
  }

  async function onSubmt(evt){
    evt.preventDefault()
    try{
      await getStatus(evt.target._id.value)
    }
    catch(err){
      setRequestStruct(undefined)
    }
    evt.target._id.value=""
    //console.log(evt.target._id.value)~~~~~~
  }

  async function changeColor(numb){
    if(numb==="0"){
      setColorContainer("container-black")
      setColorButton("button-black")
    }
    else if(numb==="1"){
      setColorContainer("container-red")
      setColorButton("button-red")

    }
  }

  async function onRoll(evt){
    evt.preventDefault()
    try{
      //console.log("Color: red1,black0",evt.target.colors.value)
      //console.log("amount",evt.target.val.value)
      changeColor(evt.target.colors.value)
      await getStatus("0")
      setBetAmount(evt.target.val.value)
      await RollRoulette(evt.target.colors.value,evt.target.val.value)
    }
    catch(err){
      console.log("ERROR SPINNING:",err)
    }
    evt.target.val.value=""
    //console.log(evt.target._id.value)~~~~~~
  }

  async function handleView(){
    console.log("CLICK HANDLE VIEW",txHash)
    window.open(`https://goerli.etherscan.io/tx/${txHash}`, '_blank').focus();
  }

  return (
    <div className="App">
      <Header wallet={account} network={networkName}/>

      {networkName==="goerli"?
      (<div className="bodyy">
        <div className={colorContainer}>
        <div>
          <form onSubmit={evt=> onRoll(evt)}>
            <label>Amount:</label>
            <input type="number" name="val" placeholder="Insert amount" min="0.001" step="0.001" defaultValue={0.001} required />
            <br></br><label htmlFor="colors">Choose a color:</label>
            <select className="select" name="colors" id="cars">
                <option className="optionBlack" value={"0"}>Black</option>
                <option className="optionRed" value={"1"}>Red</option>
              </select><br></br><br></br>
            <button className={colorButton}>Roll Roulette now!</button>
          </form>
        </div>
            
            {/* Send ID to get status of a request */}
            <div>
              <form onSubmit={evt=> onSubmt(evt)}>
                <label>Get status: </label>
                <input name="_id" placeholder="Write your requestId"/>
                <button className={colorButton}>Submit</button>
              </form>
            </div>

           

            {/* Show requests: */}
            {requestStruct===undefined?
            <div>No transaction yet.</div>:
            (<div><div><br></br><Request struct={requestStruct} reqId={currentRequestId} amount={betAmount}/></div>
              <div>
                <button className={colorButton} onClick={handleView}>View transaction on block explorer</button>
              </div>
            </div>)}
            

          </div>
          
      </div>):
      (<div>
        <h2>Please switch to Goerli Network</h2>
        <div>
            <button onClick={()=>connectMetamaskMain("goerli")} className='button-29'>Switch to Goerli Network</button>
        </div>
      </div>)
      }
      
    </div>
  );
}

export default App;

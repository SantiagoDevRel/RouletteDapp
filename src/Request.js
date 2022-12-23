import './App.css';
import Spinner from './Spinner';

export default function Request({struct,reqId, amount}) {

    console.log(struct)
    return (
        <div>
            <div>Request id: {reqId}</div>
            <div>Player: {struct.player}</div>
            <div>Amount: {amount} ETH</div>
            <div>{struct.fulfilled?"Roulette Rolled":
                (<div>Rolling...
                    {struct.color===1?<Spinner color={"red"}/>:<Spinner color={"black"}/>}
                </div>)}<br></br>
            </div>
            <div>{struct.color===1?`You choose Red`:`You choose Black`}</div>
            {struct.fulfilled?
            (<div>
                <div>{struct.userWin?`Congrats!, you won ${amount} ETH!`:`Try next time, you lost ${amount} ETH`}</div>
            </div>)
            :
            (<div>              
            </div>)}            
        </div>
    )
}

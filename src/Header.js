import HeaderStyles from "./Header.module.css"


export default function Header({wallet, network}) {

  return ( 
    <div  className={HeaderStyles.mainn}>            
        <div><h2>Welcome to the RouletteDapp</h2></div>
        <div>{wallet}</div><br></br>
        <div>Connected to: {network === "homestead" ? `${"ethereum"}` : `${network}`}</div>
    </div>
  )
}

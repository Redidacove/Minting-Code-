import { useState ,useEffect} from 'react'
import * as fcl from "@onflow/fcl";
import * as types from "@onflow/types";
import './App.css'
import {create} from "ipfs-http-client";

  async function mintNFT(type, url) {
      try {
        const res = await fcl.mutate({
          cadence: `
                  import FlowNftMint from 0x1609f3abe1914811
                  import NonFungibleToken from 0x631e88ae7f1d7c20
                  import MetadataViews from 0x631e88ae7f1d7c20
                  
                  transaction(type: String, url: String) {
  
                      let recipientCollection: &FlowNftMint.Collection{NonFungibleToken.CollectionPublic}
  
                      prepare(acct: AuthAccount) {
                          // Gives the signer a Collection if they don't already have it.
  
                          if acct.borrow<&FlowNftMint.Collection>(from: FlowNftMint.CollectionStoragePath) == nil {
                              acct.save(<- FlowNftMint.createEmptyCollection(), to: FlowNftMint.CollectionStoragePath)
                              acct.link<&FlowNftMint.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(FlowNftMint.CollectionPublicPath, target:FlowNftMint.CollectionStoragePath)
                          }
  
                          self.recipientCollection = acct.getCapability(FlowNftMint.CollectionPublicPath)
                                                              .borrow<&FlowNftMint.Collection{NonFungibleToken.CollectionPublic}>()!
                          }
                          execute{
                              FlowNftMint.mintNFT(recipient: self.recipientCollection, type: type, url: url)
                              log("minted a nft")
                          }
                  }
                  `,
              args: (arg, t) => [arg(type, t.String), arg(url, t.String)],
              limit: 9999,
          });
  
        fcl.tx(res).subscribe((res) => {
          if (res.status === 4 && res.errorMessage === "") {
            window.location.reload(false);
              window.alert("NFT Minted!")
          }
        });
  
          console.log("txid", res);
          localStorage.setItem("txid",res);
        let txnId=res;

      } 
      catch (error) {
        console.log("err", error);
      }
    }
  
function App() {
  const [user,setUser]=useState();
  fcl
    .config()
    .put("accessNode.api","https://testnet.onflow.org")
    .put("discovery.wallet","https://fcl-discovery.onflow.org/testnet/authn")
    .put("discovery.authn.include","0x82ec283f88a62e65")

  useEffect(()=>{
    fcl.currentUser().subscribe(setUser);
  },[]);

  console.log(user);
  
  return (
    <>
      <div>
        <h1>User address:{user?.addr}</h1>
           <div>
            {/* <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a" alt="Mad Dog"/> */}
            <h3>Mad Dog</h3>
            <button onClick={() => {
              if(user.addr)
              mintNFT("Mad Dog", "https://images.unsplash.com/photo-1517849845537-4d257902454a")
              }}>Mint</button>
        </div>        
        {/* <div>
          <h2>{txnId}</h2>
        </div> */}
        <button onClick={()=>fcl.authenticate()}>LogIn</button>
        <button onClick={()=>fcl.unauthenticate()}>LogOut</button>

      </div>
    </>
  )
}

export default App

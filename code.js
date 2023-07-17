

function MintComponent() {
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
                            acct.save(<- FlowNftMint.createEmptyCollection(), to: FlowTutorialMint.CollectionStoragePath)
                            acct.link<&FlowNftMint.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection}>(FlowNftMint.CollectionPublicPath, target:FlowNftMint.CollectionStoragePath)
                        }

                        self.recipientCollection = signer.getCapability(FlowNftMint.CollectionPublicPath)
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
            window.alert("NFT Minted!")
            window.location.reload(false);
        }
      });

      console.log("txid", res);
    } 
    catch (error) {
      console.log("err", error);
    }
  }
}

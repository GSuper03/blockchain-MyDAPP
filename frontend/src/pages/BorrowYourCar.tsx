import React, {useEffect, useState} from "react";
import {BorrowYourCarContract, MaoMaoTokenContract, web3} from "../utils/contracts";
import "./BorrowYourCar.css"
import {Uint256} from "web3";
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
// TODO change according to your configuration
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

interface Car{
    tokenId: Uint256;
    owner: string;
    borrower: string;
    borrowUntil :Uint256;
}
const photoUrls: string[] = [
    "https://th.bing.com/th/id/OIP.c-1Zei5GFxEuD8Adbh0nJQHaHa?w=167&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.Bg9Lkrxr3xHVCfME791AiwAAAA?w=203&h=284&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.myd1Eia4KD4wA60juwCMOQHaEo?w=279&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.QmmEncX8J4yCDCEGh1g_vAHaEL?w=328&h=185&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.D-kkU1nbLABqo4aCwaSb3gHaEo?w=285&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.6iipB68alib1kMVIyO7QkQAAAA?w=285&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.MeItGsAFmpHiUPJ8Dg5NHwHaEK?w=333&h=187&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.NDZGw-6zjSORFz0sYHfnbAAAAA?w=268&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.g2xEalaxhE-uIAzYQCo6zAHaFE?w=279&h=191&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.fnyLIeVTnfPDnKGzFzH1GAHaE7?w=366&h=200&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.jdOoEmfpHLcLPVDno4bZbQHaO0?w=175&h=350&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.E5QOJ-O9ru-M7n22L4v-cQHaE8?w=244&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.yvbOfvLIoeQPILnyCXkibQHaEK?w=298&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.U89uDjxBPfkuZodzoKwctAHaE7?w=297&h=197&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.ZIlLZJnrW3Cjt4duNwfZnwHaE8?w=253&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.msj9cB1uiuA82I_WtRYs0QHaFj?w=233&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.iSY5zXacONx6zpaTNaIcYAHaEK?w=318&h=180&c=7&r=0&o=5&pid=1.7",
    "https://th.bing.com/th/id/OIP.9cQZr7oLuyC1UHGc1QBQiwHaFj?w=236&h=180&c=7&r=0&o=5&pid=1.7",
];
function BorrowYourCar() {
    const [currentAccount, setcurrentAccount] = useState("");
    const [ownedcars, setownedcars] = useState([{} as Car] );
    const [othercars, setothercars] = useState([{} as Car] );
    const [borrowedcars, setborrowedcars] = useState([{} as Car] );
    const [totalcars, settotalcars] = useState(0);
    const [totalfreecars, settotalfreecars] = useState(0);
    const [carTokenId, setcarTokenId] = useState("");
    const [duration, setduration] = useState("");
    const [accountBalance, setAccountBalance] = useState(0);

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setcurrentAccount(accounts[0])
                }
            }
        }
        initCheckAccounts();
        getAccount();
    }, [])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (MaoMaoTokenContract) {
                // @ts-ignore
                setAccountBalance(await MaoMaoTokenContract.methods.balanceOf(currentAccount).call());
                getFreeCars();
                getOwndedCars();
                setshowcar(false);
                console.log(accountBalance);
            } else {
                alert('Contract not exists.')
            }
        }

        if(currentAccount !== '') {
            getAccountInfo()
        }
    }, [currentAccount])

    const onClaimTokenAirdrop = async () => {
        if(currentAccount === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (MaoMaoTokenContract) {
            try {
                await MaoMaoTokenContract.methods.airdrop().send({
                    from: currentAccount,
                    gas: "6721975"
                })
                alert('You have claimed MaoMaoCoin.')
                // @ts-ignore
                setAccountBalance(await MaoMaoTokenContract.methods.balanceOf(currentAccount).call());
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    const getAccount = async () => {
        if (BorrowYourCarContract) {
            try {
                const accounts = await web3.eth.getAccounts();
                if (accounts.length === 0) {
                    alert('Not connected yet.');
                    return;
                }
                setcurrentAccount(accounts[0]);
                console.log(currentAccount);
            } catch (error) {
                // 处理获取账户时的错误
                console.error(error);
            }
        }
    };
    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // TODO Chain-ID
                    chainName: GanacheTestChainName, // TODO Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // TODO RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setcurrentAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }
    const NFT = async () => {
        try{
            // @ts-ignore
            console.log(currentAccount);
            // @ts-ignore
            const result = await BorrowYourCarContract.methods.CarNFT(currentAccount).send({
                from:currentAccount,
                gas: "6721975"
            })
            console.log(result);
            setownedcars(await BorrowYourCarContract.methods.getOwnedCars().call({
                from:currentAccount,
            }));
            settotalcars(setownedcars.length);
        } catch (error : any){
            alert(error.message)
        }
    }

    const getOwndedCars = async () => {
        try{
            setownedcars(await BorrowYourCarContract.methods.getOwnedCars().call({
                from:currentAccount,
            }));
            settotalcars(ownedcars.length);
        } catch (error : any){
            alert(error.message)
        } finally {
            console.log(ownedcars);
        }
    }

    const getFreeCars = async () => {
        try{
            setothercars(await BorrowYourCarContract.methods.getFreeCars().call({
                from:currentAccount,
            }));
            console.log(othercars);
            settotalfreecars(othercars.length);
            console.log(othercars);
        } catch (error : any){
            alert(error.message)
        }
    }

    const getBorrowedCars = async () => {
        try{
            setborrowedcars(await BorrowYourCarContract.methods.getBorrowedCars().call({
                from:currentAccount,
            }));
            console.log(borrowedcars);
        } catch (error : any){
            alert(error.message)
        }
    }


    const borrow = async (Id : Uint256) => {
        try{
            // @ts-ignore
            await MaoMaoTokenContract.methods.approve(BorrowYourCarContract.options.address, parseInt(duration)).send({
                from: currentAccount,
                gas: "6721975"
            })
            // @ts-ignore
            const result = await BorrowYourCarContract.methods.borrow(Id, parseInt(duration)).send({
                from: currentAccount,
                gas: "6721975"
            });
            console.log(othercars);
            settotalfreecars(othercars.length);
            setduration("");
            // @ts-ignore
            setAccountBalance(await MaoMaoTokenContract.methods.balanceOf(currentAccount).call());
            alert("borrow!");
        } catch (error : any){
            alert(error.message)
        }
    }

    const back = async (Id : Uint256) => {
        try{
            // @ts-ignore
            await BorrowYourCarContract.methods.back(Id, 60).send({
                from: currentAccount,
                gas: "6721975"
            });
            console.log(othercars);
            alert("back!");
        } catch (error : any){
            alert(error.message)
        }
    }

    const toTimeString = (timestamp: number): string => {
        if (+timestamp === 0 || timestamp  < (new Date().valueOf() / 1000)) return "Not being borrowed yet"
        // console.log(+timestamp, typeof timestamp);
        return new Date(+timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }
    const toIdString = (id:number): string => {
        if(id == null) return "Not being borrowed";
        return id.toString();
    }

    const [showcar, setshowcar] = useState(false);
    const setShowCar = () => {
        console.log(carTokenId);
        setshowcar(true);
        console.log(showcar);
    }

    const setcartokenid = (id : number) => {
        if(id < 0) alert("error TokenId");
        setcarTokenId(String(id));
        setshowcar(false);
    }

    return (
        <div>
    <h1>User address: {currentAccount}</h1>
    <div>
        <button type="button" className="btn btn-primary" onClick={onClickConnectWallet}>Connect wallet</button>
    </div>
    <h1>MaoMaoCoin Balance: {Number(accountBalance)}</h1>
    <h1>Cars Borrow</h1>
    <div>
         <button type="button" className="btn btn-primary" onClick={onClaimTokenAirdrop}>Get MaoMaoAir</button>
    </div>
    <div>
        <button type="button" className="btn btn-primary" onClick={NFT}>Come car</button>
    </div>
    <div>
        <button type="button" className="btn btn-primary" onClick={getOwndedCars}>show owned cars</button>
    </div>
    <div>
        <h2 style={{fontSize : '25px'}}>Your cars</h2>
        <table className= "table">
            <thead>
            <tr>
                <th scope="col">TokenId</th>
                <th scope="col">Owner</th>
                <th scope="col">Borrower</th>
                <th scope="col">BorrowUntil</th>
                <th scope="col">Photo</th>
            </tr>
            </thead>
            <tbody>
            {ownedcars.map((item, index) => (
                <tr key={index}>
                    <td>{toIdString(Number(item.tokenId))}</td>
                    <td>{item.owner}</td>
                    <td>{item.borrower}</td>
                    <td>{toTimeString(Number(item.borrowUntil).valueOf())}</td>
                    <td>
                        <img src= {photoUrls[Number(item.tokenId)]}/>
                    </td>
                </tr>
                ))}
            </tbody>
        </table>
    </div>
    <div>
        <button type="button" className="btn btn-primary" onClick={getFreeCars}>show free cars</button>
    </div>
    <div>
        <h2 style={{fontSize : '25px'}}>Free cars</h2>
        <div>
            <label>Time:</label>
            <input
                type="text"
                placeholder="Duration(s)"
                value={duration}
                onChange={(e) => setduration(e.target.value)}
                defaultValue={" "}
            />
        </div>
        <table className= "table">
            <thead>
            <tr>
                <th scope="col">TokenId</th>
                <th scope="col">Owner</th>
                <th scope="col">Borrower</th>
                <th scope="col">BorrowUntil</th>
                <th scope="col">Photo</th>
                <th scope="col">Take</th>
            </tr>
            </thead>
            <tbody>
            {othercars.filter((item) => {
                return +Number(item.borrowUntil) === 0 || Number(item.borrowUntil) < (new Date().valueOf() / 1000);
            }).map((item, index) => (
                <tr key={index}>
                    <td>{toIdString(Number(item.tokenId))}</td>
                    <td>{item.owner}</td>
                    <td>{item.borrower}</td>
                    <td>{toTimeString(Number(item.borrowUntil).valueOf())}</td>
                    <td>
                        <img src= {photoUrls[Number(item.tokenId)]}/>
                    </td>
                    <td>
                        <button type="button" className="btn btn-secondary" onClick={() => borrow(item.tokenId)}>Borrow</button>
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
            <div>
                <button type="button" className="btn btn-primary" onClick={getBorrowedCars}>show borrowed cars</button>
            </div>
            <div>
                <h2 style={{fontSize : '25px'}}>Borrowed cars</h2>
                <table className= "table">
                    <thead>
                    <tr>
                        <th scope="col">TokenId</th>
                        <th scope="col">Owner</th>
                        <th scope="col">Borrower</th>
                        <th scope="col">BorrowUntil</th>
                        <th scope="col">Photo</th>
                        <th scope="col">Take</th>
                    </tr>
                    </thead>
                    <tbody>
                    {borrowedcars.filter((item) => {
                        return Number(item.borrowUntil) > (new Date().valueOf() / 1000);
                    }).map((item, index) => (
                        <tr key={index}>
                            <td>{toIdString(Number(item.tokenId))}</td>
                            <td>{item.owner}</td>
                            <td>{item.borrower}</td>
                            <td>{toTimeString(Number(item.borrowUntil).valueOf())}</td>
                            <td>
                                <img src= {photoUrls[Number(item.tokenId)]}/>
                            </td>
                            <td>
                                <button type="button" className="btn btn-secondary" onClick={() => back(item.tokenId)}>Back</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
    <div>
        <h2 style={{fontSize : '25px'}}>Search car</h2>
        <div>
            <label>Go:</label>
            <input
                type="text"
                placeholder="Car TokenId"
                value={carTokenId}
                onChange={(e) => setcartokenid(Number(e.target.value))}
                defaultValue={" "}
            />
            <button type="button" className="btn btn-secondary" onClick={setShowCar}>Search</button>
        </div>
        <div>
            {showcar ?
                    (<div>
                        <table className= "table">
                            <thead>
                            <tr>
                                <th scope="col">TokenId</th>
                                <th scope="col">Owner</th>
                                <th scope="col">Borrower</th>
                                <th scope="col">BorrowUntil</th>
                                <th scope="col">Photo</th>
                            </tr>
                            </thead>
                            <tbody>
                            {othercars.filter((item) => {
                                return item.tokenId == carTokenId;
                            }).map((item, index) => (
                                <tr key={index}>
                                    <td>{toIdString(Number(item.tokenId))}</td>
                                    <td>{item.owner}</td>
                                    <td>{item.borrower}</td>
                                    <td>{toTimeString(Number(item.borrowUntil).valueOf())}</td>
                                    <td>
                                        <img src= {photoUrls[Number(item.tokenId)]}/>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>):
                    (<div>

                    </div>)}
        </div>
    </div>
</div>
    )
}

export default BorrowYourCar;
import {
    loadFixture
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import exp from "constants";
import hre from "hardhat";
import { BEP20Token, MetaMixx } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("my contract(Bep20Token, MeMetaMixx", function() {

    async function deployContractsFixture() {
        const name = "Bep20Token";
        const symbol = "Bep20Coin";
        const decimals = 9;
        const totalSupply = 1000_000;

        const signers = await hre.ethers.getSigners();
        const owner = signers[0];
        const otherAccounts = signers.slice(1, 10);

        const Bep20Token_Factory = await hre.ethers.getContractFactory("BEP20Token");
        const Bep20Token = await Bep20Token_Factory.deploy(name, symbol, decimals, totalSupply);

        const referralId = "123abc";

        const MetaMix_Factory = await hre.ethers.getContractFactory("MetaMixx");
        const MetaMixx = await MetaMix_Factory.deploy(referralId, await Bep20Token.getAddress());
        return { Bep20Token, owner, otherAccounts, name, symbol, decimals, totalSupply, MetaMixx };
    }

    

    describe("Deployment", function() {
        let Bep20Token: BEP20Token;
        let owner: HardhatEthersSigner;
        let otherAccounts: HardhatEthersSigner[];
        let name: string;
        let symbol: string;
        let decimals: number;
        let totalSupply: number; 
        let MetaMixx: MetaMixx;
        let firstUser: HardhatEthersSigner;
        let secondUser: HardhatEthersSigner;
        let thirdUser: HardhatEthersSigner;
        let fourthUser: HardhatEthersSigner;
        let companyWallet: HardhatEthersSigner;        
        let newOwner: HardhatEthersSigner;
        let updateUser: HardhatEthersSigner;
        let newOwnerReferralId: string;
        let firstReferralId: string;
        let secondReferralId: string;
        let thirdReferralId: string;
        let fourthReferralId: string;

        
        beforeEach(async function () {
            ({ Bep20Token, owner, otherAccounts, name, symbol, decimals, totalSupply, MetaMixx } = await loadFixture(deployContractsFixture));
            console.log(`owner address: ${owner.address}, other: ${otherAccounts[0].address}`);
            console.log(`contract owner: ${await MetaMixx.contractOwner()}`);
            firstUser = otherAccounts[0];
            secondUser = otherAccounts[1];
            thirdUser = otherAccounts[2];
            fourthUser = otherAccounts[3];
            companyWallet = otherAccounts[4];
            newOwner = otherAccounts[5];
            updateUser = otherAccounts[6];
            newOwnerReferralId = "newowner1234";
            firstReferralId = "first123";
            secondReferralId = "second123";
            thirdReferralId = "thrid123";
            fourthReferralId = "fourth123";
        });

        it("Should delopy Our contracts", async function () {
            expect(await Bep20Token.decimals()).to.equal(decimals);
            expect(await Bep20Token.balanceOf(owner)).to.equal(1000_000 * 10 ** decimals);
        });

        it("Should approve, transfer and buyPackage successfully", async function() {
            
            console.log("before owner balance: ", await Bep20Token.balanceOf(owner));
            // const firstUser = otherAccounts[0];
            // const secondUser = otherAccounts[1];
            // const thirdUser = otherAccounts[2];
            // const fourthUser = otherAccounts[3];
            // const companyWallet = otherAccounts[4];
            // const firstReferralId = "first123";
            // const secondReferralId = "second123";
            // const thirdReferralId = "thrid123";
            // const fourthReferralId = "fourth123";

            console.log("before firstUser balance: ", await Bep20Token.balanceOf(firstUser));
            console.log("before firstUser balance: ", await Bep20Token.balanceOf(secondUser));
            console.log("before firstUser balance: ", await Bep20Token.balanceOf(thirdUser));
            console.log("before firstUser balance: ", await Bep20Token.balanceOf(fourthUser));

            // Transfer Bep20Token to Users.
            await Bep20Token.connect(owner).transfer(firstUser.address, 1000 * 10 ** decimals);
            await Bep20Token.connect(owner).transfer(secondUser.address, 1000 * 10 ** decimals);
            await Bep20Token.connect(owner).transfer(thirdUser.address, 1000 * 10 ** decimals);
            await Bep20Token.connect(owner).transfer(fourthUser.address, 1000 * 10 ** decimals);

            console.log("after owner balance: ", await Bep20Token.balanceOf(owner)) ;

            expect(await Bep20Token.balanceOf(firstUser)).to.equal(1000 * 10 ** decimals);
            expect(await Bep20Token.balanceOf(secondUser)).to.equal(1000 * 10 ** decimals);
            expect(await Bep20Token.balanceOf(thirdUser)).to.equal(1000 * 10 ** decimals);
            expect(await Bep20Token.balanceOf(fourthUser)).to.equal(1000 * 10 ** decimals);

            console.log("after firstUser balance: ", await Bep20Token.balanceOf(firstUser)); 
            console.log("after secondUser balance: ", await Bep20Token.balanceOf(secondUser)); 
            console.log("after thirdUser balance: ", await Bep20Token.balanceOf(thirdUser)); 
            console.log("after fourthUser balance: ", await Bep20Token.balanceOf(fourthUser));

            // get MetxMex contract addreess
            const MetaMixContractAddress = await MetaMixx.getAddress();
            console.log("MetxMex address: ", MetaMixContractAddress);

            // await Bep20Token.connect(firstUser).approve(owner.address, 1000 * 10 ** decimals);
            // console.log("first User", firstUser.address);
            // console.log("allowance[firstUser][owner]: ", await Bep20Token.allowance(firstUser, owner));

            // approve to Metax
            await Bep20Token.connect(firstUser).approve(MetaMixContractAddress, 1000 * 10 ** decimals);
            await Bep20Token.connect(secondUser).approve(MetaMixContractAddress, 1000 * 10 ** decimals);
            await Bep20Token.connect(thirdUser).approve(MetaMixContractAddress, 1000 * 10 ** decimals);
            await Bep20Token.connect(fourthUser).approve(MetaMixContractAddress, 1000 * 10 ** decimals);

            // await Bep20Token.connect(firstUser).approve(owner, 1000 * 10 ** decimals);
            // console.log("allowance[firstUser][owner]: ", await Bep20Token.allowance(firstUser, owner));

            console.log("allowance[firutUser][MetaMixContractAddress]: ", await Bep20Token.allowance(firstUser, MetaMixx));
            expect(await Bep20Token.allowance(firstUser, MetaMixContractAddress)).to.equal(1000 * 10 ** decimals);
            
            console.log("before buy firstUser balance: ", await Bep20Token.balanceOf(firstUser)); 
            console.log("before buy secondUser balance: ", await Bep20Token.balanceOf(secondUser)); 
            console.log("before buy thirdUser balance: ", await Bep20Token.balanceOf(thirdUser)); 
            console.log("before buy fourthUser balance: ", await Bep20Token.balanceOf(fourthUser)); 
            console.log("owner registered state", await MetaMixx.getUser(owner.address));

            // buy package
            await MetaMixx.connect(owner).updateCompanyWallet(companyWallet.address);
            console.log("company wallet", await MetaMixx.companyWallet());
            await MetaMixx.connect(firstUser).buyPackage(firstReferralId, owner.address, 1);
            console.log("first user buy package");
            console.log("after buy user owner balance: ", await Bep20Token.balanceOf(owner));
            console.log("after buy firstUser balance: ", await Bep20Token.balanceOf(firstUser)); 
            console.log("after buy secondUser balance: ", await Bep20Token.balanceOf(secondUser)); 
            console.log("after buy thirdUser balance: ", await Bep20Token.balanceOf(thirdUser)); 
            console.log("after buy fourthUser balance: ", await Bep20Token.balanceOf(fourthUser));
            console.log("after buy company wallet balance: ", await Bep20Token.balanceOf(companyWallet));
            
            await MetaMixx.connect(secondUser).buyPackage(secondReferralId, owner.address, 1);
            console.log("second user buy package");
            console.log("after buy user owner balance: ", await Bep20Token.balanceOf(owner));
            console.log("after buy firstUser balance: ", await Bep20Token.balanceOf(firstUser)); 
            console.log("after buy secondUser balance: ", await Bep20Token.balanceOf(secondUser)); 
            console.log("after buy thirdUser balance: ", await Bep20Token.balanceOf(thirdUser)); 
            console.log("after buy fourthUser balance: ", await Bep20Token.balanceOf(fourthUser));
            console.log("after buy company wallet balance: ", await Bep20Token.balanceOf(companyWallet));

            await MetaMixx.connect(thirdUser).buyPackage(thirdReferralId, secondUser.address, 1);
            console.log("third user buy package");
            console.log("after buy user owner balance: ", await Bep20Token.balanceOf(owner));
            console.log("after buy firstUser balance: ", await Bep20Token.balanceOf(firstUser)); 
            console.log("after buy secondUser balance: ", await Bep20Token.balanceOf(secondUser)); 
            console.log("after buy thirdUser balance: ", await Bep20Token.balanceOf(thirdUser)); 
            console.log("after buy fourthUser balance: ", await Bep20Token.balanceOf(fourthUser));
            console.log("after buy company wallet balance: ", await Bep20Token.balanceOf(companyWallet));
            await MetaMixx.connect(fourthUser).buyPackage(fourthReferralId, thirdUser.address, 1);

            console.log("fourth user buy package");
            console.log("after buy user owner balance: ", await Bep20Token.balanceOf(owner));
            console.log("after buy firstUser balance: ", await Bep20Token.balanceOf(firstUser)); 
            console.log("after buy secondUser balance: ", await Bep20Token.balanceOf(secondUser)); 
            console.log("after buy thirdUser balance: ", await Bep20Token.balanceOf(thirdUser)); 
            console.log("after buy fourthUser balance: ", await Bep20Token.balanceOf(fourthUser));
            console.log("after buy company wallet balance: ", await Bep20Token.balanceOf(companyWallet));

            expect((await MetaMixx.getUser(fourthUser.address)).referralId).to.equal(fourthReferralId);

            console.log("thirdUser", thirdUser.address);
            let thirdUserInfo: MetaMixx.UserStruct = await MetaMixx.getUser(thirdUser.address);
            console.log(`thirdUserInfo => referralId : ${thirdUserInfo.referralId}, parentReferral: ${thirdUserInfo.parentReferral}, level: ${thirdUserInfo.level}`);
            for (let i = 0; i < thirdUserInfo.childReferrals.length; i++) {
                console.log(`child ${i+1}: ${thirdUserInfo.childReferrals[i]}`);
            }

            let secondUserInfo: MetaMixx.UserStruct = await MetaMixx.getUser(secondUser.address);
            for (let i = 0; i < secondUserInfo.childReferrals.length; i++) {
                console.log(`child ${i+1}: ${secondUserInfo.childReferrals[i]}`);
            }

            console.log("Update User", await MetaMixx.getUser(thirdUser));
            await MetaMixx.connect(owner).updateUser(thirdUser, updateUser);
            console.log("After update thirdUser", await MetaMixx.getUser(updateUser));
            console.log("After update secondUser", await MetaMixx.getUser(secondUser));
            console.log("secondUser", secondUser.address);

            thirdUserInfo = await MetaMixx.getUser(updateUser.address);
            console.log(`thirdUserInfo => referralId : ${thirdUserInfo.referralId}, parentReferral: ${thirdUserInfo.parentReferral}, level: ${thirdUserInfo.level}`);
            for (let i = 0; i < thirdUserInfo.childReferrals.length; i++) {
                console.log(`child ${i+1}: ${thirdUserInfo.childReferrals[i]}`);
            }

            secondUserInfo  = await MetaMixx.getUser(secondUser.address);
            for (let i = 0; i < secondUserInfo.childReferrals.length; i++) {
                console.log(`child ${i+1}: ${secondUserInfo.childReferrals[i]}`);
            }

            thirdUserInfo = await MetaMixx.getUser(thirdUser.address);

            console.log("after thirdUser", await MetaMixx.getUser(thirdUser.address));

            console.log("newOwner", newOwner.address);
            await MetaMixx.connect(owner).updateOwner(newOwner);
            console.log("newOnwer", await MetaMixx.contractOwner());
            console.log("newOwner info", await MetaMixx.getUser(newOwner))
            expect((await MetaMixx.contractOwner())).to.equal(newOwner);
        });
    });


});